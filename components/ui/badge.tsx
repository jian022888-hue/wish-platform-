import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const tones = {
  neutral: "border-transparent bg-transparent text-ink/62 before:bg-ink/30 dark:text-ink-light/60 dark:before:bg-ink-light/40",
  soft: "border-transparent bg-transparent text-ink/56 before:bg-clay/50 dark:text-ink-light/55 dark:before:bg-clay/60",
  warm: "border-transparent bg-transparent text-clay before:bg-clay/70 dark:text-[#D4946C] dark:before:bg-[#D4946C]/70",
  moss: "border-transparent bg-transparent text-moss before:bg-moss/80 dark:text-[#7DA46E] dark:before:bg-[#7DA46E]/80",
  blush: "border-transparent bg-transparent text-[#8A6657] before:bg-[#B18D7C] dark:text-[#C08E7E] dark:before:bg-[#8C6757]",
  slate: "border-transparent bg-transparent text-[#566778] before:bg-[#7D8EA5] dark:text-[#8AAFC8] dark:before:bg-[#577188]",
};

interface BadgeProps {
  children: ReactNode;
  className?: string;
  tone?: keyof typeof tones;
}

export function Badge({
  children,
  className,
  tone = "neutral",
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-none border px-0 py-0 text-xs font-medium tracking-[0.04em] before:h-1.5 before:w-1.5 before:rounded-full before:content-['']",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
