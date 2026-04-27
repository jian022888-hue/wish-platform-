import { WishCard } from "@/components/wish/wish-card";
import { WishFilterBar } from "@/components/wish/wish-filter-bar";
import { WishPagination } from "@/components/wish/wish-pagination";
import type { Wish } from "@/types";

interface WishSearchSectionProps {
  wishes: Wish[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  search?: string;
  category?: string;
  status?: string;
}

export async function WishSearchSection({
  wishes,
  total,
  page,
  limit,
  totalPages,
  search = "",
  category = "",
  status = "",
}: WishSearchSectionProps) {
  return (
    <section className="page-shell py-8 sm:py-12">
      <div className="mb-8">
        <h2 className="font-serif text-3xl text-ink dark:text-ink-light">探索愿望</h2>
        <p className="mt-2 text-sm text-ink/60 dark:text-ink-light/60">
          {total > 0
            ? `找到 ${total} 个愿望`
            : "没有找到匹配的愿望"}
        </p>
      </div>

      <WishFilterBar
        initialSearch={search}
        initialCategory={category}
        initialStatus={status}
      />

      <div className="mt-8">
        {wishes.length > 0 ? (
          <>
            <div className="columns-1 md:columns-2 xl:columns-3 [column-gap:2.75rem]">
              {wishes.map((wish) => (
                <WishCard className="mb-10" key={wish.id} wish={wish} />
              ))}
            </div>

            <WishPagination
              currentPage={page}
              totalPages={totalPages}
            />
          </>
        ) : (
          <div className="py-16 text-center text-ink/40 dark:text-ink-light/40">
            <p className="text-lg">暂无符合条件的愿望</p>
            <p className="mt-2 text-sm">试试调整筛选条件或搜索词</p>
          </div>
        )}
      </div>
    </section>
  );
}
