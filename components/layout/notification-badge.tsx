"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface NotificationBadgeProps {
  className?: string;
}

export function NotificationBadge({ className }: NotificationBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUnreadCount();

    // 每 30 秒更新一次未读数量
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch("/api/notifications?unreadOnly=true");
      const data = await res.json();

      if (res.ok && data.success) {
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // 忽略错误
    } finally {
      setLoading(false);
    }
  };

  if (loading || unreadCount === 0) {
    return (
      <Link
        href="/notifications"
        className={cn(
          "relative rounded-lg p-2 transition hover:bg-stone-100 dark:hover:bg-stone-700",
          className
        )}
      >
        <svg
          className="h-5 w-5 text-ink/60 dark:text-ink-light/55"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      </Link>
    );
  }

  return (
    <Link
      href="/notifications"
      className={cn(
        "relative rounded-lg p-2 transition hover:bg-stone-100 dark:hover:bg-stone-700",
        className
      )}
    >
      <svg
        className="h-5 w-5 text-ink/60 dark:text-ink-light/55"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-clay text-xs text-white">
        {unreadCount > 99 ? "99+" : unreadCount}
      </span>
    </Link>
  );
}
