import { requireAuth } from "@/components/auth/auth-require";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "active";
    const search = searchParams.get("search") || "";

    // Build query
    let query = supabase
      .from("conversations")
      .select(`
        *,
        messages (
          id,
          sender_id,
          content,
          message_type,
          image_url,
          is_read,
          created_at
        ),
        message_requests (
          status,
          receiver_id
        )
      `)
      .eq("status", status)
      .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
      .order("updated_at", { ascending: false });

    const { data: conversations, error } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    // Separate conversations and message requests
    const chatList: any[] = [];
    const requestsList: any[] = [];

    for (const conv of conversations || []) {
      const isUserA = conv.user_a_id === user.id;
      const otherUserId = isUserA ? conv.user_b_id : conv.user_a_id;

      // Get other user's profile
      const { data: otherProfile } = await supabase
        .from("profiles")
        .select("email, display_name, avatar_url")
        .eq("id", otherUserId)
        .single();

      // Get wish context title if exists
      let wishContextTitle = null;
      if (conv.wish_context_id) {
        const { data: wish } = await supabase
          .from("wishes")
          .select("title")
          .eq("id", conv.wish_context_id)
          .single();
        wishContextTitle = wish?.title;
      }

      // Get last message
      const lastMsg = conv.messages?.[conv.messages.length - 1];
      const lastMessage = lastMsg
        ? {
            id: lastMsg.id,
            senderId: lastMsg.sender_id,
            content: lastMsg.content,
            messageType: lastMsg.message_type,
            imageUrl: lastMsg.image_url,
            createdAt: lastMsg.created_at,
          }
        : undefined;

      // Calculate unread count: count messages from the other user that are not read
      const unreadCount = conv.messages?.filter(
        (msg: any) => msg.sender_id !== user.id && !msg.is_read
      ).length || 0;

      const conversationData = {
        id: conv.id,
        userAId: conv.user_a_id,
        userBId: conv.user_b_id,
        otherUserName: otherProfile?.email?.split("@")[0] || "用户",
        otherUserDisplayName: otherProfile?.display_name || otherProfile?.email?.split("@")[0] || "用户",
        otherUserAvatar: otherProfile?.avatar_url,
        wishContextId: conv.wish_context_id,
        wishContextTitle,
        status: conv.status,
        lastMessage,
        unreadCount,
        createdAt: conv.created_at,
        updatedAt: conv.updated_at,
      };

      // Check if this is a message request
      const request = conv.message_requests?.find(
        (r: any) => r.receiver_id === user.id && r.status === "pending"
      );

      if (request) {
        requestsList.push({
          ...conversationData,
          requestId: request.id,
        });
      } else {
        chatList.push(conversationData);
      }
    }

    return NextResponse.json({
      success: true,
      conversations: chatList,
      requests: requestsList,
    });
  } catch (error) {
    // Handle Next.js redirect error
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      return NextResponse.json(
        { success: false, error: "请先登录" },
        { status: 401 },
      );
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: "获取消息列表失败" },
      { status: 500 },
    );
  }
}
