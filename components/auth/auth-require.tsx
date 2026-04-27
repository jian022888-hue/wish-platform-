import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  return user;
}

export async function AuthCheck({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-sm dark:bg-surface-dark">
          <h2 className="font-serif text-2xl text-ink dark:text-ink-light">需要登录</h2>
          <p className="mt-3 text-sm text-ink/60 dark:text-ink-light/55">
            请先登录或注册，才能使用此功能。
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              href="/auth/signin"
              className="rounded-full border border-stone-200 px-5 py-2.5 text-sm text-ink/70 transition hover:border-clay/40 hover:text-ink dark:border-stone-700 dark:text-ink-light/70 dark:hover:text-ink-light"
            >
              登录
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-full bg-ink px-5 py-2.5 text-sm text-white transition hover:bg-ink/90 dark:bg-ink-light dark:text-background-dark dark:hover:bg-ink-light/90"
            >
              注册
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
