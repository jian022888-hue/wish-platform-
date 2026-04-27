import { requireAuth } from "@/components/auth/auth-require";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const supabase = await createClient();

    const body = await request.json();
    const { action } = body; // "archive", "unarchive", "delete"

    // Verify user has access to this conversation
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", id)
      .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { success: false, error: "对话不存在或无权操作" },
        { status: 404 },
      );
    }

    if (action === "archive") {
      const { error } = await supabase
        .from("conversations")
        .update({ status: "archived" })
        .eq("id", id);

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 },
        );
      }

      return NextResponse.json({ success: true, status: "archived" });
    } else if (action === "unarchive") {
      const { error } = await supabase
        .from("conversations")
        .update({ status: "active" })
        .eq("id", id);

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 },
        );
      }

      return NextResponse.json({ success: true, status: "active" });
    } else if (action === "delete") {
      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", id);

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 },
        );
      }

      return NextResponse.json({ success: true, action: "deleted" });
    } else {
      return NextResponse.json(
        { success: false, error: "无效的操作" },
        { status: 400 },
      );
    }
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      return NextResponse.json(
        { success: false, error: "请先登录" },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { success: false, error: "操作失败" },
      { status: 500 },
    );
  }
}
