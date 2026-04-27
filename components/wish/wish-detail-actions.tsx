"use client";

import { useState } from "react";
import type { Wish } from "@/types";
import { WishEditDialog } from "@/components/wish/wish-edit-dialog";

interface WishDetailActionsProps {
  wish: Wish;
  isOwner: boolean;
}

export function WishDetailActions({ wish, isOwner }: WishDetailActionsProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (!isOwner) return null;

  return (
    <>
      <div className="flex gap-3">
        <button
          className="rounded-full border border-stone-200 px-4 py-2 text-sm text-ink/60 transition hover:border-clay/40 hover:text-ink dark:border-stone-700 dark:text-ink-light/60 dark:hover:text-ink-light"
          onClick={() => setIsEditing(true)}
          type="button"
        >
          编辑
        </button>
      </div>

      {isEditing && (
        <WishEditDialog wish={wish} onClose={() => setIsEditing(false)} />
      )}
    </>
  );
}
