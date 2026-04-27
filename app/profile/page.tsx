"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { WishCard } from "@/components/wish/wish-card";

interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  createdAt: string;
}

interface Wish {
  id: string;
  title: string;
  summary: string;
  category: string;
  status: string;
  responseCount: number;
  createdAt: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    wishCount: 0,
    responseCount: 0,
    followerCount: 0,
    followingCount: 0,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      // 获取用户信息
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();

      if (!meData.success || !meData.user) {
        throw new Error("请先登录");
      }

      setProfile({
        id: meData.user.id,
        email: meData.user.email,
        displayName: meData.user.name,
        avatarUrl: meData.user.avatar_url,
        createdAt: "",
      });

      // 获取用户的愿望
      const wishesRes = await fetch(`/api/wishes?userId=${meData.user.id}`);
      const wishesData = await wishesRes.json();

      if (wishesData.success) {
        setWishes(wishesData.wishes || []);
        setStats((prev) => ({ ...prev, wishCount: wishesData.wishes?.length || 0 }));
      }

      // 获取粉丝数
      const followersRes = await fetch(`/api/follows?userId=${meData.user.id}&type=followers`);
      const followersData = await followersRes.json();
      if (followersData.success) {
        setStats((prev) => ({ ...prev, followerCount: followersData.followers?.length || 0 }));
      }

      // 获取关注数
      const followingRes = await fetch(`/api/follows?userId=${meData.user.id}&type=following`);
      const followingData = await followingRes.json();
      if (followingData.success) {
        setStats((prev) => ({ ...prev, followingCount: followingData.following?.length || 0 }));
      }

      // 计算总回应数
      let totalResponses = 0;
      for (const wish of wishesData.wishes || []) {
        totalResponses += wish.responseCount || 0;
      }
      setStats((prev) => ({ ...prev, responseCount: totalResponses }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取信息失败");
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
      {/* Profile Header */}
      <div className="mb-8 rounded-[28px] border border-line bg-white/80 p-6 dark:bg-surface-dark dark:border-stone-700/50">
        <div className="flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-stone-200 text-2xl font-medium text-ink/60 dark:bg-stone-700 dark:text-ink-light/60">
            {profile?.displayName?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1">
            <h1 className="font-serif text-2xl text-ink dark:text-ink-light">
              {profile?.displayName || "用户"}
            </h1>
            <p className="mt-1 text-sm text-ink/60 dark:text-ink-light/55">
              {profile?.email}
            </p>
            {profile?.createdAt && (
              <p className="mt-1 text-xs text-ink/40 dark:text-ink-light/35">
                加入于 {formatDate(profile.createdAt)}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 flex gap-6 border-t border-line pt-6 dark:border-stone-700/50">
          <div className="text-center">
            <p className="text-2xl font-serif text-ink dark:text-ink-light">{stats.wishCount}</p>
            <p className="text-xs text-ink/50 dark:text-ink-light/45">愿望</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-serif text-ink dark:text-ink-light">{stats.responseCount}</p>
            <p className="text-xs text-ink/50 dark:text-ink-light/45">收到回应</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-serif text-ink dark:text-ink-light">{stats.followerCount}</p>
            <p className="text-xs text-ink/50 dark:text-ink-light/45">粉丝</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-serif text-ink dark:text-ink-light">{stats.followingCount}</p>
            <p className="text-xs text-ink/50 dark:text-ink-light/45">关注</p>
          </div>
        </div>
      </div>

      {/* Wishes */}
      <div>
        <h2 className="mb-4 font-serif text-xl text-ink dark:text-ink-light">我的愿望</h2>
        {wishes.length === 0 ? (
          <div className="rounded-[28px] border border-line bg-white/50 py-12 text-center dark:bg-surface-dark dark:border-stone-700/50">
            <p className="text-ink/50 dark:text-ink-light/45">还没有发布任何愿望</p>
            <Link href="/submit" className="mt-4 inline-block text-sm text-clay hover:underline">
              发布第一个愿望 →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {wishes.map((wish) => (
              <WishCard key={wish.id} wish={wish} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
