"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface WishPaginationProps {
  currentPage: number;
  totalPages: number;
}

export function WishPagination({ currentPage, totalPages }: WishPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/?${params.toString()}`);
  };

  const pages: (number | "...")[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);

    if (currentPage > 3) {
      pages.push("...");
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    pages.push(totalPages);
  }

  return (
    <div className="mt-10 flex items-center justify-center gap-2">
      <button
        className={cn(
          "rounded-lg border px-3 py-2 text-sm transition",
          currentPage === 1
            ? "border-stone-200 text-ink/30 cursor-not-allowed dark:border-stone-700 dark:text-ink-light/20"
            : "border-line text-ink/70 hover:border-clay/50 hover:text-ink dark:border-stone-700 dark:text-ink-light/70 dark:hover:text-ink-light dark:border-stone-600",
        )}
        disabled={currentPage === 1}
        onClick={() => goToPage(currentPage - 1)}
        type="button"
      >
        上一页
      </button>

      {pages.map((page, index) =>
        page === "..." ? (
          <span className="px-2 text-ink/40" key={`ellipsis-${index}`}>
            ...
          </span>
        ) : (
          <button
            className={cn(
              "rounded-lg border px-3 py-2 text-sm transition",
              page === currentPage
                ? "border-ink bg-ink text-white dark:border-ink-light dark:bg-ink-light dark:text-background-dark"
                : "border-line text-ink/70 hover:border-clay/50 hover:text-ink dark:border-stone-700 dark:text-ink-light/70 dark:hover:text-ink-light dark:border-stone-600",
            )}
            key={page}
            onClick={() => goToPage(page)}
            type="button"
          >
            {page}
          </button>
        ),
      )}

      <button
        className={cn(
          "rounded-lg border px-3 py-2 text-sm transition",
          currentPage === totalPages
            ? "border-stone-200 text-ink/30 cursor-not-allowed dark:border-stone-700 dark:text-ink-light/20"
            : "border-line text-ink/70 hover:border-clay/50 hover:text-ink dark:border-stone-700 dark:text-ink-light/70 dark:hover:text-ink-light dark:border-stone-600",
        )}
        disabled={currentPage === totalPages}
        onClick={() => goToPage(currentPage + 1)}
        type="button"
      >
        下一页
      </button>
    </div>
  );
}
