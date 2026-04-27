"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: number;
  requirementType: string;
  points: number;
  earned: boolean;
  earnedAt: string | null;
}

interface UserLevel {
  level: number;
  xp: number;
  totalXp: number;
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [level, setLevel] = useState<UserLevel>({ level: 1, xp: 0, totalXp: 0 });
  const [stats, setStats] = useState({ totalAchievements: 0, earnedAchievements: 0, progress: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "earned" | "unearned">("all");

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/achievements");
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "获取成就失败");
      }

      setAchievements(data.achievements || []);
      setLevel(data.level || { level: 1, xp: 0, totalXp: 0 });
      setStats(data.stats || { totalAchievements: 0, earnedAchievements: 0, progress: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取成就失败");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAchievements = () => {
    if (filter === "earned") return achievements.filter((a) => a.earned);
    if (filter === "unearned") return achievements.filter((a) => !a.earned);
    return achievements;
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "wish":
        return "愿望";
      case "social":
        return "社交";
      case "milestone":
        return "里程碑";
      default:
        return category;
    }
  };

  const getNextLevelXp = () => {
    return level.level * 500;
  };

  const getProgressToNextLevel = () => {
    const nextLevelXp = getNextLevelXp();
    const currentLevelXp = (level.level - 1) * 500;
    const progress = level.xp - currentLevelXp;
    return Math.min((progress / (nextLevelXp - currentLevelXp)) * 100, 100);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-clay border-t-transparent" />
          <p className="text-sm text-ink/50 dark:text-ink-light/50">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-ink/60 dark:text-ink-light/60">{error}</p>
          <Link href="/" className="mt-4 inline-block text-sm text-clay hover:underline">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell py-8">
      <h1 className="mb-8 font-serif text-3xl text-ink dark:text-ink-light">成就</h1>

      {/* Level Card */}
      <div className="mb-8 rounded-[28px] border border-line bg-gradient-to-br from-clay/10 to-sand/10 p-6 dark:from-clay/20 dark:to-sand/20 dark:border-stone-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-clay text-2xl font-bold text-white">
              {level.level}
            </div>
            <div>
              <p className="font-serif text-xl text-ink dark:text-ink-light">
                等级 {level.level}
              </p>
              <p className="text-sm text-ink/60 dark:text-ink-light/55">
                {level.totalXp} 总经验值
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-ink/60 dark:text-ink-light/55">
              距离下一级还需
            </p>
            <p className="text-lg font-medium text-clay">
              {getNextLevelXp() - level.xp} XP
            </p>
          </div>
        </div>
        <div className="mt-4 h-3 rounded-full bg-stone-200 dark:bg-stone-700">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-clay to-sand transition-all"
            style={{ width: `${getProgressToNextLevel()}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-line bg-white/80 p-4 text-center dark:bg-surface-dark dark:border-stone-700/50">
          <p className="text-2xl font-serif text-ink dark:text-ink-light">
            {stats.totalAchievements}
          </p>
          <p className="mt-1 text-xs text-ink/50 dark:text-ink-light/45">总成就</p>
        </div>
        <div className="rounded-2xl border border-line bg-white/80 p-4 text-center dark:bg-surface-dark dark:border-stone-700/50">
          <p className="text-2xl font-serif text-ink dark:text-ink-light">
            {stats.earnedAchievements}
          </p>
          <p className="mt-1 text-xs text-ink/50 dark:text-ink-light/45">已获得</p>
        </div>
        <div className="rounded-2xl border border-line bg-white/80 p-4 text-center dark:bg-surface-dark dark:border-stone-700/50">
          <p className="text-2xl font-serif text-ink dark:text-ink-light">
            {Math.round(stats.progress)}%
          </p>
          <p className="mt-1 text-xs text-ink/50 dark:text-ink-light/45">完成度</p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6 flex gap-2 text-sm">
        <button
          className={cn(
            "rounded-full px-4 py-2 transition",
            filter === "all"
              ? "bg-ink text-white dark:bg-ink-light dark:text-background-dark"
              : "text-ink/60 hover:text-ink dark:text-ink-light/60 dark:hover:text-ink-light"
          )}
          onClick={() => setFilter("all")}
        >
          全部
        </button>
        <button
          className={cn(
            "rounded-full px-4 py-2 transition",
            filter === "earned"
              ? "bg-ink text-white dark:bg-ink-light dark:text-background-dark"
              : "text-ink/60 hover:text-ink dark:text-ink-light/60 dark:hover:text-ink-light"
          )}
          onClick={() => setFilter("earned")}
        >
          已获得
        </button>
        <button
          className={cn(
            "rounded-full px-4 py-2 transition",
            filter === "unearned"
              ? "bg-ink text-white dark:bg-ink-light dark:text-background-dark"
              : "text-ink/60 hover:text-ink dark:text-ink-light/60 dark:hover:text-ink-light"
          )}
          onClick={() => setFilter("unearned")}
        >
          未获得
        </button>
      </div>

      {/* Achievements Grid */}
      {getFilteredAchievements().length === 0 ? (
        <div className="rounded-[28px] border border-line bg-white/50 py-16 text-center dark:bg-surface-dark dark:border-stone-700/50">
          <p className="text-4xl"></p>
          <p className="mt-4 text-ink/50 dark:text-ink-light/45">
            {filter === "earned" ? "还没有获得任何成就" : "所有成就都已获得！"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {getFilteredAchievements().map((achievement) => (
            <div
              key={achievement.id}
              className={cn(
                "group rounded-2xl border p-5 transition",
                achievement.earned
                  ? "border-clay/30 bg-clay/5 dark:bg-clay/10 dark:border-clay/30"
                  : "border-line bg-white/80 dark:bg-surface-dark dark:border-stone-700/50"
              )}
            >
              <div className="mb-3 flex items-start justify-between">
                <span className="text-3xl">{achievement.icon || "️"}</span>
                {achievement.earned && (
                  <span className="rounded-full bg-clay/20 px-2 py-1 text-xs text-clay dark:bg-clay/30">
                    ✓ 已获得
                  </span>
                )}
              </div>
              <h3 className="mb-1 font-medium text-ink dark:text-ink-light">
                {achievement.name}
              </h3>
              <p className="mb-3 text-xs text-ink/50 dark:text-ink-light/45">
                {achievement.description}
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="rounded-full bg-stone-100 px-2 py-1 text-ink/50 dark:bg-stone-700 dark:text-ink-light/55">
                  {getCategoryLabel(achievement.category)}
                </span>
                <span className="text-ink/40 dark:text-ink-light/35">
                  {achievement.points} XP
                </span>
              </div>
              {achievement.earnedAt && (
                <p className="mt-2 text-xs text-ink/40 dark:text-ink-light/35">
                  获得于 {formatDate(achievement.earnedAt)}
                </p>
              )}
              {!achievement.earned && (
                <div className="mt-3 h-1.5 rounded-full bg-stone-100 dark:bg-stone-700">
                  <div
                    className="h-1.5 rounded-full bg-clay/50 transition-all"
                    style={{
                      width: `${Math.min(
                        (achievement.requirement / achievement.requirement) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
