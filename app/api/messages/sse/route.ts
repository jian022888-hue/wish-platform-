import { requireAuth } from "@/components/auth/auth-require";
import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        // Send initial heartbeat
        controller.enqueue(encoder.encode("data: {\"type\":\"connected\"}\n\n"));

        // Subscribe to new messages via Supabase Realtime
        const channel = supabase
          .channel("messages-changes")
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "messages",
              filter: `sender_id=neq.${user.id}`,
            },
            (payload: any) => {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "new_message",
                    payload: payload.new,
                  })}\n\n`
                )
              );
            }
          )
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "message_requests",
              filter: `receiver_id=eq.${user.id}`,
            },
            (payload: any) => {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "new_request",
                    payload: payload.new,
                  })}\n\n`
                )
              );
            }
          )
          .subscribe(async (status: string) => {
            console.log("SSE subscription status:", status);
          });

        // Keep connection alive with heartbeat
        const heartbeat = setInterval(() => {
          try {
            controller.enqueue(encoder.encode("data: {\"type\":\"heartbeat\"}\n\n"));
          } catch {
            clearInterval(heartbeat);
          }
        }, 30000);

        // Cleanup on close
        request.signal.addEventListener("abort", () => {
          clearInterval(heartbeat);
          supabase.removeChannel(channel);
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      return Response.json(
        { success: false, error: "请先登录" },
        { status: 401 }
      );
    }
    return Response.json(
      { success: false, error: "连接失败" },
      { status: 500 }
    );
  }
}
