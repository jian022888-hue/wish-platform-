import { formatDate } from "@/lib/utils";
import type { ProgressUpdate } from "@/types";

interface ProgressTimelineProps {
  updates: ProgressUpdate[];
}

export function ProgressTimeline({ updates }: ProgressTimelineProps) {
  if (updates.length === 0) {
    return (
      <div className="rounded-[32px] bg-stone-100/70 p-6 sm:p-7 dark:bg-surface-dark">
        <p className="text-[11px] uppercase tracking-[0.22em] text-clay">
          还在开始之前
        </p>
        <p className="mt-3 font-serif text-2xl text-ink dark:text-ink-light">
          这个愿望暂时还没有公开进展
        </p>
        <p className="mt-4 text-sm leading-7 text-ink/64 dark:text-ink-light/64">
          它现在仍停留在等待帮助输入的阶段。接下来最重要的，不是制造热闹，而是让第一步变得更具体、更现实一点。
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[36px] bg-stone-100/70 p-6 sm:p-8 dark:bg-surface-dark">
      <div className="flex items-center gap-4 border-b border-stone-200 pb-5 dark:border-stone-700">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#d4b395] bg-[#fff7ed] text-[11px] uppercase tracking-[0.14em] text-clay dark:border-clay/30 dark:bg-clay/15">
          官推
        </span>
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-clay">
            平台日志
          </p>
          <p className="mt-1 font-serif text-2xl text-ink dark:text-ink-light">
            它被怎样一点点往前接住
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-7 text-ink/60 dark:text-ink-light/60">
        这里记录的不是产品更新，而是平台帮忙对接、收小范围、补上第一步的真实过程。
      </p>

      <div className="mt-8 space-y-8">
        {updates.map((update, index) => (
          <div className="relative pl-12" key={update.id}>
            {index !== updates.length - 1 ? (
              <span className="absolute left-[19px] top-10 h-[calc(100%+1.8rem)] w-px bg-[#dcc8af] dark:bg-stone-600" />
            ) : null}
            <span className="absolute left-0 top-1 flex h-10 w-10 items-center justify-center rounded-full border border-[#d9bda2] bg-white text-[11px] text-clay dark:border-clay/25 dark:bg-surface-dark">
              {index + 1}
            </span>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.18em] text-clay">
                {formatDate(update.date)}
              </p>
              <h3 className="font-serif text-[1.5rem] leading-[1.38] text-ink dark:text-ink-light">
                {update.title}
              </h3>
              <p className="text-sm leading-7 text-ink/68 dark:text-ink-light/68">{update.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t border-stone-200 pt-5 dark:border-stone-700/50">
        <p className="text-sm leading-7 text-ink/56 dark:text-ink-light/50">
          每一条记录都代表这个愿望离现实近了一点。
        </p>
      </div>
    </div>
  );
}
