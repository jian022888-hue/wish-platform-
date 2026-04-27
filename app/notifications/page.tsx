"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  title: string;
  content: string;
  referenceId: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/notifications${filter === "unread" ? "?unreadOnly=true" : ""}`
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "获取通知失败");
      }

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取通知失败");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId?: string) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId, action: "markAsRead" }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "操作失败");
      }

      fetchNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
    }
  };

  const markAllAsRead = async () => {
    await markAsRead();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_response":
        return "💬";
      case "new_message":
        return "✉️";
      case "new_follower":
        return "👤";
      case "wish_update":
        return "⭐";
      default:
        return "🔔";
    }
  };

  const getReferenceLink = (notification: Notification) => {
    switch (notification.type) {
      case "new_response":
        return `/wishes/${notification.referenceId}`;
      case "new_message":
        return `/messages/${notification.referenceId}`;
      default:
        return "/notifications";
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
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-3xl text-ink dark:text-ink-light">通知</h1>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-clay hover:underline"
          >
            全部标记为已读
          </button>
        )}
      </div>

      {/* Filter Tabs */}
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
          全部 ({notifications.length + (filter === "unread" ? unreadCount : 0)})
        </button>
        <button
          className={cn(
            "rounded-full px-4 py-2 transition",
            filter === "unread"
              ? "bg-ink text-white dark:bg-ink-light dark:text-background-dark"
              : "text-ink/60 hover:text-ink dark:text-ink-light/60 dark:hover:text-ink-light"
          )}
          onClick={() => setFilter("unread")}
        >
          未读 ({unreadCount})
        </button>
      </div>

      {/* Notification List */}
      {notifications.length === 0 ? (
        <div className="rounded-[28px] border border-line bg-white/50 py-16 text-center dark:bg-surface-dark dark:border-stone-700/50">
          <p className="text-4xl">🔔</p>
          <p className="mt-4 text-ink/50 dark:text-ink-light/45">
            {filter === "unread" ? "没有未读通知" : "暂无通知"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                "group flex items-start gap-4 rounded-2xl border p-4 transition",
                notification.isRead
                  ? "border-line bg-white/50 dark:bg-surface-dark dark:border-stone-700/50"
                  : "border-clay/30 bg-clay/5 dark:bg-clay/10 dark:border-clay/30"
              )}
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-stone-100 text-lg dark:bg-stone-700">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={getReferenceLink(notification)}
                  className="block"
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                >
                  <p className={cn(
                    "text-sm",
                    notification.isRead
                      ? "text-ink/60 dark:text-ink-light/55"
                      : "font-medium text-ink dark:text-ink-light"
                  )}>
                    {notification.title}
                  </p>
                  {notification.content && (
                    <p className="mt-1 text-xs text-ink/50 dark:text-ink-light/45">
                      {notification.content}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-ink/40 dark:text-ink-light/35">
                    {formatDate(notification.createdAt)}
                  </p>
                </Link>
              </div>
              {!notification.isRead && (
                <div className="h-2 w-2 flex-shrink-0 rounded-full bg-clay" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
