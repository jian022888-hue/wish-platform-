export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(dateString: string) {
  try {
    if (!dateString) return "未知";
    
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return "未知";
    }
    
    return new Intl.DateTimeFormat("zh-CN", {
      month: "long",
      day: "numeric",
    }).format(date);
  } catch {
    return "未知";
  }
}
