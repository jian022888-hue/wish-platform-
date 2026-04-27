"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { WishStatus } from "@/types";

interface StatusManagerProps {
  wishId: string;
  currentStatus: WishStatus;
}

const statusOptions: { value: WishStatus; label: string; description: string }[] = [
  { value: "open", label: "开放中", description: "等待回声和回应" },
  { value: "clarifying", label: "整理中", description: "正在梳理愿望细节" },
  { value: "in_progress", label: "进行中", description: "已开始推进" },
  { value: "supported", label: "已获得支持", description: "收到关键帮助" },
  { value: "completed", label: "已完成", description: "愿望已达成" },
];

export function StatusManager({ wishId, currentStatus }: StatusManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<WishStatus>(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleUpdate = async () => {
    setIsUpdating(true);
    setError(null);

    try {
      const res = await fetch(`/api/wishes/${wishId}/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selectedStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "更新状态失败");
      }

      router.refresh();
      setIsOpen(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "更新状态失败，请稍后重试",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-[20px] border border-stone-200 bg-white/80 px-4 py-3 text-left text-sm transition hover:border-clay/40 dark:border-stone-700/60 dark:bg-surface-dark"
        type="button"
      >
        <span className="text-ink/70 dark:text-ink-light/70">更新状态</span>
        <svg
          className={cn(
            "h-4 w-4 transition-transform dark:text-ink-light/70",
            isOpen && "rotate-180",
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-3 space-y-2 rounded-[20px] border border-stone-200 bg-white p-4 dark:border-stone-700/60 dark:bg-surface-dark">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl p-3 text-left transition",
                selectedStatus === option.value
                  ? "bg-stone-100 dark:bg-stone-800"
                  : "hover:bg-stone-50 dark:hover:bg-stone-800/50",
              )}
              onClick={() => setSelectedStatus(option.value)}
              type="button"
            >
              <span
                className={cn(
                  "mt-0.5 block h-4 w-4 rounded-full border",
                  selectedStatus === option.value
                    ? "border-clay bg-clay"
                    : "border-stone-300 dark:border-stone-600",
                )}
              >
                {selectedStatus === option.value && (
                  <svg
                    className="h-3 w-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </span>
              <div>
                <p className="text-sm font-medium text-ink dark:text-ink-light">{option.label}</p>
                <p className="text-xs text-ink/52 dark:text-ink-light/52">{option.description}</p>
              </div>
            </button>
          ))}

          {error && (
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              className="rounded-full px-4 py-2 text-sm text-ink/60 transition hover:text-ink dark:text-ink-light/60 dark:hover:text-ink-light"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              取消
            </button>
            <button
              className={cn(
                "rounded-full px-4 py-2 text-sm text-white transition",
                selectedStatus === currentStatus
                  ? "bg-stone-300 cursor-not-allowed dark:bg-stone-700"
                  : "bg-ink hover:bg-ink/90 dark:bg-ink-light dark:hover:bg-ink-light/90 dark:text-background-dark",
              )}
              disabled={isUpdating || selectedStatus === currentStatus}
              onClick={handleUpdate}
              type="button"
            >
              {isUpdating ? "更新中..." : "确认更新"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
