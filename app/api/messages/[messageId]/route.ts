import { requireAuth } from "@/components/auth/auth-require";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ messageId: string }> },
) {
  try {
    const user = await requireAuth();
    const { messageId } = await params;
    const supabase = await createClient();

    // Verify message exists and belongs to the user
    const { data: message, error: msgError } = await supabase
      .from("messages")
      .select("sender_id, created_at")
      .eq("id", messageId)
      .single();

    if (msgError || !message) {
      return NextResponse.json(
        { success: false, error: "消息不存在" },
        { status: 404 },
      );
    }

    // Only sender can delete their own message
    if (message.sender_id !== user.id) {
      return NextResponse.json(
        { success: false, error: "无权删除此消息" },
        { status: 403 },
      );
    }

    // Delete the message
    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageId);

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
      { success: false, error: "删除失败" },
      { status: 500 },
    );
  }
}
