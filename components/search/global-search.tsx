"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface SearchResult {
  type: "wish" | "user";
  id: string;
  title?: string;
  summary?: string;
  displayName?: string;
  avatarUrl?: string;
}

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      search(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const search = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();

      if (data.success) {
        setResults(data.results || []);
        setShowResults(true);
      }
    } catch {
      // 忽略错误
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      const result = results[selectedIndex];
      navigateToResult(result);
    } else if (e.key === "Escape") {
      setShowResults(false);
    }
  };

  const navigateToResult = (result: SearchResult) => {
    if (result.type === "wish") {
      router.push(`/wishes/${result.id}`);
    } else if (result.type === "user") {
      router.push(`/profile/${result.id}`);
    }
    setShowResults(false);
    setQuery("");
  };

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="搜索愿望、用户..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() && setShowResults(true)}
          className="w-full rounded-2xl border border-line bg-white/50 px-4 py-2 pl-10 text-sm text-ink outline-none focus:border-clay/60 dark:bg-surface-dark dark:text-ink-light dark:border-stone-700/60"
        />
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40 dark:text-ink-light/40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {showResults && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl border border-line bg-white shadow-lg dark:bg-surface-dark dark:border-stone-700/50">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-clay border-t-transparent" />
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-ink/50 dark:text-ink-light/45">
                {query.trim() ? "没有找到相关结果" : "输入关键词开始搜索"}
              </p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto py-2">
              {results.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}`}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-left transition",
                    index === selectedIndex
                      ? "bg-clay/10 dark:bg-clay/20"
                      : "hover:bg-stone-50 dark:hover:bg-stone-700/50"
                  )}
                  onClick={() => navigateToResult(result)}
                >
                  {result.type === "user" ? (
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-stone-200 text-xs text-ink/60 dark:bg-stone-700 dark:text-ink-light/60">
                      {result.displayName?.[0]?.toUpperCase() || "U"}
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-clay/10 text-xs text-clay dark:bg-clay/20">
                      💭
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink dark:text-ink-light">
                      {result.type === "user" ? result.displayName : result.title}
                    </p>
                    {result.summary && (
                      <p className="truncate text-xs text-ink/50 dark:text-ink-light/45">
                        {result.summary}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-ink/40 dark:text-ink-light/35">
                    {result.type === "user" ? "用户" : "愿望"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
