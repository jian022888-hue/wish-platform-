import { AIWishResponse } from "@/components/ai/ai-wish-response";
import { FeaturedWishSection } from "@/components/wish/featured-wish-section";
import { HeroSection } from "@/components/wish/hero-section";
import { WishListSection } from "@/components/wish/wish-list-section";
import { WishSearchSection } from "@/components/wish/wish-search-section";
import { getFeaturedWishes, getWishes } from "@/lib/wishes";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    category?: string;
    status?: string;
    search?: string;
  }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const limit = parseInt(params.limit || "12");
  const category = params.category;
  const status = params.status;
  const search = params.search;

  const featuredWishes = await getFeaturedWishes();
  let wishes = await getWishes();

  let filteredWishes = [...wishes];

  if (category) {
    filteredWishes = filteredWishes.filter((w) => w.category === category);
  }
  if (status) {
    filteredWishes = filteredWishes.filter((w) => w.status === status);
  }
  if (search) {
    const searchLower = search.toLowerCase();
    filteredWishes = filteredWishes.filter(
      (w) =>
        w.title.toLowerCase().includes(searchLower) ||
        w.description.toLowerCase().includes(searchLower) ||
        w.summary.toLowerCase().includes(searchLower),
    );
  }

  const total = filteredWishes.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const paginatedWishes = filteredWishes.slice(start, start + limit);

  const latestWishes = wishes.filter((wish) => !wish.featured);
  const waitingEchoCount = wishes.filter(
    (wish) => wish.status === "open" || wish.status === "clarifying",
  ).length;

  const hasFilters = Boolean(category || status || search);

  return (
    <div className="pb-12 sm:pb-16">
      <HeroSection wishes={wishes} />

      <section className="page-shell py-4 sm:py-6">
        <div className="border-y border-stone-200 py-5 text-center text-sm tracking-[0.12em] text-ink/48 dark:border-stone-700/50 dark:text-ink-light/45">
          此刻，有 {waitingEchoCount} 个愿望正在等待回声
        </div>
      </section>

      {!hasFilters && (
        <>
          <FeaturedWishSection wishes={featuredWishes} />
          {featuredWishes.length > 0 && (
            <AIWishResponse wish={featuredWishes[0]} />
          )}
          <WishListSection wishes={latestWishes} />
        </>
      )}

      {hasFilters && (
        <WishSearchSection
          wishes={paginatedWishes}
          total={total}
          page={page}
          limit={limit}
          totalPages={totalPages}
          search={search}
          category={category}
          status={status}
        />
      )}
    </div>
  );
}
