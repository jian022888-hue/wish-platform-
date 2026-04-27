"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  senderId: string;
  content: string;
  messageType: "text" | "image";
  imageUrl?: string;
  createdAt: string;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState({ displayName: "用户", avatar: "" });
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchMessages();

    // 每 5 秒轮询新消息
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [conversationId]);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUserId(data.user.id);
      }
    } catch {
      // 忽略错误
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const [convRes, msgRes] = await Promise.all([
        fetch(`/api/conversations/${conversationId}`),
        fetch(`/api/conversations/${conversationId}/messages`),
      ]);

      const convData = await convRes.json();
      const msgData = await msgRes.json();

      if (!convRes.ok || !convData.success) {
        throw new Error(convData.error || "获取对话信息失败");
      }

      if (!msgRes.ok || !msgData.success) {
        throw new Error(msgData.error || "获取消息失败");
      }

      setOtherUser({
        displayName: convData.conversation.otherUserDisplayName || "用户",
        avatar: convData.conversation.otherUserAvatar || "",
      });

      setMessages(msgData.messages || []);

      // 标记消息为已读
      await markAsRead();
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取消息失败");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await fetch(`/api/conversations/${conversationId}/messages/read`, {
        method: "POST",
      });
    } catch {
      // 忽略错误
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage.trim(), messageType: "text" }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "发送失败");
      }

      setNewMessage("");
      await fetchMessages();
    } catch (err) {
      setError(err instanceof Error ? err.message : "发送失败");
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "今天";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "昨天";
    } else {
      return date.toLocaleDateString("zh-CN", { month: "long", day: "numeric" });
    }
  };

  // 按日期分组消息
  const groupedMessages: { date: string; messages: Message[] }[] = [];
  let currentDate = "";

  messages.forEach((msg) => {
    const msgDate = formatDate(msg.createdAt);
    if (msgDate !== currentDate) {
      currentDate = msgDate;
      groupedMessages.push({ date: msgDate, messages: [msg] });
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(msg);
    }
  });

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
          <Link
            href="/messages"
            className="mt-4 inline-block text-sm text-clay hover:underline"
          >
            返回消息列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-line bg-white/80 px-4 py-3 dark:bg-surface-dark dark:border-stone-700/50">
        <Link
          href="/messages"
          className="rounded-lg p-2 hover:bg-stone-100 dark:hover:bg-stone-700"
        >
          <svg
            className="h-5 w-5 text-ink dark:text-ink-light"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-200 text-sm font-medium text-ink/60 dark:bg-stone-700 dark:text-ink-light/60">
            {otherUser.displayName?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="text-sm font-medium text-ink dark:text-ink-light">
              {otherUser.displayName}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {groupedMessages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-sm text-ink/40 dark:text-ink-light/35">
              暂无消息,发送第一条消息开始对话吧
            </p>
          </div>
        ) : (
          groupedMessages.map((group) => (
            <div key={group.date}>
              {/* Date Separator */}
              <div className="mb-4 flex items-center justify-center">
                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-ink/50 dark:bg-stone-800 dark:text-ink-light/50">
                  {group.date}
                </span>
              </div>

              {/* Messages */}
              {group.messages.map((msg, index) => {
                const isOwn = currentUserId && msg.senderId === currentUserId;
                const showAvatar =
                  index === 0 ||
                  group.messages[index - 1].senderId !== msg.senderId;

                return (
                  <div
                    key={msg.id}
                    className={cn("mb-3 flex", isOwn ? "justify-end" : "justify-start")}
                  >
                    {!isOwn && showAvatar && (
                      <div className="mr-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-stone-200 text-xs text-ink/60 dark:bg-stone-700 dark:text-ink-light/60">
                        {otherUser.displayName?.[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                    {!isOwn && !showAvatar && <div className="mr-2 w-8" />}

                    <div
                      className={cn(
                        "max-w-[70%] rounded-2xl px-4 py-2",
                        isOwn
                          ? "bg-clay text-white dark:bg-clay/80"
                          : "bg-stone-100 text-ink dark:bg-stone-700 dark:text-ink-light"
                      )}
                    >
                      <p className="whitespace-pre-wrap text-sm break-words">
                        {msg.messageType === "image" ? (
                          <img
                            src={msg.imageUrl}
                            alt="图片消息"
                            className="max-w-full rounded-lg"
                          />
                        ) : (
                          msg.content
                        )}
                      </p>
                      <p
                        className={cn(
                          "mt-1 text-[10px]",
                          isOwn ? "text-white/70" : "text-ink/40 dark:text-ink-light/40"
                        )}
                      >
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-line bg-white/80 px-4 py-3 dark:bg-surface-dark dark:border-stone-700/50">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息..."
            rows={1}
            className="flex-1 resize-none rounded-2xl border border-line bg-white/50 px-4 py-2 text-sm text-ink outline-none focus:border-clay/60 dark:bg-surface-dark dark:text-ink-light dark:border-stone-700/60"
            style={{ minHeight: "40px", maxHeight: "120px" }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className={cn(
              "rounded-full p-2 transition",
              newMessage.trim() && !sending
                ? "bg-clay text-white hover:bg-clay/90"
                : "bg-stone-200 text-ink/40 dark:bg-stone-700 dark:text-ink-light/40"
            )}
          >
            {sending ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
