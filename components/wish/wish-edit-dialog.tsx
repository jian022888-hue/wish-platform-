"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Wish } from "@/types";

interface WishEditDialogProps {
  wish: Wish;
  onClose: () => void;
}

export function WishEditDialog({ wish, onClose }: WishEditDialogProps) {
  const [title, setTitle] = useState(wish.title);
  const [description, setDescription] = useState(wish.description);
  const [whyImportant, setWhyImportant] = useState(wish.whyImportant);
  const [currentBlocker, setCurrentBlocker] = useState(wish.currentBlocker);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSave = async () => {
    if (!title.trim() || !description.trim()) {
      setError("标题和描述不能为空");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/wishes/${wish.id}/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          whyImportant: whyImportant.trim(),
          currentBlocker: currentBlocker.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "保存失败");
      }

      router.refresh();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "保存失败，请稍后重试",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("确定要删除这个愿望吗？此操作不可撤销。")) {
      return;
    }

    try {
      const res = await fetch(`/api/wishes/${wish.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "删除失败");
      }

      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "删除失败，请稍后重试",
      );
    }
  };

  const inputClassName = "mt-2 w-full rounded-[22px] border border-line bg-white px-4 py-3 text-sm leading-7 text-ink outline-none transition placeholder:text-ink/35 focus:border-clay/60 dark:bg-surface-dark dark:text-ink-light dark:placeholder:text-ink-light/30 dark:border-stone-700/60";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-xl dark:bg-surface-dark">
        <h2 className="font-serif text-2xl text-ink dark:text-ink-light">编辑愿望</h2>

        <div className="mt-6 space-y-5">
          <label className="block">
            <span className="text-sm text-ink/68 dark:text-ink-light/68">标题</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClassName}
            />
          </label>

          <label className="block">
            <span className="text-sm text-ink/68 dark:text-ink-light/68">愿望描述</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className={inputClassName}
            />
          </label>

          <label className="block">
            <span className="text-sm text-ink/68 dark:text-ink-light/68">为什么这件事重要</span>
            <textarea
              value={whyImportant}
              onChange={(e) => setWhyImportant(e.target.value)}
              rows={3}
              className={inputClassName}
            />
          </label>

          <label className="block">
            <span className="text-sm text-ink/68 dark:text-ink-light/68">当前卡点</span>
            <textarea
              value={currentBlocker}
              onChange={(e) => setCurrentBlocker(e.target.value)}
              rows={3}
              className={inputClassName}
            />
          </label>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-line/70 pt-6 dark:border-stone-700/60">
          <Button
            variant="secondary"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            删除愿望
          </Button>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "保存中..." : "保存"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
