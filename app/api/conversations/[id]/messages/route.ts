import { requireAuth } from "@/components/auth/auth-require";
import { createClient } from "@/lib/supabase/server";
import { rateLimiters } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/sanitization";
import { NextResponse } from "next/server";

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const clientIp = getClientIp(request);
    if (rateLimiters.createResponse.isRateLimited(clientIp)) {
      return NextResponse.json(
        { success: false, error: "请求过于频繁，请稍后再试" },
        { status: 429 },
      );
    }

    const body = await request.json();
    const { content, messageType = "text", imageUrl } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { success: false, error: "消息内容不能为空" },
        { status: 400 },
      );
    }

    const sanitizedContent = sanitizeInput(content, { maxLength: 5000, allowNewlines: true });

    const supabase = await createClient();

    // Verify user has access to this conversation
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", id)
      .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { success: false, error: "对话不存在或无权访问" },
        { status: 404 },
      );
    }

    // Check if there's a pending message request from the other user
    const otherUserId = conversation.user_a_id === user.id
      ? conversation.user_b_id
      : conversation.user_a_id;

    const { data: requestRecord } = await supabase
      .from("message_requests")
      .select("status")
      .eq("conversation_id", id)
      .eq("receiver_id", user.id)
      .single();

    // If there's a pending request, check if user has already sent a message
    if (requestRecord?.status === "pending") {
      const { data: existingMessages } = await supabase
        .from("messages")
        .select("id")
        .eq("conversation_id", id)
        .eq("sender_id", user.id);

      if (existingMessages && existingMessages.length > 0) {
        return NextResponse.json(
          { success: false, error: "对方尚未接受你的消息请求，请等待对方回应" },
          { status: 403 },
        );
      }
    }

    // Insert message
    const { data: message, error: msgError } = await supabase
      .from("messages")
      .insert({
        conversation_id: id,
        sender_id: user.id,
        content: sanitizedContent,
        message_type: messageType,
        image_url: imageUrl || null,
      })
      .select()
      .single();

    if (msgError || !message) {
      return NextResponse.json(
        { success: false, error: "发送消息失败" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 401 },
    );
  }
}
