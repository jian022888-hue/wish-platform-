import { requireAuth } from "@/components/auth/auth-require";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
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

    // Call the database function to mark messages as read
    const { error } = await supabase.rpc("mark_conversation_as_read", {
      p_conversation_id: id,
      p_user_id: user.id,
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      return NextResponse.json(
        { success: false, error: "请先登录" },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { success: false, error: "标记已读失败" },
      { status: 500 },
    );
  }
}
