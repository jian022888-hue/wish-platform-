"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // 表单状态
  const [displayName, setDisplayName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "notifications">("profile");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/me");
      const data = await res.json();

      if (!data.success || !data.user) {
        throw new Error("请先登录");
      }

      setProfile(data.user);
      setDisplayName(data.user.name || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取信息失败");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!displayName.trim()) {
      setError("显示名称不能为空");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: displayName.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "更新失败");
      }

      setSuccess("资料更新成功");
      fetchProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新失败");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("请填写所有密码字段");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    if (newPassword.length < 6) {
      setError("密码长度至少为6位");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/auth/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "修改失败");
      }

      setSuccess("密码修改成功");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "修改失败");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-clay border-t-transparent" />
          <p className="text-sm text-ink/50 dark:text-ink-light/50">加载中...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-ink/60 dark:text-ink-light/60">{error}</p>
          <Link href="/" className="mt-4 inline-block text-sm text-clay hover:underline">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell py-8">
      <h1 className="mb-8 font-serif text-3xl text-ink dark:text-ink-light">设置</h1>

      {/* Tabs */}
      <div className="mb-8 border-b border-line dark:border-stone-700/50">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab("profile")}
            className={cn(
              "pb-3 text-sm font-medium transition",
              activeTab === "profile"
                ? "border-b-2 border-clay text-clay"
                : "text-ink/60 hover:text-ink dark:text-ink-light/60 dark:hover:text-ink-light"
            )}
          >
            个人资料
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={cn(
              "pb-3 text-sm font-medium transition",
              activeTab === "password"
                ? "border-b-2 border-clay text-clay"
                : "text-ink/60 hover:text-ink dark:text-ink-light/60 dark:hover:text-ink-light"
            )}
          >
            修改密码
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={cn(
              "pb-3 text-sm font-medium transition",
              activeTab === "notifications"
                ? "border-b-2 border-clay text-clay"
                : "text-ink/60 hover:text-ink dark:text-ink-light/60 dark:hover:text-ink-light"
            )}
          >
            通知设置
          </button>
        </nav>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 rounded-2xl bg-green-50 p-4 text-sm text-green-600 dark:bg-green-900/20 dark:text-green-400">
          {success}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Avatar */}
          <div className="rounded-2xl border border-line bg-white/80 p-6 dark:bg-surface-dark dark:border-stone-700/50">
            <h2 className="mb-4 font-serif text-lg text-ink dark:text-ink-light">头像</h2>
            <div className="flex items-center gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-stone-200 text-2xl font-medium text-ink/60 dark:bg-stone-700 dark:text-ink-light/60">
                {profile?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <p className="text-sm text-ink/60 dark:text-ink-light/55">
                  点击头像可以上传新头像
                </p>
                <p className="mt-1 text-xs text-ink/40 dark:text-ink-light/35">
                  支持 JPG、PNG 格式，最大 2MB
                </p>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="rounded-2xl border border-line bg-white/80 p-6 dark:bg-surface-dark dark:border-stone-700/50">
            <h2 className="mb-4 font-serif text-lg text-ink dark:text-ink-light">基本信息</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-ink/60 dark:text-ink-light/55">
                  显示名称
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white/50 px-4 py-3 text-sm text-ink outline-none focus:border-clay/60 dark:bg-surface-dark dark:text-ink-light dark:border-stone-700/60"
                  placeholder="你的显示名称"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-ink/60 dark:text-ink-light/55">
                  邮箱
                </label>
                <input
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  className="w-full rounded-xl border border-line bg-stone-50 px-4 py-3 text-sm text-ink/60 outline-none dark:bg-surface-dark dark:text-ink-light/55 dark:border-stone-700/60"
                />
                <p className="mt-1 text-xs text-ink/40 dark:text-ink-light/35">
                  邮箱地址不可修改
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleUpdateProfile}
                disabled={saving}
                className={cn(
                  "rounded-xl px-6 py-3 text-sm font-medium text-white transition",
                  saving
                    ? "bg-clay/60 cursor-not-allowed"
                    : "bg-clay hover:bg-clay/90"
                )}
              >
                {saving ? "保存中..." : "保存更改"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === "password" && (
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-line bg-white/80 p-6 dark:bg-surface-dark dark:border-stone-700/50">
            <h2 className="mb-6 font-serif text-lg text-ink dark:text-ink-light">修改密码</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-ink/60 dark:text-ink-light/55">
                  当前密码
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white/50 px-4 py-3 text-sm text-ink outline-none focus:border-clay/60 dark:bg-surface-dark dark:text-ink-light dark:border-stone-700/60"
                  placeholder="输入当前密码"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-ink/60 dark:text-ink-light/55">
                  新密码
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white/50 px-4 py-3 text-sm text-ink outline-none focus:border-clay/60 dark:bg-surface-dark dark:text-ink-light dark:border-stone-700/60"
                  placeholder="输入新密码（至少6位）"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-ink/60 dark:text-ink-light/55">
                  确认新密码
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white/50 px-4 py-3 text-sm text-ink outline-none focus:border-clay/60 dark:bg-surface-dark dark:text-ink-light dark:border-stone-700/60"
                  placeholder="再次输入新密码"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleChangePassword}
                disabled={saving}
                className={cn(
                  "rounded-xl px-6 py-3 text-sm font-medium text-white transition",
                  saving
                    ? "bg-clay/60 cursor-not-allowed"
                    : "bg-clay hover:bg-clay/90"
                )}
              >
                {saving ? "修改中..." : "修改密码"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-line bg-white/80 p-6 dark:bg-surface-dark dark:border-stone-700/50">
            <h2 className="mb-6 font-serif text-lg text-ink dark:text-ink-light">通知设置</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink dark:text-ink-light">
                    新回应通知
                  </p>
                  <p className="mt-1 text-xs text-ink/50 dark:text-ink-light/45">
                    当有人回应你的愿望时通知你
                  </p>
                </div>
                <ToggleSwitch defaultChecked />
              </div>
              <div className="border-t border-line dark:border-stone-700/50" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink dark:text-ink-light">
                    新消息通知
                  </p>
                  <p className="mt-1 text-xs text-ink/50 dark:text-ink-light/45">
                    当收到新私信时通知你
                  </p>
                </div>
                <ToggleSwitch defaultChecked />
              </div>
              <div className="border-t border-line dark:border-stone-700/50" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink dark:text-ink-light">
                    新粉丝通知
                  </p>
                  <p className="mt-1 text-xs text-ink/50 dark:text-ink-light/45">
                    当有人关注你时通知你
                  </p>
                </div>
                <ToggleSwitch defaultChecked />
              </div>
              <div className="border-t border-line dark:border-stone-700/50" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink dark:text-ink-light">
                    邮件通知
                  </p>
                  <p className="mt-1 text-xs text-ink/50 dark:text-ink-light/45">
                    通过邮件接收重要通知
                  </p>
                </div>
                <ToggleSwitch />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleSwitch({ defaultChecked = false }: { defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <button
      onClick={() => setChecked(!checked)}
      className={cn(
        "relative h-6 w-11 rounded-full transition",
        checked ? "bg-clay" : "bg-stone-300 dark:bg-stone-600"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition",
          checked && "translate-x-5"
        )}
      />
    </button>
  );
}
