import { requireAuth } from "@/components/auth/auth-require";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();

    const body = await request.json();
    const { followingId, action } = body;

    if (!followingId) {
      return NextResponse.json(
        { success: false, error: "用户ID不能为空" },
        { status: 400 },
      );
    }

    if (followingId === user.id) {
      return NextResponse.json(
        { success: false, error: "不能关注自己" },
        { status: 400 },
      );
    }

    if (action === "follow") {
      // 关注用户
      const { error } = await supabase
        .from("follows")
        .insert({
          follower_id: user.id,
          following_id: followingId,
        });

      if (error) {
        if (error.code === "23505") { // unique violation
          return NextResponse.json({ success: true, alreadyFollowing: true });
        }
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 },
        );
      }

      return NextResponse.json({ success: true, following: true });
    } else if (action === "unfollow") {
      // 取消关注
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", followingId);

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 },
        );
      }

      return NextResponse.json({ success: true, following: false });
    }

    return NextResponse.json(
      { success: false, error: "无效的操作" },
      { status: 400 },
    );
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

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type"); // "followers" or "following"

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "用户ID不能为空" },
        { status: 400 },
      );
    }

    if (type === "followers") {
      // 获取粉丝列表
      const { data, error } = await supabase
        .from("follows")
        .select(`
          follower_id,
          profiles!follows_follower_id_fkey (
            id,
            email,
            display_name,
            avatar_url
          )
        `)
        .eq("following_id", userId);

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 },
        );
      }

      const followers = (data || []).map((item: any) => ({
        id: item.follower_id,
        ...item.profiles,
      }));

      return NextResponse.json({ success: true, followers });
    } else if (type === "following") {
      // 获取关注列表
      const { data, error } = await supabase
        .from("follows")
        .select(`
          following_id,
          profiles!follows_following_id_fkey (
            id,
            email,
            display_name,
            avatar_url
          )
        `)
        .eq("follower_id", userId);

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 },
        );
      }

      const following = (data || []).map((item: any) => ({
        id: item.following_id,
        ...item.profiles,
      }));

      return NextResponse.json({ success: true, following });
    }

    // 默认返回关注状态
    const { data, error } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", userId)
      .single();

    if (error && error.code !== "PGRST116") { // not found is ok
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      following: !!data,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      return NextResponse.json(
        { success: false, error: "请先登录" },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { success: false, error: "获取关注信息失败" },
      { status: 500 },
    );
  }
}
