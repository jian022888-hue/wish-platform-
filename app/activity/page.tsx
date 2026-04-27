"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface Activity {
  id: string;
  type: "new_wish" | "new_response" | "new_follower";
  actor: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
  target?: {
    id: string;
    title: string;
    type: "wish" | "response";
  };
  content?: string;
  createdAt: string;
}

export default function ActivityFeedPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/activity?page=${pageNum}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "获取动态失败");
      }

      if (pageNum === 1) {
        setActivities(data.activities || []);
      } else {
        setActivities((prev) => [...prev, ...(data.activities || [])]);
      }

      setHasMore(data.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取动态失败");
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchActivities(nextPage);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "new_wish":
        return "💭";
      case "new_response":
        return "💬";
      case "new_follower":
        return "👤";
      default:
        return "🔔";
    }
  };

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case "new_wish":
        return "发布了新愿望";
      case "new_response":
        return "回应了愿望";
      case "new_follower":
        return "开始关注你";
      default:
        return "";
    }
  };

  const getTargetLink = (activity: Activity) => {
    if (!activity.target) return "#";
    if (activity.target.type === "wish") {
      return `/wishes/${activity.target.id}`;
    }
    return "#";
  };

  if (loading && activities.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-clay border-t-transparent" />
          <p className="text-sm text-ink/50 dark:text-ink-light/50">加载中...</p>
        </div>
      </div>
    );
  }

  if (error && activities.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-ink/60 dark:text-ink-light/60">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell py-8">
      <h1 className="mb-6 font-serif text-3xl text-ink dark:text-ink-light">活动动态</h1>

      {activities.length === 0 ? (
        <div className="rounded-[28px] border border-line bg-white/50 py-16 text-center dark:bg-surface-dark dark:border-stone-700/50">
          <p className="text-4xl">🌟</p>
          <p className="mt-4 text-ink/50 dark:text-ink-light/45">
            暂无动态，关注一些用户来查看他们的活动吧
          </p>
          <Link href="/" className="mt-4 inline-block text-sm text-clay hover:underline">
            发现愿望 →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="rounded-2xl border border-line bg-white/80 p-4 transition hover:border-clay/30 dark:bg-surface-dark dark:border-stone-700/50 dark:hover:border-clay/30"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-stone-100 text-lg dark:bg-stone-700">
                  {activity.actor.avatarUrl ? (
                    <img
                      src={activity.actor.avatarUrl}
                      alt={activity.actor.displayName}
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    getActivityIcon(activity.type)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/profile/${activity.actor.id}`}
                      className="font-medium text-ink hover:text-clay dark:text-ink-light dark:hover:text-clay"
                    >
                      {activity.actor.displayName}
                    </Link>
                    <span className="text-sm text-ink/50 dark:text-ink-light/45">
                      {getActivityText(activity)}
                    </span>
                  </div>
                  {activity.target && (
                    <Link
                      href={getTargetLink(activity)}
                      className="mt-2 block truncate text-sm text-clay hover:underline"
                    >
                      {activity.target.title}
                    </Link>
                  )}
                  {activity.content && (
                    <p className="mt-2 text-sm text-ink/60 dark:text-ink-light/55">
                      {activity.content}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-ink/40 dark:text-ink-light/35">
                    {formatDate(activity.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={loadMore}
                disabled={loading}
                className="rounded-xl border border-line bg-white/80 px-6 py-3 text-sm text-ink transition hover:border-clay/40 disabled:opacity-50 dark:bg-surface-dark dark:text-ink-light dark:border-stone-700/50 dark:hover:border-clay/40"
              >
                {loading ? "加载中..." : "加载更多"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
