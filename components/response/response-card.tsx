"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ResponseTypeBadge } from "@/components/response/response-type-badge";
import { formatDate } from "@/lib/utils";
import type { Response } from "@/types";

const responseHelperCopy: Record<Response["type"], string> = {
  Advice: "这条回应给出的，是一个更容易开始的判断或做法。",
  Resource: "这条回应提供的是可继续追下去的资源线索。",
  Introduction: "这条回应带来的，是人与人之间可能发生的连接。",
  Opportunity: "这条回应给出的，是一个可以继续接住的现实机会。",
  Support: "这条回应提供的是陪伴和托住第一步的支持。",
  "Similar Experience": "这条回应分享的是一段已经走过的真实经验。",
};

interface ResponseCardProps {
  response: Response;
  wishId: string;
  responderUserId?: string;
}

export function ResponseCard({ response, wishId, responderUserId }: ResponseCardProps) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleStartConversation = async () => {
    if (!responderUserId) return;

    setIsStarting(true);
    try {
      const res = await fetch("/api/message-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `你好，我在你的愿望回声中看到「${response.content.substring(0, 50)}${response.content.length > 50 ? "..." : ""}」，想和你进一步聊聊。`,
          wishContextId: wishId,
          targetUserId: responderUserId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "发起私信失败");
      }

      // Navigate to messages list
      router.push(`/messages`);
    } catch (err) {
      // Handle error
      console.error(err);
    } finally {
      setIsStarting(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <article className="rounded-[28px] bg-white/55 p-6 ring-1 ring-stone-200 sm:p-7 dark:bg-surface-dark dark:ring-stone-700/50">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="space-y-2">
            <ResponseTypeBadge type={response.type} />
            <div className="space-y-1">
              {response.isAnonymous ? (
                <p className="font-serif text-[1.65rem] text-ink dark:text-ink-light">匿名</p>
              ) : (
                <p className="font-serif text-[1.65rem] text-ink dark:text-ink-light">{response.authorName}</p>
              )}
              <p className="text-sm text-ink/46 dark:text-ink-light/40">{formatDate(response.createdAt)}</p>
            </div>
          </div>
          {responderUserId && (
            <button
              className="rounded-full border border-stone-200 px-3 py-1.5 text-xs text-ink/60 transition hover:border-clay/40 hover:text-ink dark:border-stone-700/60 dark:text-ink-light/55 dark:hover:text-ink-light"
              onClick={() => setShowConfirm(true)}
              type="button"
            >
              私信
            </button>
          )}
        </div>

        <div className="mt-6 rounded-[22px] bg-stone-100/70 px-4 py-3 dark:bg-stone-800/40">
          <p className="text-sm text-ink/52 dark:text-ink-light/45">这份回声想补上的，是这个愿望眼下最缺的一块。</p>
        </div>

        <p className="mt-5 text-[15px] leading-8 text-ink/78 dark:text-ink-light/75">{response.content}</p>

        <div className="mt-6 border-t border-stone-200 pt-4 dark:border-stone-700/50">
          <p className="text-[11px] uppercase tracking-[0.18em] text-clay">
            这条回应的帮助价值
          </p>
          <p className="mt-2 text-sm leading-7 text-ink/56 dark:text-ink-light/50">
            {responseHelperCopy[response.type]}
          </p>
        </div>
      </article>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl dark:bg-surface-dark">
            <h3 className="font-serif text-xl text-ink dark:text-ink-light">
              与 {response.authorName} 开始私信？
            </h3>
            <p className="mt-3 text-sm text-ink/60 dark:text-ink-light/60">
              私信将围绕这个愿望展开，双方都可以随时查看历史记录。
              首次消息将作为私信请求发送给对方。
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="rounded-full px-4 py-2 text-sm text-ink/60 transition hover:text-ink dark:text-ink-light/60 dark:hover:text-ink-light"
                onClick={() => setShowConfirm(false)}
                type="button"
              >
                取消
              </button>
              <button
                className="rounded-full bg-ink px-4 py-2 text-sm text-white transition hover:bg-ink/90 disabled:bg-stone-300 dark:bg-ink-light dark:text-background-dark dark:hover:bg-ink-light/90"
                disabled={isStarting}
                onClick={handleStartConversation}
                type="button"
              >
                {isStarting ? "发起中..." : "开始私信"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
