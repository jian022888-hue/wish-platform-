"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface DropdownMenuProps {
  onClose: () => void;
}

function DropdownMenu({ onClose }: DropdownMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const menuItems = [
    { href: "/profile", label: "我的主页", icon: "" },
    { href: "/activity", label: "活动动态", icon: "" },
    { href: "/achievements", label: "成就", icon: "" },
    { href: "/stats", label: "数据统计", icon: "📊" },
    { href: "/settings", label: "设置", icon: "️" },
  ];

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-line bg-white shadow-lg dark:bg-surface-dark dark:border-stone-700/50"
    >
      <div className="py-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink/70 transition hover:bg-stone-50 hover:text-ink dark:text-ink-light/60 dark:hover:bg-stone-700/50 dark:hover:text-ink-light"
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
      <div className="border-t border-line dark:border-stone-700/50" />
      <div className="py-2">
        <form action="/auth/signout" method="POST">
          <button
            type="submit"
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 transition hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <span className="text-base"></span>
            <span>退出登录</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export function UserMenu() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();

      if (data.success && data.user) {
        setUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          avatarUrl: data.user.avatarUrl,
        });
      }
    } catch {
      // 忽略错误
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-10 w-10 animate-pulse rounded-full bg-stone-200 dark:bg-stone-700" />
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/auth/signin"
          className="rounded-full border border-stone-200 px-4 py-2 text-sm text-ink/60 transition hover:border-clay/40 hover:text-ink dark:border-stone-700 dark:text-ink-light/60 dark:hover:text-ink-light"
        >
          登录
        </Link>
        <Link
          href="/auth/signup"
          className="rounded-full bg-clay px-4 py-2 text-sm text-white transition hover:bg-clay/90"
        >
          注册
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 rounded-full border border-stone-200 px-3 py-2 transition hover:border-clay/40 dark:border-stone-700 dark:hover:border-clay/40"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-200 text-xs font-medium text-ink/60 dark:bg-stone-700 dark:text-ink-light/60">
          {user.name?.[0]?.toUpperCase() || "U"}
        </div>
        <span className="hidden max-w-[100px] truncate text-sm text-ink/70 lg:inline dark:text-ink-light/70">
          {user.name}
        </span>
        <svg
          className={cn(
            "h-4 w-4 text-ink/40 transition dark:text-ink-light/40",
            showMenu && "rotate-180"
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showMenu && <DropdownMenu onClose={() => setShowMenu(false)} />}
    </div>
  );
}
