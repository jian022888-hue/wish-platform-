"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Wish } from "@/types";
import { WishEditDialog } from "@/components/wish/wish-edit-dialog";

interface WishOwnerActionsProps {
  wish: Wish;
}

export function WishOwnerActions({ wish }: WishOwnerActionsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

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
      alert(err instanceof Error ? err.message : "删除失败");
    }
  };

  return (
    <>
      <div className="flex gap-3">
        <button
          className="rounded-full border border-stone-200 px-4 py-2 text-sm text-ink/60 transition hover:border-clay/40 hover:text-ink dark:border-stone-700 dark:text-ink-light/60 dark:hover:text-ink-light"
          onClick={() => setIsEditing(true)}
          type="button"
        >
          编辑愿望
        </button>
        <button
          className="rounded-full border border-red-200 px-4 py-2 text-sm text-red-600 transition hover:border-red-400 hover:text-red-700 dark:border-red-800/40 dark:text-red-400 dark:hover:text-red-300"
          onClick={handleDelete}
          type="button"
        >
          删除
        </button>
      </div>

      {isEditing && (
        <WishEditDialog wish={wish} onClose={() => setIsEditing(false)} />
      )}
    </>
  );
}
