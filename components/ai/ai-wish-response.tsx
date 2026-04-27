"use client";

import { useState, useEffect, useRef } from "react";
import type { Wish } from "@/types";
import { consumeSSEStream } from "@/lib/sse-parser";

interface AIWishResponseProps {
  wish: Wish;
}

export function AIWishResponse({ wish }: AIWishResponseProps) {
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    async function fetchAIResponse() {
      try {
        const res = await fetch("/api/ai/wish-response", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wishId: wish.id,
            title: wish.title,
            description: wish.description,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || "AI 回应生成失败");
        }

        await consumeSSEStream(res, (content) => {
          setResponse((prev) => prev + content);
        });

        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "发生未知错误");
        setIsLoading(false);
      }
    }

    fetchAIResponse();
  }, [wish]);

  return (
    <section className="page-shell py-10 sm:py-14">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-clay">✦</span>
          <p className="eyebrow">AI 回声</p>
        </div>

        <div className="rounded-2xl bg-sand/30 p-6 sm:p-8 dark:bg-clay/10">
          <p className="mb-4 text-xs tracking-wide text-ink/48 dark:text-ink-light/48">
            回应愿望：{wish.title}
          </p>

          {isLoading && !response && (
            <div className="flex items-center gap-2 text-sm text-ink/60 dark:text-ink-light/60">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-clay/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-clay" />
              </span>
              AI 正在思考…
            </div>
          )}

          {error && (
            <p className="text-sm text-ink/50 dark:text-ink-light/50">{error}</p>
          )}

          {response && (
            <div className="font-serif text-[15px] leading-7 text-ink/80 dark:text-ink-light/75">
              {response}
              {isLoading && (
                <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-ink/40 dark:bg-ink-light/40" />
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
