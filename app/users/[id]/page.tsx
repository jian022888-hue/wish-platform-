"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FollowButton } from "@/components/ui/follow-button";
import type { Wish } from "@/types";

interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export default function ProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [followingCount, setFollowingCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/users/${userId}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "获取用户信息失败");
      }
      setProfile(data.profile);
      setWishes(data.wishes || []);
      setFollowingCount(data.followingCount || 0);
      setFollowersCount(data.followersCount || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取用户信息失败");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-shell flex min-h-[60vh] items-center justify-center py-16">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-clay border-t-transparent" />
          <p className="text-sm text-ink/50 dark:text-ink-light/50">加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="page-shell py-8">
        <div className="rounded-2xl bg-red-50/80 px-5 py-4 text-center dark:bg-red-900/15 dark:text-red-400">
          <p className="text-sm text-red-700 dark:text-red-400">{error || "用户不存在"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell py-8">
      <div className="mb-8 rounded-[28px] border border-stone-200 bg-white/80 p-6 dark:border-stone-700/60 dark:bg-surface-dark">
        <div className="flex items-start gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-stone-200 text-2xl font-medium text-ink/60 dark:bg-stone-700 dark:text-ink-light/60">
            {profile.displayName?.[0]?.toUpperCase() || profile.email[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="font-serif text-2xl text-ink dark:text-ink-light">
              {profile.displayName || "匿名用户"}
            </h1>
            <p className="mt-1 text-sm text-ink/50 dark:text-ink-light/45">{profile.email}</p>
            
            <div className="mt-4 flex items-center gap-4">
              <div className="text-center">
                <p className="text-lg font-semibold text-ink dark:text-ink-light">{wishes.length}</p>
                <p className="text-xs text-ink/50 dark:text-ink-light/45">愿望</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-ink dark:text-ink-light">{followingCount}</p>
                <p className="text-xs text-ink/50 dark:text-ink-light/45">关注</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-ink dark:text-ink-light">{followersCount}</p>
                <p className="text-xs text-ink/50 dark:text-ink-light/45">粉丝</p>
              </div>
              <div className="ml-auto">
                <FollowButton targetUserId={userId} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-medium text-ink dark:text-ink-light">愿望列表</h2>
        {wishes.length === 0 ? (
          <div className="rounded-2xl bg-stone-100/75 py-12 text-center dark:bg-surface-dark dark:text-ink-light/35">
            <p className="text-ink/40">暂无愿望</p>
          </div>
        ) : (
          <div className="space-y-3">
            {wishes.map((wish) => (
              <Link
                key={wish.id}
                href={`/wishes/${wish.id}`}
                className="block rounded-2xl border border-line bg-white/80 p-4 transition hover:border-clay/40 dark:border-stone-700/60 dark:bg-surface-dark dark:hover:border-clay/40"
              >
                <p className="font-medium text-ink dark:text-ink-light">{wish.title}</p>
                <p className="mt-1 text-sm text-ink/60 line-clamp-2 dark:text-ink-light/55">{wish.summary}</p>
                <p className="mt-2 text-xs text-ink/40 dark:text-ink-light/35">
                  {new Date(wish.createdAt).toLocaleDateString("zh-CN")}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
