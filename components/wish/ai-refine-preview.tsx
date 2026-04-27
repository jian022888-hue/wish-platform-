import { Badge } from "@/components/ui/badge";
import { ResponseTypeBadge } from "@/components/response/response-type-badge";
import type { ResponseType } from "@/types";

interface AIRefinePreviewProps {
  title: string;
  description: string;
  whyImportant: string;
  currentBlocker: string;
  desiredResponseTypes: ResponseType[];
}

export function AIRefinePreview({
  title,
  description,
  whyImportant,
  currentBlocker,
  desiredResponseTypes,
}: AIRefinePreviewProps) {
  return (
    <div className="surface p-6 sm:p-7 dark:bg-surface-dark">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="eyebrow">AI 整理预览</p>
          <h3 className="mt-2 font-serif text-2xl text-ink dark:text-ink-light">让愿望更容易被理解</h3>
        </div>
        <Badge tone="moss">模拟整理结果</Badge>
      </div>

      <div className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-clay">标题</p>
          <p className="mt-2 font-serif text-xl text-ink dark:text-ink-light">{title}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-clay">愿望描述</p>
          <p className="mt-2 text-sm leading-7 text-ink/74 dark:text-ink-light/74">{description}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-clay">为什么重要</p>
          <p className="mt-2 text-sm leading-7 text-ink/74 dark:text-ink-light/74">{whyImportant}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-clay">当前卡点</p>
          <p className="mt-2 text-sm leading-7 text-ink/74 dark:text-ink-light/74">{currentBlocker}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-clay">希望得到的回应</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {desiredResponseTypes.map((type) => (
              <ResponseTypeBadge key={type} type={type} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
