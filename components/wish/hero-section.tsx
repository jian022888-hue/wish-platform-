import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { HeroWishCarousel } from "@/components/wish/hero-wish-carousel";
import type { Wish } from "@/types";

interface HeroSectionProps {
  wishes: Wish[];
}

export function HeroSection({ wishes }: HeroSectionProps) {
  const quotes = wishes.slice(0, 4).map((wish) => ({
    id: wish.id,
    text: wish.summary,
    origin: wish.allowAnonymous ? undefined : wish.originLabel,
  }));

  return (
    <section className="page-shell pt-12 sm:pt-16">
      <div className="relative overflow-hidden py-12 sm:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[620px] overflow-hidden">
          <div className="absolute left-[-6%] top-20 h-64 w-64 rounded-full bg-[#eed8bf]/35 blur-[120px] dark:bg-clay/12" />
          <div className="absolute right-[4%] top-8 h-80 w-80 rounded-full bg-[#f5e7d2]/40 blur-[135px] dark:bg-clay/10" />
          <div className="absolute left-[36%] top-28 h-56 w-56 rounded-full bg-[#fff7ea]/75 blur-[100px] dark:bg-clay/8" />
        </div>

        <div className="mx-auto flex min-h-[68vh] max-w-5xl flex-col items-center justify-center text-center">
          <div className="w-full space-y-8">
            <p className="eyebrow">愿望被回应的入口</p>
            <HeroWishCarousel quotes={quotes} />
            <p className="mx-auto max-w-xl text-lg leading-8 text-ink/58 sm:text-xl dark:text-ink-light/55">
              在这里，写下那个一直没开始的念头。
            </p>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            <ButtonLink href="/submit" size="lg" variant="primary">
              寄托一个愿望
            </ButtonLink>
            <ButtonLink href="#wish-stream" size="lg" variant="secondary">
              看看正在等待回声的愿望
            </ButtonLink>
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-5 text-sm text-ink/46 dark:text-ink-light/40">
            <Badge tone="soft">愿望会先被整理，再被理解</Badge>
            <Badge tone="soft">回应更像帮助，而不是评论</Badge>
          </div>
        </div>
      </div>
    </section>
  );
}
