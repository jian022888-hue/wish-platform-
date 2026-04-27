"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FollowButton } from "@/components/ui/follow-button";
import { cn } from "@/lib/utils";
import { formatMessageGroupDate, formatMessageTime } from "@/lib/utils/format-message-time";
import type { Message, Conversation } from "@/types";

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [deletingMsg, setDeletingMsg] = useState<string | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Pagination
  const PAGE_SIZE = 20;
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Optimistic sending: track messages we just sent
  const [optimisticMsgId, setOptimisticMsgId] = useState<string | null>(null);

  useEffect(() => {
    if (conversationId) {
      fetchConversation(1);
    }
  }, [conversationId]);

  // Determine target user ID for FollowButton
  useEffect(() => {
    if (conversation) {
      const currentUserId = "me"; // Handled by server via session, but we can pass it
      const otherId = conversation.userAId !== "me" ? conversation.userAId : conversation.userBId;
      setTargetUserId(otherId);
    }
  }, [conversation]);

  const fetchConversation = async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const res = await fetch(`/api/conversations/${conversationId}?page=${pageNum}&pageSize=${PAGE_SIZE}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "获取对话失败");
      }

      if (!append) {
        setConversation(data.conversation);
        setMessages(data.messages || []);
      } else {
        // Prepend older messages
        setMessages((prev) => [...(data.messages || []), ...prev]);
      }
      
      setHasMore((data.messages || []).length >= PAGE_SIZE);
      setPage(pageNum);
      
      // Mark as read
      if (!append) markAsRead();
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取对话失败");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop } = messagesContainerRef.current;
    if (scrollTop < 50 && hasMore && !loadingMore) {
      // Load more messages
      fetchConversation(page + 1, true);
    }
  };

  const markAsRead = async () => {
    try {
      await fetch(`/api/conversations/${conversationId}/read`, { method: "POST" });
      // Trigger global unread count update
      window.dispatchEvent(new CustomEvent("messages-unread-update"));
    } catch (err) {
      console.error("标记已读失败", err);
    }
  };

  const deleteMessage = async (messageId: string) => {
    setDeletingMsg(messageId);
    try {
      const res = await fetch(`/api/messages/${messageId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "删除失败");
      }
      // Remove from local state
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      setShowDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败");
    } finally {
      setDeletingMsg(null);
    }
  };

  const handleLongPress = (msgId: string) => {
    setShowDeleteConfirm(msgId);
  };

  const sendMessage = async (imageUrl?: string) => {
    if (!content.trim() && !imageUrl) return;

    setSending(true);
    setError(null);
    const tempId = `temp-${Date.now()}`;
    setOptimisticMsgId(tempId);

    // Optimistic update
    const newMsg: Message = {
      id: tempId,
      conversationId,
      senderId: "me",
      content: content.trim() || "[图片]",
      messageType: imageUrl ? "image" : "text",
      imageUrl: imageUrl || undefined,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setContent("");
    setPreviewImage(null);
    setPendingImageUrl(null);

    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content: content.trim() || "[图片]",
          messageType: imageUrl ? "image" : "text",
          imageUrl: imageUrl || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "发送失败");
      }
      
      // Refresh messages to get real IDs
      fetchConversation(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "发送失败");
    } finally {
      setSending(false);
      setOptimisticMsgId(null);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("请上传图片文件");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("图片大小不能超过 5MB");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);
    setError(null);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "上传失败");
      }

      setPendingImageUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
      setPreviewImage(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (pendingImageUrl) {
        sendMessage(pendingImageUrl);
      } else {
        sendMessage();
      }
    }
  };

  const handleTextareaInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center dark:bg-background-dark">
        <div className="text-ink/50 dark:text-ink-light/50">加载中...</div>
      </div>
    );
  }

  if (error && !conversation) {
    return (
      <div className="page-shell py-8">
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
        <Link href="/messages" className="mt-4 inline-block text-sm text-clay">
          返回消息列表
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-stone-50/95 backdrop-blur dark:border-stone-700 dark:bg-stone-900/95">
        <div className="page-shell flex h-16 items-center gap-4">
          <Link
            href="/messages"
            className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-stone-200"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium text-ink">
                {conversation?.otherUserDisplayName || conversation?.otherUserName || "用户"}
              </p>
              {targetUserId && <FollowButton targetUserId={targetUserId} />}
            </div>
            {conversation?.wishContextTitle && (
              <p className="truncate text-xs text-ink/50">
                来自「{conversation.wishContextTitle}」
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-6"
      >
        <div className="page-shell mx-auto max-w-2xl space-y-4">
          {loadingMore && (
            <div className="flex justify-center py-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-ink" />
            </div>
          )}
          
          {/* Messages list with time grouping */}
          {messages.map((msg, index) => {
            const isOtherUser = msg.senderName === conversation?.otherUserDisplayName;
            const showDate = formatMessageGroupDate(msg.createdAt);
            
            // Check if previous message is from same user (for grouping)
            const prevMsg = index > 0 ? messages[index - 1] : null;
            const isContinuation = prevMsg && prevMsg.senderId === msg.senderId;

            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="flex justify-center py-2">
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-ink/50 dark:bg-stone-800 dark:text-ink-light/50">
                      {showDate}
                    </span>
                  </div>
                )}
                <div
                  className={cn(
                    "flex transition-all duration-300 ease-out",
                    msg.id === optimisticMsgId ? "animate-slide-in" : "",
                    isOtherUser ? "justify-start" : "justify-end",
                    isContinuation ? "mt-1" : "mt-4"
                  )}
                >
                  <div className="relative group">
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                        isOtherUser 
                          ? "bg-stone-200 text-ink dark:bg-stone-700 dark:text-ink-light" 
                          : "bg-ink text-white dark:bg-surface-dark-hover dark:text-ink-light"
                      )}
                    >
                      {msg.messageType === "image" && msg.imageUrl && (
                        <div className="mb-2 overflow-hidden rounded-lg">
                          <img src={msg.imageUrl} alt="图片消息" className="max-h-64 w-auto object-cover" />
                        </div>
                      )}
                      {msg.content !== "[图片]" && (
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      )}
                      <div className="mt-1 flex items-center justify-end gap-1.5">
                        <p className={cn("text-xs", isOtherUser ? "text-ink/40" : "text-white/60")}>
                          {formatMessageTime(msg.createdAt)}
                        </p>
                        {!isOtherUser && msg.isRead && (
                          <svg className="h-3.5 w-3.5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    
                    {/* Delete button (only for own messages) */}
                    {!isOtherUser && (
                      <>
                        <button
                          type="button"
                          className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition p-1 hover:text-red-600"
                          onClick={() => handleLongPress(msg.id)}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        
                        {/* Delete confirmation */}
                        {showDeleteConfirm === msg.id && (
                          <div className="absolute right-0 top-full mt-2 z-50 w-48 rounded-xl bg-white shadow-xl ring-1 ring-stone-200 py-1">
                            <p className="px-4 py-2 text-xs text-ink/60 border-b border-stone-100">确定删除这条消息？</p>
                            <button
                              type="button"
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-stone-50"
                              onClick={() => deleteMessage(msg.id)}
                              disabled={deletingMsg === msg.id}
                            >
                              {deletingMsg === msg.id ? "删除中..." : "删除"}
                            </button>
                            <button
                              type="button"
                              className="w-full px-4 py-2 text-left text-sm hover:bg-stone-50"
                              onClick={() => setShowDeleteConfirm(null)}
                            >
                              取消
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-stone-200 bg-white dark:border-stone-700 dark:bg-surface-dark p-4">
        <div className="page-shell mx-auto max-w-2xl">
          {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
          
          {previewImage && (
            <div className="mb-3 relative">
              <div className="inline-block rounded-lg overflow-hidden border border-stone-200">
                <img src={previewImage} alt="预览" className="max-h-32 w-auto object-cover" />
              </div>
              <button
                type="button"
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-stone-800 text-white text-xs hover:bg-stone-900"
                onClick={() => { setPreviewImage(null); setPendingImageUrl(null); }}
              >
                ×
              </button>
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                </div>
              )}
            </div>
          )}
          
          <div className="flex items-end gap-3">
            <button
              type="button"
              className={cn(
                "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition",
                "text-ink/50 hover:bg-stone-100 hover:text-ink/70",
                uploading && "pointer-events-none opacity-50"
              )}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={handleImageUpload}
              disabled={uploading}
            />
            
            <textarea
              ref={textareaRef}
              className="flex-1 resize-none rounded-2xl border border-line bg-stone-50 px-4 py-3 text-sm leading-6 text-ink outline-none transition placeholder:text-ink/35 focus:border-clay/60 dark:bg-stone-800 dark:text-ink-light dark:placeholder:text-ink-light/35"
              placeholder={pendingImageUrl ? "添加文字说明（可选）..." : "输入消息..."}
              rows={1}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              onInput={handleTextareaInput}
            />
            
            <Button
              className="h-10 px-6 flex-shrink-0"
              disabled={sending || uploading || (!content.trim() && !pendingImageUrl)}
              onClick={() => pendingImageUrl ? sendMessage(pendingImageUrl) : sendMessage()}
            >
              {sending || uploading ? "发送中..." : "发送"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
