"use client";

import { cn } from "@/lib/utils";
import type { WishCategory } from "@/types";

interface CategorySelectorProps {
  selected: WishCategory | null;
  onChange: (category: WishCategory) => void;
}

const categories: { value: WishCategory; label: string; icon: string }[] = [
  { value: "Life", label: "生活", icon: "🌱" },
  { value: "Creative", label: "创作", icon: "🎨" },
  { value: "Learning", label: "学习", icon: "📚" },
  { value: "Career", label: "职业", icon: "💼" },
  { value: "Community", label: "社群", icon: "🤝" },
];

export function CategorySelector({ selected, onChange }: CategorySelectorProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-ink/68 dark:text-ink-light/68">选择分类</p>
      <div className="flex flex-wrap gap-3">
        {categories.map((cat) => {
          const isSelected = selected === cat.value;
          return (
            <button
              key={cat.value}
              className={cn(
                "flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition",
                isSelected
                  ? "border-ink bg-ink text-white dark:border-ink-light dark:bg-ink-light dark:text-background-dark"
                  : "border-line bg-white/80 text-ink/70 hover:border-clay/50 hover:text-ink dark:bg-surface-dark dark:text-ink-light/70 dark:hover:text-ink-light dark:border-stone-700",
              )}
              onClick={() => onChange(cat.value)}
              type="button"
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
