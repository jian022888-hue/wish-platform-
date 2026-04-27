import { ai, AI_MODEL } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { wishId, title, description } = body;

    if (!wishId || !title || !description) {
      return Response.json(
        { error: "缺少必填字段：wishId, title, description" },
        { status: 400 },
      );
    }

    const stream = await ai.chat.completions.create({
      model: AI_MODEL,
      stream: true,
      temperature: 0.8,
      max_tokens: 500,
      messages: [
        {
          role: "system",
          content:
            "你是「梦」平台的 AI 回声。你的任务是为用户发布的愿望写一段温暖的、有建设性的回应。\n回应要求：\n- 100-200 字\n- 语气温柔、真诚，像一个有智慧的朋友\n- 先表达理解和共鸣，再给出一个具体的、可行动的建议\n- 不要使用空洞的鼓励，要结合愿望的具体内容\n- 直接输出回应文本，不要加标题或格式标记",
        },
        {
          role: "user",
          content: `愿望标题：${title}\n愿望描述：${description}`,
        },
      ],
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
        } catch (err) {
          controller.error(err);
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
    console.error("AI wish-response error:", error);
    return Response.json(
      { error: "AI 回应生成失败，请稍后再试" },
      { status: 500 },
    );
  }
}
