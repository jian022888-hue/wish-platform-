import { requireAuth } from "@/components/auth/auth-require";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const supabase = await createClient();

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, display_name, avatar_url, created_at")
      .eq("id", id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: "用户不存在" },
        { status: 404 },
      );
    }

    // Get user's wishes
    const { data: wishes, error: wishesError } = await supabase
      .from("wishes")
      .select("*")
      .eq("user_id", id)
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(20);

    // Get following count
    const { count: followingCount } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", id);

    // Get followers count
    const { count: followersCount } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", id);

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        email: profile.email,
        displayName: profile.display_name,
        avatarUrl: profile.avatar_url,
        createdAt: profile.created_at,
      },
      wishes: wishes || [],
      followingCount: followingCount || 0,
      followersCount: followersCount || 0,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      return NextResponse.json(
        { success: false, error: "请先登录" },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { success: false, error: "获取用户信息失败" },
      { status: 500 },
    );
  }
}
