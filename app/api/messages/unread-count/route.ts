import { requireAuth } from "@/components/auth/auth-require";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await requireAuth();
    const supabase = await createClient();

    // Count all unread messages across all conversations
    const { data: conversations, error } = await supabase
      .from("conversations")
      .select(`
        id,
        messages!inner (
          id,
          sender_id,
          is_read
        )
      `)
      .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Calculate total unread count
    let totalUnread = 0;
    for (const conv of conversations || []) {
      const unread = conv.messages?.filter(
        (msg: any) => msg.sender_id !== user.id && !msg.is_read
      ).length || 0;
      totalUnread += unread;
    }

    return NextResponse.json({
      success: true,
      totalUnread,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      return NextResponse.json(
        { success: false, error: "请先登录" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "获取未读数量失败" },
      { status: 500 }
    );
  }
}
