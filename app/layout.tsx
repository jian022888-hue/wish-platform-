import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { ClientProviders } from "@/components/ui/client-providers";
import { ThemeProvider } from "@/lib/contexts/theme-context";

import "./globals.css";

export const metadata: Metadata = {
  title: "梦的平台",
  description: "一个让愿望被认真回应的前端 MVP。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-ink antialiased transition-colors duration-300 dark:bg-background-dark dark:text-ink-light">
        <ThemeProvider>
          <AppHeader />
          <ClientProviders>
            <main className="relative flex min-h-[calc(100vh-4.5rem)] flex-col">
              {children}
            </main>
          </ClientProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
