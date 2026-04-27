import { createClient, isConfigured } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    if (!q.trim()) {
      return NextResponse.json({ success: true, results: [] });
    }

    const results: any[] = [];

    if (isConfigured) {
      const supabase = await createClient();

      // 搜索愿望
      const { data: wishes } = await supabase
        .from("wishes")
        .select("id, title, summary, description")
        .ilike("title", `%${q}%`)
        .or(`summary.ilike.%${q}%,description.ilike.%${q}%`)
        .limit(10);

      if (wishes) {
        results.push(
          ...wishes.map((w) => ({
            type: "wish" as const,
            id: w.id,
            title: w.title,
            summary: w.summary,
          }))
        );
      }

      // 搜索用户
      const { data: users } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .ilike("display_name", `%${q}%`)
        .limit(10);

      if (users) {
        results.push(
          ...users.map((u) => ({
            type: "user" as const,
            id: u.id,
            displayName: u.display_name,
            avatarUrl: u.avatar_url,
          }))
        );
      }
    } else {
      // Mock 数据搜索
      const { wishes } = await import("@/data/mock/wishes");
      const filteredWishes = wishes.filter(
        (w) =>
          w.title.toLowerCase().includes(q.toLowerCase()) ||
          w.description.toLowerCase().includes(q.toLowerCase()) ||
          w.summary.toLowerCase().includes(q.toLowerCase())
      );

      results.push(
        ...filteredWishes.slice(0, 10).map((w) => ({
          type: "wish" as const,
          id: w.id,
          title: w.title,
          summary: w.summary,
        }))
      );
    }

    return NextResponse.json({
      success: true,
      results: results.slice(0, 20), // 最多返回20条结果
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
