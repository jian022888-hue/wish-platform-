"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { MessagesBadge } from "@/components/layout/messages-badge";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NotificationBadge } from "@/components/layout/notification-badge";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";

const navItems = [
  { href: "/", label: "愿望广场" },
  { href: "/submit", label: "发布愿望" },
  { href: "/activity", label: "动态" },
  { href: "/messages", label: "消息" },
];

function DreamLogo() {
  return (
    <div className="relative flex h-12 w-12 items-center justify-center rounded-[20px] border border-line bg-white/92 shadow-sm dark:bg-surface-dark dark:border-stone-700/60">
      <span className="absolute h-6 w-6 rounded-full border border-clay/30 bg-[#F7F0E7] dark:bg-clay/15" />
      <span className="absolute h-6 w-6 translate-x-[5px] rounded-full bg-white/92 dark:bg-surface-dark" />
      <span className="absolute h-4 w-[2px] translate-x-[-6px] rounded-full bg-clay/80" />
      <span className="absolute h-[2px] w-3 translate-x-[2px] translate-y-[6px] rounded-full bg-clay/65" />
    </div>
  );
}

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-stone-50/88 backdrop-blur-xl dark:border-stone-700/50 dark:bg-[#1A1816]/90">
      <div className="page-shell flex min-h-[72px] items-center justify-between gap-5 py-3">
        <Link className="flex items-center gap-3" href="/">
          <DreamLogo />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate font-serif text-lg tracking-[0.02em] text-ink dark:text-ink-light">
                梦的平台
              </p>
              <Badge className="hidden md:inline-flex" tone="soft">
                愿望被回应的平台
              </Badge>
            </div>
            <p className="text-sm text-ink/56 dark:text-ink-light/45">把愿望认真接住</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              className="border-b border-transparent py-1 text-sm text-ink/62 transition hover:border-clay/40 hover:text-ink dark:text-ink-light/55 dark:hover:text-ink-light"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <NotificationBadge />
          <MessagesBadge />

          <ButtonLink
            className="hidden sm:inline-flex"
            href="/submit"
            size="md"
            variant="primary"
          >
            写下一个愿望
          </ButtonLink>

          <ButtonLink
            className="sm:hidden"
            href="/submit"
            size="sm"
            variant="primary"
          >
            发布
          </ButtonLink>

          <UserMenu />
        </div>
      </div>
      <MobileNav />
    </header>
  );
}
