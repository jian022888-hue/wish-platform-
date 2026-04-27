import { requireAuth } from "@/components/auth/auth-require";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Check follow status
export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const targetId = searchParams.get("targetId");

    if (!targetId) {
      return NextResponse.json({ success: false, error: "缺少参数" }, { status: 400 });
    }

    // Check if I am following them
    const { data: iFollow } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", targetId)
      .single();

    // Check if they are following me
    const { data: theyFollow } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", targetId)
      .eq("following_id", user.id)
      .single();

    return NextResponse.json({
      success: true,
      isFollowing: !!iFollow,
      isMutual: !!iFollow && !!theyFollow,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "获取状态失败" }, { status: 500 });
  }
}

// Follow or Unfollow
export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();
    const { targetId, action } = await request.json(); // action: "follow" | "unfollow"

    if (!targetId || !action) {
      return NextResponse.json({ success: false, error: "参数错误" }, { status: 400 });
    }

    if (action === "follow") {
      // Check if already following
      const { data: existing } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("following_id", targetId)
        .single();

      if (existing) {
        return NextResponse.json({ success: false, error: "已关注" }, { status: 400 });
      }

      const { error } = await supabase
        .from("follows")
        .insert({ follower_id: user.id, following_id: targetId });

      if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });

    } else if (action === "unfollow") {
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", targetId);

      if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "无效操作" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "操作失败" }, { status: 500 });
  }
}
