import { WishCard } from "@/components/wish/wish-card";
import { Badge } from "@/components/ui/badge";
import type { Wish } from "@/types";

interface FeaturedWishSectionProps {
  wishes: Wish[];
}

export function FeaturedWishSection({ wishes }: FeaturedWishSectionProps) {
  const leadWish = wishes[0];
  const restWishes = wishes.slice(1);

  if (!leadWish) {
    return null;
  }

  return (
    <section className="page-shell py-10 sm:py-14" id="featured-wishes">
      <div className="grid gap-12 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="space-y-4 pt-2">
          <p className="eyebrow">被认真接住的愿望</p>
          <h2 className="font-serif text-4xl leading-[1.16] text-ink dark:text-ink-light">
            有些念头，
            <br />
            已经开始往现实里落下去。
          </h2>
          <p className="text-sm leading-8 text-ink/58 dark:text-ink-light/58">
            它们不是因为更响亮才被看见，而是因为足够真实，终于有人愿意补上第一步。
          </p>
        </div>

        <div className="space-y-12">
          <WishCard variant="featured" wish={leadWish} />

          {restWishes.length > 0 ? (
            <div className="grid gap-10 lg:grid-cols-2">
              {restWishes.map((wish) => (
                <WishCard key={wish.id} variant="featured" wish={wish} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
