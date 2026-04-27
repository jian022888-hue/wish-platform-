"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface FollowButtonProps {
  userId: string;
  initialFollowing?: boolean;
}

export function FollowButton({ userId, initialFollowing = false }: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUserId(data.user.id);
        // 检查是否已关注
        checkFollowStatus(data.user.id);
      }
    } catch {
      // 忽略错误
    }
  };

  const checkFollowStatus = async (userId: string) => {
    try {
      const res = await fetch(`/api/follows/status?followingId=${userId}`);
      const data = await res.json();
      if (data.success) {
        setFollowing(data.following);
      }
    } catch {
      // 忽略错误
    }
  };

  const handleToggleFollow = async () => {
    if (!currentUserId) {
      setError("请先登录");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/follows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          followingId: userId,
          action: following ? "unfollow" : "follow" 
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "操作失败");
      }

      setFollowing(!following);
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
    } finally {
      setLoading(false);
    }
  };

  if (currentUserId === userId) {
    return null; // 不显示自己的关注按钮
  }

  return (
    <div>
      <Button
        onClick={handleToggleFollow}
        disabled={loading || !currentUserId}
        variant={following ? "secondary" : "default"}
        size="sm"
      >
        {loading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : following ? (
          "已关注"
        ) : (
          "关注"
        )}
      </Button>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}
