import { NextResponse } from "next/server";
import { getWishById, createResponse } from "@/lib/wishes";
import { sanitizeResponseInput } from "@/lib/sanitization";
import { rateLimiters } from "@/lib/rate-limit";

const ALLOWED_TYPES = new Set([
  "Advice", "Resource", "Introduction", "Opportunity", "Support", "Similar Experience",
]);

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const clientIp = getClientIp(request);
    if (rateLimiters.createResponse.isRateLimited(clientIp)) {
      return NextResponse.json(
        { success: false, error: "请求过于频繁，请稍后再试" },
        { status: 429 },
      );
    }

    const { id } = await params;
    const body = await request.json();

    const wish = await getWishById(id);
    if (!wish) {
      return NextResponse.json(
        { success: false, error: "Wish not found" },
        { status: 404 },
      );
    }

    const { authorName, type, content } = body;

    if (typeof authorName !== "string" || typeof type !== "string" || typeof content !== "string") {
      return NextResponse.json(
        { success: false, error: "authorName, type, and content must be strings" },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.has(type)) {
      return NextResponse.json(
        { success: false, error: "type must be a valid ResponseType value" },
        { status: 400 },
      );
    }

    const sanitized = sanitizeResponseInput({
      authorName,
      type,
      content,
    });

    const response = await createResponse(id, {
      authorName: sanitized.authorName,
      isAnonymous: body.isAnonymous ?? false,
      type: sanitized.type,
      content: sanitized.content,
    });

    return NextResponse.json({ success: true, response }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}
