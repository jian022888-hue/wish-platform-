"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface Stats {
  wishCount: number;
  totalResponses: number;
  followerCount: number;
  followingCount: number;
  messageCount: number;
  notificationCount: number;
  unreadNotificationCount: number;
  statusDistribution: Record<string, number>;
  categoryDistribution: Record<string, number>;
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/stats");
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "获取统计数据失败");
      }

      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取统计数据失败");
    } finally {
      setLoading(false);
    }
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
      <h1 className="mb-8 font-serif text-3xl text-ink dark:text-ink-light">数据统计</h1>

      {/* Overview Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-line bg-white/80 p-4 text-center dark:bg-surface-dark dark:border-stone-700/50">
          <p className="text-3xl font-serif text-ink dark:text-ink-light">{stats?.wishCount || 0}</p>
          <p className="mt-1 text-xs text-ink/50 dark:text-ink-light/45">我的愿望</p>
        </div>
        <div className="rounded-2xl border border-line bg-white/80 p-4 text-center dark:bg-surface-dark dark:border-stone-700/50">
          <p className="text-3xl font-serif text-ink dark:text-ink-light">{stats?.totalResponses || 0}</p>
          <p className="mt-1 text-xs text-ink/50 dark:text-ink-light/45">收到回应</p>
        </div>
        <div className="rounded-2xl border border-line bg-white/80 p-4 text-center dark:bg-surface-dark dark:border-stone-700/50">
          <p className="text-3xl font-serif text-ink dark:text-ink-light">{stats?.followerCount || 0}</p>
          <p className="mt-1 text-xs text-ink/50 dark:text-ink-light/45">粉丝</p>
        </div>
        <div className="rounded-2xl border border-line bg-white/80 p-4 text-center dark:bg-surface-dark dark:border-stone-700/50">
          <p className="text-3xl font-serif text-ink dark:text-ink-light">{stats?.followingCount || 0}</p>
          <p className="mt-1 text-xs text-ink/50 dark:text-ink-light/45">关注</p>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white/80 p-4 text-center dark:bg-surface-dark dark:border-stone-700/50">
          <p className="text-2xl font-serif text-ink dark:text-ink-light">{stats?.messageCount || 0}</p>
          <p className="mt-1 text-xs text-ink/50 dark:text-ink-light/45">发送消息</p>
        </div>
        <div className="rounded-2xl border border-line bg-white/80 p-4 text-center dark:bg-surface-dark dark:border-stone-700/50">
          <p className="text-2xl font-serif text-ink dark:text-ink-light">{stats?.notificationCount || 0}</p>
          <p className="mt-1 text-xs text-ink/50 dark:text-ink-light/45">通知</p>
        </div>
        <div className="rounded-2xl border border-clay/30 bg-clay/5 p-4 text-center dark:bg-clay/10 dark:border-clay/30 sm:col-span-1">
          <p className="text-2xl font-serif text-clay">{stats?.unreadNotificationCount || 0}</p>
          <p className="mt-1 text-xs text-clay/70">未读通知</p>
        </div>
      </div>

      {/* Status Distribution */}
      {stats?.statusDistribution && Object.keys(stats.statusDistribution).length > 0 && (
        <div className="mb-8 rounded-2xl border border-line bg-white/80 p-6 dark:bg-surface-dark dark:border-stone-700/50">
          <h2 className="mb-4 font-serif text-xl text-ink dark:text-ink-light">愿望状态分布</h2>
          <div className="space-y-3">
            {Object.entries(stats.statusDistribution).map(([status, count]) => (
              <div key={status} className="flex items-center gap-3">
                <span className="w-24 text-sm text-ink/60 dark:text-ink-light/55">{status}</span>
                <div className="flex-1 rounded-full bg-stone-100 dark:bg-stone-700">
                  <div
                    className="h-2 rounded-full bg-clay transition-all"
                    style={{
                      width: `${stats.wishCount > 0 ? (count / stats.wishCount) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="w-8 text-right text-sm text-ink/60 dark:text-ink-light/55">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Distribution */}
      {stats?.categoryDistribution && Object.keys(stats.categoryDistribution).length > 0 && (
        <div className="rounded-2xl border border-line bg-white/80 p-6 dark:bg-surface-dark dark:border-stone-700/50">
          <h2 className="mb-4 font-serif text-xl text-ink dark:text-ink-light">愿望分类分布</h2>
          <div className="space-y-3">
            {Object.entries(stats.categoryDistribution).map(([category, count]) => (
              <div key={category} className="flex items-center gap-3">
                <span className="w-24 text-sm text-ink/60 dark:text-ink-light/55">{category}</span>
                <div className="flex-1 rounded-full bg-stone-100 dark:bg-stone-700">
                  <div
                    className="h-2 rounded-full bg-sand transition-all"
                    style={{
                      width: `${stats.wishCount > 0 ? (count / stats.wishCount) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="w-8 text-right text-sm text-ink/60 dark:text-ink-light/55">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/profile"
          className="rounded-2xl border border-line bg-white/80 px-6 py-3 text-sm text-ink transition hover:border-clay/40 dark:bg-surface-dark dark:text-ink-light dark:border-stone-700/50 dark:hover:border-clay/40"
        >
          我的主页
        </Link>
        <Link
          href="/messages"
          className="rounded-2xl border border-line bg-white/80 px-6 py-3 text-sm text-ink transition hover:border-clay/40 dark:bg-surface-dark dark:text-ink-light dark:border-stone-700/50 dark:hover:border-clay/40"
        >
          消息
        </Link>
        <Link
          href="/notifications"
          className="rounded-2xl border border-line bg-white/80 px-6 py-3 text-sm text-ink transition hover:border-clay/40 dark:bg-surface-dark dark:text-ink-light dark:border-stone-700/50 dark:hover:border-clay/40"
        >
          通知
        </Link>
      </div>
    </div>
  );
}
