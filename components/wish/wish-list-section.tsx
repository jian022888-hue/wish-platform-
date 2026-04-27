"use client";

import { useState } from "react";
import { WishCard } from "@/components/wish/wish-card";
import { Badge } from "@/components/ui/badge";
import type { Wish } from "@/types";

const categoryFilters = ["全部", "Life", "Creative", "Learning", "Career", "Community"];
const statusFilters = ["全部", "等待回应", "整理中", "推进中", "已连接帮助"];

const statusMapping: Record<string, string[]> = {
  "全部": [],
  "等待回应": ["open", "clarifying"],
  "整理中": ["clarifying"],
  "推进中": ["in_progress"],
  "已连接帮助": ["supported"],
};

interface WishListSectionProps {
  wishes: Wish[];
}

export function WishListSection({ wishes }: WishListSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [selectedStatus, setSelectedStatus] = useState("全部");

  const filteredWishes = wishes.filter((wish) => {
    const categoryMatch = selectedCategory === "全部" || wish.category === selectedCategory;
    const statusMatch = selectedStatus === "全部" || statusMapping[selectedStatus]?.includes(wish.status);
    return categoryMatch && statusMatch;
  });

  return (
    <section className="page-shell pb-16 pt-8 sm:pb-24 sm:pt-10" id="wish-stream">
      <div className="mb-10 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
        <div>
          <p className="eyebrow">愿望流</p>
          <h2 className="mt-2 font-serif text-4xl leading-[1.18] text-ink dark:text-ink-light">
            更多愿望，
            <br className="hidden sm:block" />
            正在等待回声。
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/65 dark:text-ink-light/65">
            它们还没有被完全推进，但每一张都像一页被贴在墙上的信纸，等待有人轻轻停下来，认真看完。
          </p>
          <div className="mt-4">
            <Badge tone="soft">回应不是评论，而是帮助输入</Badge>
          </div>
        </div>

        <div className="border-t border-stone-200 pt-4 sm:pt-5 dark:border-stone-700">
          <div className="flex flex-wrap gap-2">
            {categoryFilters.map((item) => (
              <button
                className={`border-b px-0 py-1.5 text-sm transition ${
                  selectedCategory === item
                    ? "border-ink text-ink dark:border-ink-light dark:text-ink-light"
                    : "border-transparent text-ink/45 hover:border-clay/40 hover:text-ink dark:text-ink-light/45 dark:hover:text-ink-light"
                }`}
                key={item}
                type="button"
                onClick={() => setSelectedCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {statusFilters.map((item) => (
              <button
                className={`border-b px-0 py-1.5 text-sm transition ${
                  selectedStatus === item
                    ? "border-ink text-ink dark:border-ink-light dark:text-ink-light"
                    : "border-transparent text-ink/45 hover:border-clay/35 hover:text-ink dark:text-ink-light/45 dark:hover:text-ink-light"
                }`}
                key={item}
                type="button"
                onClick={() => setSelectedStatus(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredWishes.length > 0 ? (
        <div className="columns-1 md:columns-2 xl:columns-3 [column-gap:2.75rem]">
          {filteredWishes.map((wish, index) => (
            <WishCard
              className={index % 3 === 1 ? "mb-12 md:mt-10" : index % 3 === 2 ? "mb-12 md:mt-4" : "mb-12"}
              key={wish.id}
              wish={wish}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-ink/40 dark:text-ink-light/40">
          <p className="text-lg">暂无符合条件的愿望</p>
          <p className="text-sm mt-2">试试调整筛选条件</p>
        </div>
      )}
    </section>
  );
}
