import { requireAuth } from "@/components/auth/auth-require";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ requestId: string }> },
) {
  try {
    const user = await requireAuth();
    const { requestId } = await params;
    const supabase = await createClient();

    // Verify the request belongs to this user
    const { data: requestRecord, error: reqError } = await supabase
      .from("message_requests")
      .select("conversation_id, receiver_id, status")
      .eq("id", requestId)
      .eq("receiver_id", user.id)
      .single();

    if (reqError || !requestRecord) {
      return NextResponse.json(
        { success: false, error: "请求不存在或无权操作" },
        { status: 404 },
      );
    }

    if (requestRecord.status !== "pending") {
      return NextResponse.json(
        { success: false, error: "该请求已被处理" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { action } = body; // "accept" or "ignore"

    if (action === "accept") {
      // Update request status
      await supabase
        .from("message_requests")
        .update({ status: "accepted" })
        .eq("id", requestId);

      return NextResponse.json({ success: true, status: "accepted" });
    } else if (action === "ignore") {
      // Update request status
      await supabase
        .from("message_requests")
        .update({ status: "ignored" })
        .eq("id", requestId);

      return NextResponse.json({ success: true, status: "ignored" });
    } else {
      return NextResponse.json(
        { success: false, error: "无效的操作" },
        { status: 400 },
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 401 },
    );
  }
}
