import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

export function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return format(date, "HH:mm");
  } else if (diffDays === 1) {
    return "昨天";
  } else if (diffDays < 7) {
    return format(date, "EEEE", { locale: zhCN });
  } else {
    return format(date, "yyyy/M/d");
  }
}

export function formatMessageGroupDate(dateStr: string): string | null {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return null; // Today, no label
  if (diffDays === 1) return "昨天";
  if (diffDays < 7) return format(date, "EEEE", { locale: zhCN });
  return format(date, "yyyy年M月d日", { locale: zhCN });
}
