import { requireAuth } from "@/components/auth/auth-require";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || user.id;

    // 获取所有成就
    const { data: achievements } = await supabase
      .from("achievements")
      .select("*")
      .order("category", { ascending: true })
      .order("requirement", { ascending: true });

    // 获取用户已获得的成就
    const { data: userAchievements } = await supabase
      .from("user_achievements")
      .select("achievement_id, earned_at")
      .eq("user_id", userId);

    // 获取用户等级
    const { data: userLevel } = await supabase
      .from("user_levels")
      .select("*")
      .eq("user_id", userId)
      .single();

    // 合并成就信息
    const achievementMap = new Map();
    achievements?.forEach((a) => {
      achievementMap.set(a.id, {
        ...a,
        earned: false,
        earnedAt: null,
      });
    });

    userAchievements?.forEach((ua) => {
      const achievement = achievementMap.get(ua.achievement_id);
      if (achievement) {
        achievement.earned = true;
        achievement.earnedAt = ua.earned_at;
      }
    });

    // 计算进度
    const totalAchievements = achievements?.length || 0;
    const earnedAchievements = userAchievements?.length || 0;
    const progress = totalAchievements > 0 ? (earnedAchievements / totalAchievements) * 100 : 0;

    return NextResponse.json({
      success: true,
      achievements: Array.from(achievementMap.values()),
      level: userLevel || { level: 1, xp: 0, totalXp: 0 },
      stats: {
        totalAchievements,
        earnedAchievements,
        progress,
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
      { success: false, error: "获取成就失败" },
      { status: 500 },
    );
  }
}
