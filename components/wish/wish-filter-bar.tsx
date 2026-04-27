"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { WishCategory } from "@/types";

const categories: { value: WishCategory | "all"; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "Life", label: "生活" },
  { value: "Creative", label: "创作" },
  { value: "Learning", label: "学习" },
  { value: "Career", label: "职业" },
  { value: "Community", label: "社群" },
];

const statusOptions: { value: string; label: string }[] = [
  { value: "all", label: "全部状态" },
  { value: "open", label: "开放中" },
  { value: "clarifying", label: "整理中" },
  { value: "in_progress", label: "进行中" },
  { value: "supported", label: "已获得支持" },
  { value: "completed", label: "已完成" },
];

interface WishFilterBarProps {
  initialSearch?: string;
  initialCategory?: string;
  initialStatus?: string;
}

export function WishFilterBar({
  initialSearch = "",
  initialCategory = "all",
  initialStatus = "all",
}: WishFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);

  const updateFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (searchTerm) {
      params.set("search", searchTerm);
    } else {
      params.delete("search");
    }

    if (selectedCategory !== "all") {
      params.set("category", selectedCategory);
    } else {
      params.delete("category");
    }

    if (selectedStatus !== "all") {
      params.set("status", selectedStatus);
    } else {
      params.delete("status");
    }

    params.delete("page");

    router.push(`/?${params.toString()}`);
  }, [searchTerm, selectedCategory, selectedStatus, router, searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters();
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="搜索愿望..."
          className="flex-1 rounded-[22px] border border-line bg-white px-4 py-3 text-sm leading-7 text-ink outline-none transition placeholder:text-ink/35 focus:border-clay/60 dark:bg-surface-dark dark:text-ink-light dark:placeholder:text-ink-light/35 dark:border-stone-700"
        />
        <button
          type="submit"
          className="rounded-full bg-ink px-6 py-3 text-sm text-white transition hover:bg-ink/90 dark:bg-ink-light dark:text-background-dark dark:hover:bg-ink-light/90"
        >
          搜索
        </button>
      </form>

      <div className="flex flex-wrap gap-3">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition",
                selectedCategory === cat.value
                  ? "border-ink bg-ink text-white dark:border-ink-light dark:bg-ink-light dark:text-background-dark"
                  : "border-line bg-white/80 text-ink/70 hover:border-clay/50 hover:text-ink dark:bg-surface-dark dark:text-ink-light/70 dark:hover:text-ink-light dark:border-stone-700",
              )}
              onClick={() => {
                setSelectedCategory(cat.value);
                setTimeout(() => {
                  const params = new URLSearchParams(searchParams.toString());
                  if (cat.value === "all") {
                    params.delete("category");
                  } else {
                    params.set("category", cat.value);
                  }
                  params.delete("page");
                  router.push(`/?${params.toString()}`);
                }, 0);
              }}
              type="button"
            >
              {cat.label}
            </button>
          ))}
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            const params = new URLSearchParams(searchParams.toString());
            if (e.target.value === "all") {
              params.delete("status");
            } else {
              params.set("status", e.target.value);
            }
            params.delete("page");
            router.push(`/?${params.toString()}`);
          }}
          className="rounded-full border border-line bg-white px-3 py-1.5 text-xs text-ink/70 outline-none transition focus:border-clay/60 dark:border-stone-700 dark:bg-surface-dark dark:text-ink-light/70"
        >
          {statusOptions.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
