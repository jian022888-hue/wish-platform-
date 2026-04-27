"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4 dark:bg-background-dark">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-8 shadow-sm dark:bg-surface-dark">
        <div className="text-center">
          <Link href="/" className="font-serif text-4xl text-ink dark:text-ink-light">
            梦
          </Link>
          <h2 className="mt-4 text-2xl font-medium text-ink dark:text-ink-light">欢迎回来</h2>
          <p className="mt-2 text-sm text-ink/60 dark:text-ink-light/60">
            登录你的账户，继续探索愿望
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm text-ink/68 dark:text-ink-light/68"
              >
                邮箱地址
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-[22px] border border-line bg-white px-4 py-3 text-sm leading-7 text-ink outline-none transition placeholder:text-ink/35 focus:border-clay/60 dark:bg-surface-dark dark:text-ink-light dark:placeholder:text-ink-light/30 dark:border-stone-700/60"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm text-ink/68 dark:text-ink-light/68"
              >
                密码
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-[22px] border border-line bg-white px-4 py-3 text-sm leading-7 text-ink outline-none transition placeholder:text-ink/35 focus:border-clay/60 dark:bg-surface-dark dark:text-ink-light dark:placeholder:text-ink-light/30 dark:border-stone-700/60"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "登录中..." : "登录"}
          </Button>

          <p className="text-center text-sm text-ink/60 dark:text-ink-light/60">
            还没有账户？{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-clay hover:text-clay/80"
            >
              立即注册
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center dark:bg-background-dark">
          <div className="text-ink/50 dark:text-ink-light/50">加载中...</div>
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
