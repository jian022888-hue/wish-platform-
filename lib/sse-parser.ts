/**
 * 消费 SSE 流，正确处理跨 chunk 的消息边界
 */
export async function consumeSSEStream(
  response: Response,
  onContent: (content: string) => void,
): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // 按换行拆分，保留最后一条可能不完整的行
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;

        const data = trimmed.slice(6).trim();
        if (data === "[DONE]") return;

        try {
          const parsed = JSON.parse(data);
          if (parsed.content) {
            onContent(parsed.content);
          }
        } catch {
          // 忽略不完整的 JSON（理论上不应再出现）
        }
      }
    }

    // 处理 buffer 中可能残留的最后一行
    if (buffer.trim()) {
      const trimmed = buffer.trim();
      if (trimmed.startsWith("data: ")) {
        const data = trimmed.slice(6).trim();
        if (data !== "[DONE]") {
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              onContent(parsed.content);
            }
          } catch {}
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
