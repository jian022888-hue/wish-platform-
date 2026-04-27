"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "首页", icon: "🏠" },
  { href: "/activity", label: "动态", icon: "" },
  { href: "/submit", label: "发布", icon: "" },
  { href: "/messages", label: "消息", icon: "✉️" },
  { href: "/profile", label: "我的", icon: "" },
];

export function MobileNav() {
  const pathname = usePathname();
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    fetchUnreadMessages();
    const interval = setInterval(fetchUnreadMessages, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadMessages = async () => {
    try {
      const res = await fetch("/api/conversations?status=active");
      const data = await res.json();
      if (data.success) {
        const total = data.conversations?.reduce(
          (sum: number, conv: any) => sum + (conv.unreadCount || 0),
          0
        );
        setUnreadMessages(total || 0);
      }
    } catch {
      // 忽略错误
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-line bg-white/95 backdrop-blur-xl dark:bg-surface-dark dark:border-stone-700/50 md:hidden">
      <div className="flex items-center justify-around py-2 pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/" && pathname?.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-3 py-1.5 transition",
                isActive
                  ? "text-clay"
                  : "text-ink/50 dark:text-ink-light/45"
              )}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px]">{item.label}</span>
              {item.href === "/messages" && unreadMessages > 0 && (
                <span className="absolute -top-0.5 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-clay text-[8px] text-white">
                  {unreadMessages > 9 ? "9+" : unreadMessages}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
