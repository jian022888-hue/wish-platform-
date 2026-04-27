"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Conversation, MessageRequest } from "@/types";

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [requests, setRequests] = useState<MessageRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"active" | "archived">("active");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
  }, [viewMode]);

  const fetchConversations = async () => {
    try {
      const res = await fetch(`/api/conversations?status=${viewMode}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "获取消息列表失败");
      }
      setConversations(data.conversations || []);
      setRequests(data.requests || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取消息列表失败");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId: string, action: "accept" | "ignore") => {
    try {
      const res = await fetch(`/api/message-requests/${requestId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "操作失败");
      }
      fetchConversations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
    }
  };

  const handleConversationAction = async (convId: string, action: "archive" | "unarchive" | "delete") => {
    try {
      const res = await fetch(`/api/conversations/${convId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "操作失败");
      }
      setActiveMenuId(null);
      fetchConversations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
    }
  };

  // Filter client side based on search
  const filteredConversations = conversations.filter((conv) => 
    conv.otherUserDisplayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.wishContextTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <div className="page-shell py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-3xl text-ink dark:text-ink-light">消息</h1>
        <div className="flex items-center gap-2 text-sm">
          <button
            className={cn(
              "rounded-full px-3 py-1 transition",
              viewMode === "active" ? "bg-ink text-white dark:bg-ink-light dark:text-background-dark" : "text-ink/60 hover:text-ink dark:text-ink-light/60 dark:hover:text-ink-light"
            )}
            onClick={() => setViewMode("active")}
          >
            聊天
          </button>
          <button
            className={cn(
              "rounded-full px-3 py-1 transition",
              viewMode === "archived" ? "bg-ink text-white dark:bg-ink-light dark:text-background-dark" : "text-ink/60 hover:text-ink dark:text-ink-light/55 dark:hover:text-ink-light"
            )}
            onClick={() => setViewMode("archived")}
          >
            归档
          </button>
        </div>
      </div>

      {requests.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-2 text-sm font-medium text-ink/68 dark:text-ink-light/60">陌生人消息请求 ({requests.length})</h2>
          {/* Requests UI (same as before) */}
          <div className="space-y-2">
            {requests.map((req) => (
              <div key={req.id} className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800/40 dark:bg-amber-900/15">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-ink dark:text-ink-light">{req.senderDisplayName || "用户"}</p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleRequestAction(req.id, "accept")}>接受</Button>
                    <Button size="sm" variant="secondary" onClick={() => handleRequestAction(req.id, "ignore")}>忽略</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Bar */}
      {viewMode === "active" && (
        <div className="mb-6">
          <input
            type="text"
            placeholder="搜索联系人..."
            className="w-full rounded-2xl border border-line bg-white/50 px-4 py-3 text-sm text-ink outline-none focus:border-clay/60 dark:bg-surface-dark dark:text-ink-light dark:placeholder:text-ink-light/30 dark:border-stone-700/60"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {/* Chat List */}
      <div className="mb-8">
        {filteredConversations.length === 0 ? (
          <div className="rounded-[28px] border border-stone-200 bg-gradient-to-b from-white to-stone-50/50 py-16 text-center dark:border-stone-700/40 dark:bg-surface-dark dark:from-transparent dark:to-transparent">
             <p className="text-ink/40 dark:text-ink-light/35">暂无对话</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredConversations.map((conv) => (
              <div key={conv.id} className="relative group">
                <Link
                  href={`/messages/${conv.id}`}
                  className="flex items-center gap-4 rounded-2xl border border-line bg-white/80 p-4 transition hover:border-clay/40 dark:bg-surface-dark dark:border-stone-700/50 dark:hover:border-clay/40"
                >
                  <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-200 text-sm font-medium text-ink/60 dark:bg-stone-700 dark:text-ink-light/60">
                      {conv.otherUserDisplayName?.[0]?.toUpperCase() || "U"}
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-clay text-[10px] font-bold text-white">
                        {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className={cn("truncate text-sm", conv.unreadCount > 0 ? "font-semibold text-ink dark:text-ink-light" : "font-medium text-ink dark:text-ink-light")}>
                          {conv.otherUserDisplayName || "用户"}
                        </p>
                        <span className="text-xs text-ink/40 dark:text-ink-light/35">
                          {conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }) : ""}
                        </span>
                      </div>
                      <p className={cn("truncate text-sm", conv.unreadCount > 0 ? "font-medium text-ink/80 dark:text-ink-light/70" : "text-ink/60 dark:text-ink-light/50")}>
                        {conv.lastMessage?.messageType === "image" 
                          ? "🖼️ [图片]" 
                          : (conv.lastMessage?.content || "开始对话...")
                        }
                      </p>
                    </div>
                </Link>
                
                {/* Actions Menu Button */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition">
                   <button 
                     type="button"
                     className="rounded-full p-2 hover:bg-stone-100 dark:hover:bg-stone-700"
                     onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveMenuId(activeMenuId === conv.id ? null : conv.id); }}
                   >
                     <svg className="h-4 w-4 dark:text-ink-light/70" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                   </button>
                   
                   {activeMenuId === conv.id && (
                     <div className="absolute right-0 top-10 z-50 w-40 rounded-xl bg-white shadow-xl ring-1 ring-stone-200 py-1 dark:bg-surface-dark dark:ring-stone-700">
                       <button 
                         className="w-full px-4 py-2 text-left text-sm hover:bg-stone-50 dark:hover:bg-stone-700 dark:text-ink-light"
                         onClick={(e) => { e.stopPropagation(); handleConversationAction(conv.id, viewMode === "active" ? "archive" : "unarchive"); }}
                       >
                         {viewMode === "active" ? "归档对话" : "恢复对话"}
                       </button>
                       <button 
                         className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-stone-50 dark:text-red-400 dark:hover:bg-stone-700"
                         onClick={(e) => { e.stopPropagation(); handleConversationAction(conv.id, "delete"); }}
                       >
                         删除对话
                       </button>
                     </div>
                   )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
