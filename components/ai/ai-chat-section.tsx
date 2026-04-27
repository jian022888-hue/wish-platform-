"use client";

import { useState, useRef, useEffect } from "react";
import { consumeSSEStream } from "@/lib/sse-parser";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function AIChatSection() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 72)}px`;
    }
  }, [input]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setIsStreaming(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "AI 回复失败");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      await consumeSSEStream(res, (content) => {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.role === "assistant") {
            updated[updated.length - 1] = { ...last, content: last.content + content };
          }
          return updated;
        });
      });

      setIsStreaming(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "发生未知错误";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `抱歉，出了点问题：${errorMsg}` },
      ]);
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <section className="page-shell py-10 sm:py-14">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-clay">✦</span>
          <p className="eyebrow">和 AI 聊聊你的想法</p>
        </div>

        <div className="overflow-hidden rounded-2xl bg-sand/20 dark:bg-surface-dark">
          <div
            className="max-h-[400px] overflow-y-auto px-4 py-5 sm:px-6"
            ref={scrollRef}
          >
            {messages.length === 0 ? (
              <div className="flex min-h-[120px] items-center justify-center">
                <p className="text-sm text-ink/40 dark:text-ink-light/40">
                  说说你最近在想什么？我来帮你梳理一下
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg, i) => (
                  <div
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    key={i}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-7 ${
                        msg.role === "user"
                          ? "bg-ink text-white dark:bg-ink-light dark:text-background-dark"
                          : "bg-white/80 text-ink dark:bg-surface-dark-elevated dark:text-ink-light"
                      }`}
                    >
                      {msg.content}
                      {msg.role === "assistant" &&
                        isStreaming &&
                        i === messages.length - 1 && (
                          <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-ink/40 dark:bg-ink-light/40" />
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-stone-200/60 px-4 py-3 sm:px-6 dark:border-stone-700/50">
            <div className="flex items-end gap-2">
              <textarea
                className="max-h-[72px] min-h-[36px] flex-1 resize-none rounded-xl border border-stone-200/80 bg-white px-3 py-2 text-sm leading-6 text-ink outline-none transition placeholder:text-ink/35 focus:border-clay/60 dark:border-stone-700/60 dark:bg-surface-dark-elevated dark:text-ink-light dark:placeholder:text-ink-light/30"
                disabled={isStreaming}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="说点什么…"
                ref={textareaRef}
                rows={1}
                value={input}
              />
              <button
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink text-white transition hover:bg-ink/85 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-ink-light dark:text-background-dark dark:hover:bg-ink-light/85"
                disabled={isStreaming || !input.trim()}
                onClick={sendMessage}
                type="button"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
