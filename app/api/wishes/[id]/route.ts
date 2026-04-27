import { deleteWish, getWishById } from "@/lib/wishes";
import { rateLimiters } from "@/lib/rate-limit";
import { requireAuth } from "@/components/auth/auth-require";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const clientIp = getClientIp(request);
    if (rateLimiters.createWish.isRateLimited(clientIp)) {
      return NextResponse.json(
        { success: false, error: "请求过于频繁，请稍后再试" },
        { status: 429 },
      );
    }

    const wish = await getWishById(id);
    if (!wish) {
      return NextResponse.json(
        { success: false, error: "Wish not found" },
        { status: 404 },
      );
    }

    const supabase = await createClient();
    const { data: wishData, error: wishError } = await supabase
      .from("wishes")
      .select("user_id")
      .eq("id", id)
      .single();

    if (wishError || wishData?.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: you can only delete your own wishes" },
        { status: 403 },
      );
    }

    const deleted = await deleteWish(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Failed to delete wish" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 401 },
    );
  }
}
