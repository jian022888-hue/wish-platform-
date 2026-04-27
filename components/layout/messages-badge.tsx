"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useMessageSSE } from "@/lib/hooks/use-message-sse";

export function MessagesBadge() {
  const [unreadCount, setUnreadCount] = useState(0);
  const { notifications, setNotifications } = useMessageSSE(true);

  // Fetch initial unread count
  useEffect(() => {
    fetchUnreadCount();
    
    // Listen for unread count update events
    const handleUpdate = () => fetchUnreadCount();
    window.addEventListener("messages-unread-update", handleUpdate);
    return () => window.removeEventListener("messages-unread-update", handleUpdate);
  }, []);

  // Handle SSE notifications
  useEffect(() => {
    if (notifications.length === 0) return;

    const newNotifs = notifications.filter(
      (n) => n.type === "new_message" || n.type === "new_request"
    );
    
    if (newNotifs.length > 0) {
      setUnreadCount((prev) => prev + newNotifs.length);
      // Clear processed notifications
      setNotifications((prev) =>
        prev.filter(
          (n) => n.type !== "new_message" && n.type !== "new_request"
        )
      );
    }
  }, [notifications, setNotifications]);

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch("/api/messages/unread-count");
      const data = await res.json();
      if (res.ok && data.success) {
        setUnreadCount(data.totalUnread);
      }
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  return (
    <Link
      className="relative flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-stone-200/60 dark:hover:bg-stone-700"
      href="/messages"
    >
      <svg
        className="h-5 w-5 text-ink/70 dark:text-ink-light/70"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-clay text-[10px] font-bold text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
