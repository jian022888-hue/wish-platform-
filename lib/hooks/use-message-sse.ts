import { useEffect, useRef, useState } from "react";

interface SSEMessage {
  type: string;
  payload?: any;
}

export function useMessageSSE(enabled: boolean = true) {
  const [notifications, setNotifications] = useState<SSEMessage[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const connect = () => {
      const eventSource = new EventSource("/api/messages/sse");
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "heartbeat" || data.type === "connected") {
            return; // Ignore heartbeats
          }
          setNotifications((prev) => [...prev, data]);
        } catch (err) {
          console.error("Failed to parse SSE message:", err);
        }
      };

      eventSource.onerror = (error) => {
        // SSE 连接在未登录时返回 401 是预期行为，不显示错误
        eventSource.close();
        // 5秒后重试
        setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [enabled]);

  return { notifications, setNotifications };
}
