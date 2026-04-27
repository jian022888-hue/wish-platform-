import { ai, AI_MODEL } from "@/lib/ai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    if (!ai) {
      return NextResponse.json(
        { success: false, error: "AI service not configured" },
        { status: 503 },
      );
    }

    const { messages } = await request.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: "Messages required" },
        { status: 400 },
      );
    }

    const stream = await ai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content: `你是「梦」愿望平台的 AI 助手。你的角色是帮助用户探索和梳理他们内心的想法与愿望。

你的风格：
- 温暖、真诚、有好奇心
- 像一个善于倾听的朋友
- 用简短的问题引导用户深入思考
- 每次回复控制在 100-200 字

你的职责：
- 倾听用户的想法，帮助他们理清思路
- 如果用户的想法可以变成一个愿望，温和地建议他们去发布
- 提供有温度的反馈，而不是机械的建议
- 如果用户不确定自己想要什么，帮助他们从不同角度探索

不要：
- 不要过于正式或机械
- 不要给出长篇大论
- 不要急于给出解决方案，先理解再引导`,
        },
        ...messages,
      ],
      stream: true,
      temperature: 0.8,
      max_tokens: 500,
    });

    // SSE 流式输出
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
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
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
