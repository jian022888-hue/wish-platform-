import type { WishStatus } from "@/types";
import { Badge } from "@/components/ui/badge";

const statusMap: Record<
  WishStatus,
  { label: string; tone: "warm" | "blush" | "moss" | "slate" }
> = {
  open: {
    label: "等待回应",
    tone: "warm",
  },
  clarifying: {
    label: "整理中",
    tone: "blush",
  },
  in_progress: {
    label: "推进中",
    tone: "moss",
  },
  supported: {
    label: "已连接帮助",
    tone: "slate",
  },
  completed: {
    label: "已发生",
    tone: "moss",
  },
};

interface WishStatusBadgeProps {
  status: WishStatus;
}

export function WishStatusBadge({ status }: WishStatusBadgeProps) {
  const meta = statusMap[status];

  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}
