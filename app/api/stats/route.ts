import { requireAuth } from "@/components/auth/auth-require";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await requireAuth();
    const supabase = await createClient();

    // 获取用户的愿望数量
    const { count: wishCount } = await supabase
      .from("wishes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    // 获取用户收到的回应总数
    const { data: userWishes } = await supabase
      .from("wishes")
      .select("response_count")
      .eq("user_id", user.id);

    const totalResponses = userWishes?.reduce((sum, w) => sum + (w.response_count || 0), 0) || 0;

    // 获取粉丝数
    const { count: followerCount } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", user.id);

    // 获取关注数
    const { count: followingCount } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", user.id);

    // 获取消息数量
    const { count: messageCount } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .or(`sender_id.eq.${user.id}`);

    // 获取通知数量
    const { count: notificationCount } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    // 获取未读通知数量
    const { count: unreadNotificationCount } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    // 获取愿望状态分布
    const { data: statusDistribution } = await supabase
      .from("wishes")
      .select("status")
      .eq("user_id", user.id);

    const statusMap: Record<string, number> = {};
    statusDistribution?.forEach((w) => {
      statusMap[w.status] = (statusMap[w.status] || 0) + 1;
    });

    // 获取愿望分类分布
    const { data: categoryDistribution } = await supabase
      .from("wishes")
      .select("category")
      .eq("user_id", user.id);

    const categoryMap: Record<string, number> = {};
    categoryDistribution?.forEach((w) => {
      categoryMap[w.category] = (categoryMap[w.category] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      stats: {
        wishCount: wishCount || 0,
        totalResponses,
        followerCount: followerCount || 0,
        followingCount: followingCount || 0,
        messageCount: messageCount || 0,
        notificationCount: notificationCount || 0,
        unreadNotificationCount: unreadNotificationCount || 0,
        statusDistribution: statusMap,
        categoryDistribution: categoryMap,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      return NextResponse.json(
        { success: false, error: "请先登录" },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { success: false, error: "获取统计数据失败" },
      { status: 500 },
    );
  }
}
