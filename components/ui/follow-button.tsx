"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  targetUserId: string;
  className?: string;
}

export function FollowButton({ targetUserId, className }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isMutual, setIsMutual] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, [targetUserId]);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/follows?targetId=${targetUserId}`);
      const data = await res.json();
      if (data.success) {
        setIsFollowing(data.isFollowing);
        setIsMutual(data.isMutual);
      }
    } catch (err) {
      console.error("获取关注状态失败", err);
    }
  };

  const handleFollow = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/follows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          targetUserId, 
          action: isFollowing ? "unfollow" : "follow" 
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsFollowing(!isFollowing);
        // Need to re-check mutual status
        fetchStatus();
      }
    } catch (err) {
      console.error("操作失败", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isMutual && (
        <span className="text-xs text-ink/50 dark:text-ink-light/50">互相关注</span>
      )}
      <button
        className={cn(
          "rounded-full px-4 py-1.5 text-sm font-medium transition",
          isFollowing 
            ? "border border-stone-200 text-ink/60 hover:border-red-200 hover:text-red-600 dark:border-stone-700 dark:text-ink-light/60 dark:hover:border-red-800 dark:hover:text-red-400" 
            : "bg-ink text-white hover:bg-ink/90 dark:bg-ink-light dark:text-background-dark dark:hover:bg-ink-light/90",
          loading && "opacity-50 pointer-events-none",
          className
        )}
        onClick={handleFollow}
        disabled={loading}
      >
        {loading ? "处理中..." : isFollowing ? "已关注" : "关注"}
      </button>
    </div>
  );
}
