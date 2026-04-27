import { getWishById, updateWish } from "@/lib/wishes";
import { sanitizeWishInput } from "@/lib/sanitization";
import { rateLimiters } from "@/lib/rate-limit";
import { requireAuth } from "@/components/auth/auth-require";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const ALLOWED_RESPONSE_TYPES = new Set([
  "Advice", "Resource", "Introduction", "Opportunity", "Support", "Similar Experience",
]);

const ALLOWED_STATUSES = new Set([
  "open", "clarifying", "in_progress", "supported", "completed",
]);

const ALLOWED_CATEGORIES = new Set([
  "Life", "Creative", "Learning", "Career", "Community",
]);

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const clientIp = getClientIp(request);
    if (rateLimiters.createWish.isRateLimited(clientIp)) {
      return NextResponse.json(
        { success: false, error: "请求过于频繁，请稍后再试" },
        { status: 429 },
      );
    }

    const wish = await getWishById(id);
    if (!wish) {
      return NextResponse.json(
        { success: false, error: "Wish not found" },
        { status: 404 },
      );
    }

    const supabase = await createClient();
    const { data: wishData, error: wishError } = await supabase
      .from("wishes")
      .select("user_id")
      .eq("id", id)
      .single();

    if (wishError || wishData?.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: you can only edit your own wishes" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const updates: Record<string, any> = {};

    if (body.title !== undefined) {
      if (typeof body.title !== "string" || !body.title.trim()) {
        return NextResponse.json(
          { success: false, error: "title must be a non-empty string" },
          { status: 400 },
        );
      }
      updates.title = body.title.trim();
    }

    if (body.description !== undefined) {
      if (typeof body.description !== "string" || !body.description.trim()) {
        return NextResponse.json(
          { success: false, error: "description must be a non-empty string" },
          { status: 400 },
        );
      }
      updates.description = body.description.trim();
    }

    if (body.whyImportant !== undefined) {
      updates.whyImportant = body.whyImportant;
    }

    if (body.currentBlocker !== undefined) {
      updates.currentBlocker = body.currentBlocker;
    }

    if (body.desiredResponseTypes !== undefined) {
      if (
        !Array.isArray(body.desiredResponseTypes) ||
        !body.desiredResponseTypes.every(
          (t: unknown) => typeof t === "string" && ALLOWED_RESPONSE_TYPES.has(t),
        )
      ) {
        return NextResponse.json(
          { success: false, error: "desiredResponseTypes must be an array of valid ResponseType values" },
          { status: 400 },
        );
      }
      updates.desiredResponseTypes = body.desiredResponseTypes;
    }

    if (body.status !== undefined) {
      if (typeof body.status !== "string" || !ALLOWED_STATUSES.has(body.status)) {
        return NextResponse.json(
          { success: false, error: "status must be a valid WishStatus value" },
          { status: 400 },
        );
      }
      updates.status = body.status;
    }

    if (body.category !== undefined) {
      if (typeof body.category !== "string" || !ALLOWED_CATEGORIES.has(body.category)) {
        return NextResponse.json(
          { success: false, error: "category must be a valid WishCategory value" },
          { status: 400 },
        );
      }
      updates.category = body.category;
    }

    if (body.featured !== undefined) {
      updates.featured = body.featured;
    }

    const sanitized = sanitizeWishInput(updates);
    const updatedWish = await updateWish(id, sanitized);

    return NextResponse.json({ success: true, wish: updatedWish });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 401 },
    );
  }
}
