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
) {
  try {
    const user = await requireAuth();

    const clientIp = getClientIp(request);
    if (rateLimiters.createResponse.isRateLimited(clientIp)) {
      return NextResponse.json(
        { success: false, error: "请求过于频繁，请稍后再试" },
        { status: 429 },
      );
    }

    const body = await request.json();
    const { content, messageType = "text", imageUrl, wishContextId, targetUserId } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { success: false, error: "消息内容不能为空" },
        { status: 400 },
      );
    }

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: "目标用户 ID 不能为空" },
        { status: 400 },
      );
    }

    const sanitizedContent = sanitizeInput(content, { maxLength: 5000, allowNewlines: true });

    const supabase = await createClient();

    // Check if conversation already exists
    let conversationId: string;

    const { data: existingConversation, error: findError } = await supabase
      .from("conversations")
      .select("id")
      .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
      .or(`user_a_id.eq.${targetUserId},user_b_id.eq.${targetUserId}`)
      .single();

    if (existingConversation && !findError) {
      conversationId = existingConversation.id;
    } else {
      // Create new conversation
      const { data: newConversation, error: createError } = await supabase
        .from("conversations")
        .insert({
          user_a_id: user.id,
          user_b_id: targetUserId,
          wish_context_id: wishContextId || null,
        })
        .select()
        .single();

      if (createError || !newConversation) {
        return NextResponse.json(
          { success: false, error: "创建对话失败" },
          { status: 500 },
        );
      }

      conversationId = newConversation.id;

      // Check if users are mutually following
      const { data: follows } = await supabase
        .from("follows")
        .select("id")
        .or(`follower_id.eq.${user.id}.following_id.eq.${targetUserId},follower_id.eq.${targetUserId}.following_id.eq.${user.id}`);

      const areMutuallyFollowing = follows && follows.length >= 2;

      // If not mutually following, create message request
      if (!areMutuallyFollowing) {
        await supabase
          .from("message_requests")
          .insert({
            conversation_id: conversationId,
            receiver_id: targetUserId,
            status: "pending",
          });
      }
    }

    // Insert message
    const { data: message, error: msgError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
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
