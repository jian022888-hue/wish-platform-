"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface MessageWishOwnerButtonProps {
  wishId: string;
  wishOwnerId?: string;
}

export function MessageWishOwnerButton({ wishId, wishOwnerId }: MessageWishOwnerButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartConversation = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wishContextId: wishId, receiverId: wishOwnerId }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "发起对话失败");
      }

      // 跳转到新创建的对话
      window.location.href = `/messages/${data.conversation.id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "发起对话失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        onClick={handleStartConversation}
        disabled={loading}
        className="w-full"
        variant="secondary"
      >
        {loading ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            正在创建对话...
          </>
        ) : (
          "私信发布者"
        )}
      </Button>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}
