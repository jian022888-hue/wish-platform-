import { createWish, getWishes } from "@/lib/wishes";
import { sanitizeWishInput } from "@/lib/sanitization";
import { rateLimiters } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

const ALLOWED_RESPONSE_TYPES = new Set([
  "Advice", "Resource", "Introduction", "Opportunity", "Support", "Similar Experience",
]);

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let wishes = await getWishes();

    if (category) {
      wishes = wishes.filter((w) => w.category === category);
    }
    if (status) {
      wishes = wishes.filter((w) => w.status === status);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      wishes = wishes.filter(
        (w) =>
          w.title.toLowerCase().includes(searchLower) ||
          w.description.toLowerCase().includes(searchLower) ||
          w.summary.toLowerCase().includes(searchLower),
      );
    }

    const total = wishes.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginatedWishes = wishes.slice(start, start + limit);

    return NextResponse.json({
      success: true,
      wishes: paginatedWishes,
      pagination: {
        page,
        limit,
        total,
        totalPages,
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

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    if (rateLimiters.createWish.isRateLimited(clientIp)) {
      return NextResponse.json(
        { success: false, error: "请求过于频繁，请稍后再试" },
        { status: 429 },
      );
    }

    let userId: string | undefined;
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
    } catch {}

    const body = await request.json();

    const { title, description, whyImportant, currentBlocker, desiredResponseTypes, allowAnonymous, allowPlatformSupport, category } = body;

    if (
      typeof title !== "string" ||
      typeof description !== "string" ||
      typeof whyImportant !== "string" ||
      typeof currentBlocker !== "string"
    ) {
      return NextResponse.json(
        { success: false, error: "title, description, whyImportant, currentBlocker must be strings" },
        { status: 400 },
      );
    }

    if (
      !Array.isArray(desiredResponseTypes) ||
      desiredResponseTypes.length === 0 ||
      !desiredResponseTypes.every(
        (t: unknown) => typeof t === "string" && ALLOWED_RESPONSE_TYPES.has(t),
      )
    ) {
      return NextResponse.json(
        { success: false, error: "desiredResponseTypes must be a non-empty array of valid ResponseType values" },
        { status: 400 },
      );
    }

    const sanitized = sanitizeWishInput({
      title,
      description,
      whyImportant,
      currentBlocker,
      desiredResponseTypes,
    });

    const wish = await createWish({
      ...sanitized,
      allowAnonymous: allowAnonymous ?? false,
      allowPlatformSupport: allowPlatformSupport ?? false,
      category: category || "Life",
      userId,
    });

    return NextResponse.json({ success: true, wish }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}
