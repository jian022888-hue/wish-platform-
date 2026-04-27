import { ai, AI_MODEL } from "@/lib/ai";
import { sanitizeInput } from "@/lib/sanitization";
import { rateLimiters } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `你是一个「愿望整理」助手。用户会提交一个关于生活、创意、学习、职业或社区的原始愿望（可能不够结构化、存在歧义、或表述不完整）。

你的职责是：
1. 理解用户的核心诉求和意图
2. 生成一个标题（简洁、有力）
3. 展开为详细的描述
4. 阐述为什么这对用户重要
5. 识别当前的主要障碍或困惑

输出必须是标准 JSON 格式（无其他文本）：
{
  "title": "简洁的愿望标题（10-20字）",
  "description": "详细的愿望描述（100-200字）",
  "whyImportant": "为什么这对用户重要（50-150字）",
  "currentBlocker": "目前阻挡实现的主要障碍（50-150字）"
}

要求：
- 语言简洁、人文、友善
- 保留用户的原始意图和表述风格
- 如果理解有歧义，选择最合理的解读
- 避免过度解释或添加用户未提及的内容`;

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    if (rateLimiters.aiRefine.isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: "请求过于频繁，请稍后再试" },
        { status: 429 },
      );
    }

    const body = await request.json();
    const { rawWish } = body;

    if (!rawWish || typeof rawWish !== "string" || !rawWish.trim()) {
      return NextResponse.json(
        { error: "rawWish 不能为空" },
        { status: 400 },
      );
    }

    const sanitizedWish = sanitizeInput(rawWish.trim(), { maxLength: 2000, allowNewlines: true });

    const stream = await ai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: sanitizedWish },
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content })}\n\n`),
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("AI refine error:", error);
    return NextResponse.json(
      { error: "AI 整理失败，请稍后重试" },
      { status: 500 },
    );
  }
}
