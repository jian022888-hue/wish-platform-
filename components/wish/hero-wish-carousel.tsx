"use client";

import { useEffect, useState } from "react";

interface HeroWishCarouselProps {
  quotes: Array<{
    id: string;
    text: string;
    origin?: string;
  }>;
}

export function HeroWishCarousel({ quotes }: HeroWishCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (quotes.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % quotes.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [quotes.length]);

  return (
    <div className="relative min-h-[14rem] sm:min-h-[16rem]">
      {quotes.map((quote, index) => {
        const active = index === activeIndex;

        return (
          <div
            className={`absolute inset-0 transition-all duration-700 ${
              active
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-3 opacity-0"
            }`}
            key={quote.id}
          >
            <div className="space-y-5 text-center">
              <p className="mx-auto max-w-[12ch] font-serif text-[2.9rem] leading-[1.1] tracking-[-0.045em] text-ink dark:text-ink-light sm:max-w-[14ch] sm:text-[4.6rem] lg:text-[5.6rem]">
                {quote.text}
              </p>
              {quote.origin ? (
                <p className="text-sm text-ink/44 dark:text-ink-light/44">来自：{quote.origin}</p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
