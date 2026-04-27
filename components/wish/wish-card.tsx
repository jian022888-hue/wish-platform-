import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { WishStatusBadge } from "@/components/wish/wish-status-badge";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import type { Wish } from "@/types";

interface WishCardProps {
  wish: Wish;
  variant?: "default" | "featured";
  className?: string;
}

export function WishCard({
  wish,
  variant = "default",
  className,
}: WishCardProps) {
  const isFeatured = variant === "featured";

  return (
    <Link
      className={cn(
        "group relative block break-inside-avoid overflow-hidden border border-stone-200/90 transition duration-500 dark:border-stone-700/60",
        isFeatured
          ? "rounded-[28px] p-7 hover:bg-[#fffaf4] dark:hover:bg-surface-dark-hover dark:bg-surface-dark/40"
          : "rounded-[24px] bg-white/28 p-6 hover:bg-[#fffdfa] dark:bg-surface-dark dark:hover:bg-surface-dark-hover",
        className,
      )}
      href={`/wishes/${wish.id}`}
    >
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(239,223,201,0.38),transparent_48%)] opacity-0 transition duration-500 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_top_left,rgba(196,106,66,0.12),transparent_48%)]" />

      <div className="relative space-y-6">
        <div className="flex items-start justify-between gap-4">
          <p className="max-w-[22rem] text-base leading-8 text-ink/74 dark:text-ink-light/70">
            {wish.summary}
          </p>
          {wish.status === "in_progress" ? (
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d9bca0] bg-[#fff8ef] text-[10px] uppercase tracking-[0.14em] text-clay dark:bg-clay/15 dark:border-clay/25">
              官推
            </span>
          ) : null}
        </div>

        <div className="space-y-3">
          <h3
            className={cn(
              "max-w-xl font-serif text-ink transition group-hover:text-[#3C322B] dark:text-ink-light dark:group-hover:text-[#E8E6E3]",
              isFeatured
                ? "text-[2rem] leading-[1.34]"
                : "text-[1.7rem] leading-[1.4]",
            )}
          >
            {wish.title}
          </h3>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink/48 dark:text-ink-light/45">
            <Badge tone="soft">{wish.category}</Badge>
            <WishStatusBadge status={wish.status} />
            {wish.allowAnonymous && (
              <span className="rounded-full border border-clay/40 bg-sand/30 px-2 py-0.5 text-[10px] tracking-[0.06em] text-clay dark:bg-clay/10 dark:border-clay/30">匿名发布</span>
            )}
            <span>更新于 {formatDate(wish.updatedAt)}</span>
          </div>
        </div>
      </div>

      <div className="relative mt-8 flex items-center justify-between gap-4 border-t border-stone-200 pt-5 text-sm text-ink/56 dark:border-stone-700/60 dark:text-ink-light/50">
        {wish.status === "in_progress" && wish.progressUpdates.length > 0 ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {wish.progressUpdates.slice(0, 3).map((update, index) => (
                <div className="flex items-center gap-2" key={update.id}>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#caa47f] dark:bg-[#B8936A]" />
                  {index !== Math.min(wish.progressUpdates.length, 3) - 1 ? (
                    <span className="h-px w-6 bg-[#dcc4a9] dark:bg-[#5C5348]" />
                  ) : null}
                </div>
              ))}
            </div>
            <span>{wish.progressUpdates.length} 个推进节点</span>
          </div>
        ) : (
          <span>{wish.responseCount} 条帮助回应</span>
        )}
        <span className="text-ink/38 dark:text-ink-light/35">读下去</span>
      </div>
    </Link>
  );
}
