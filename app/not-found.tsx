import { ButtonLink } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="page-shell flex min-h-[70vh] items-center py-16">
      <div className="surface max-w-2xl p-8 sm:p-10 dark:bg-surface-dark">
        <p className="eyebrow">没有找到这个愿望</p>
        <h1 className="mt-3 font-serif text-4xl leading-[1.25] text-ink dark:text-ink-light">
          这个页面也许还没有被写下，
          <br />
          或者已经离开了广场
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-8 text-ink/66 dark:text-ink-light/66">
          你可以回到愿望广场，继续看看那些正在等待回应、正在被推进，或者刚刚才被认真说清楚的事。
        </p>
        <ButtonLink className="mt-8" href="/" variant="secondary">
          回到愿望广场
        </ButtonLink>
      </div>
    </div>
  );
}

