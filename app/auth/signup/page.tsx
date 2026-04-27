"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { createClient, isConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isConfigured) {
      setError("Supabase 未配置。请先在 .env.local 中配置真实的 Supabase 项目信息。");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4 dark:bg-background-dark">
        <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-8 shadow-sm text-center dark:bg-surface-dark">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-moss/10">
            <svg
              className="h-8 w-8 text-moss"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-medium text-ink dark:text-ink-light">
            注册成功！
          </h2>
          <p className="text-sm text-ink/60 dark:text-ink-light/60">
            请检查你的邮箱，点击确认链接完成注册。
          </p>
          <Button
            onClick={() => router.push("/auth/signin")}
            className="mt-4"
          >
            返回登录
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4 dark:bg-background-dark">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-8 shadow-sm dark:bg-surface-dark">
        <div className="text-center">
          <Link href="/" className="font-serif text-4xl text-ink dark:text-ink-light">
            梦
          </Link>
          <h2 className="mt-4 text-2xl font-medium text-ink dark:text-ink-light">创建账户</h2>
          <p className="mt-2 text-sm text-ink/60 dark:text-ink-light/60">
            加入梦的平台，开始你的愿望之旅
          </p>
        </div>

        {!isConfigured && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 dark:bg-amber-900/15 dark:border-amber-800/40">
            <p className="text-sm text-amber-800 dark:text-amber-300">
              ⚠️ 当前使用 Mock 模式。注册功能需要配置真实的 Supabase 项目。
            </p>
            <p className="text-xs text-amber-600 mt-1 dark:text-amber-400">
              你可以先浏览愿望广场和查看详情页，体验 UI 效果。
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="displayName"
                className="mb-1 block text-sm text-ink/68 dark:text-ink-light/68"
              >
                显示名称
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-[22px] border border-line bg-white px-4 py-3 text-sm leading-7 text-ink outline-none transition placeholder:text-ink/35 focus:border-clay/60 dark:bg-surface-dark dark:text-ink-light dark:placeholder:text-ink-light/30 dark:border-stone-700/60"
                placeholder="你想被称呼的名字"
              />
            </div>

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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-[22px] border border-line bg-white px-4 py-3 text-sm leading-7 text-ink outline-none transition placeholder:text-ink/35 focus:border-clay/60 dark:bg-surface-dark dark:text-ink-light dark:placeholder:text-ink-light/30 dark:border-stone-700/60"
                placeholder="至少 6 位字符"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading || !isConfigured}>
            {loading ? "注册中..." : isConfigured ? "注册" : "需配置 Supabase"}
          </Button>

          <p className="text-center text-sm text-ink/60 dark:text-ink-light/60">
            已有账户？{" "}
            <Link
              href="/auth/signin"
              className="font-medium text-clay hover:text-clay/80"
            >
              立即登录
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center dark:bg-background-dark">
          <div className="text-ink/50 dark:text-ink-light/50">加载中...</div>
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}
