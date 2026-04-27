import { requireAuth } from "@/components/auth/auth-require";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const supabase = await createClient();

    // Pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const offset = (page - 1) * pageSize;

    // Verify user has access
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

    // Get messages with pagination
    const { data: messages, error: msgError } = await supabase
      .from("messages")
      .select(`
        *,
        profiles!messages_sender_id_fkey (
          email,
          display_name,
          avatar_url
        )
      `)
      .eq("conversation_id", id)
      .order("created_at", { ascending: false }) // Fetch newest first for efficient pagination
      .range(offset, offset + pageSize - 1);

    if (msgError) {
      return NextResponse.json(
        { success: false, error: msgError.message },
        { status: 500 },
      );
    }

    // Get other user info
    const isUserA = conversation.user_a_id === user.id;
    const otherUserId = isUserA ? conversation.user_b_id : conversation.user_a_id;
    const { data: otherProfile } = await supabase
      .from("profiles")
      .select("email, display_name, avatar_url")
      .eq("id", otherUserId)
      .single();

    let wishContextTitle = null;
    if (conversation.wish_context_id) {
      const { data: wish } = await supabase
        .from("wishes")
        .select("title")
        .eq("id", conversation.wish_context_id)
        .single();
      wishContextTitle = wish?.title;
    }

    const formattedMessages = (messages || [])
      .map((msg: any) => ({
        id: msg.id,
        conversationId: msg.conversation_id,
        senderId: msg.sender_id,
        senderName: msg.profiles?.display_name || msg.profiles?.email?.split("@")[0] || "用户",
        content: msg.content,
        messageType: msg.message_type,
        imageUrl: msg.image_url,
        isRead: msg.is_read,
        createdAt: msg.created_at,
      }))
      .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); // Sort ascending for UI

    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation.id,
        userAId: conversation.user_a_id,
        userBId: conversation.user_b_id,
        otherUserName: otherProfile?.email?.split("@")[0] || "用户",
        otherUserDisplayName: otherProfile?.display_name || otherProfile?.email?.split("@")[0] || "用户",
        otherUserAvatar: otherProfile?.avatar_url,
        wishContextId: conversation.wish_context_id,
        wishContextTitle,
        status: conversation.status,
        createdAt: conversation.created_at,
        updatedAt: conversation.updated_at,
      },
      messages: formattedMessages,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      return NextResponse.json(
        { success: false, error: "请先登录" },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { success: false, error: "获取对话失败" },
      { status: 500 },
    );
  }
}
