import type { Wish, Response as WishResponse } from "@/types";
import { createClient, isConfigured } from "@/lib/supabase/server";
import { wishes as mockWishes, responses as mockResponses } from "@/data/mock/wishes";

function mapDbWishToWish(dbWish: any): Wish {
  return {
    id: dbWish.id,
    title: dbWish.title,
    summary: dbWish.summary || "",
    originLabel: dbWish.origin_label || undefined,
    description: dbWish.description,
    whyImportant: dbWish.why_important,
    currentBlocker: dbWish.current_blocker,
    desiredResponseTypes: dbWish.desired_response_types,
    category: dbWish.category,
    status: dbWish.status,
    responseCount: dbWish.response_count,
    featured: dbWish.featured,
    allowAnonymous: dbWish.allow_anonymous,
    allowPlatformSupport: dbWish.allow_platform_support,
    createdAt: dbWish.created_at,
    updatedAt: dbWish.updated_at,
    progressUpdates: [],
  };
}

function mapDbResponseToResponse(dbResponse: any): WishResponse {
  return {
    id: dbResponse.id,
    wishId: dbResponse.wish_id,
    authorName: dbResponse.author_name,
    isAnonymous: dbResponse.is_anonymous,
    type: dbResponse.type,
    content: dbResponse.content,
    createdAt: dbResponse.created_at,
  };
}

export async function getWishes(): Promise<Wish[]> {
  if (!isConfigured) {
    return mockWishes.map(mapDbWishToWish);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wishes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return mockWishes.map(mapDbWishToWish);
  }

  return data.map(mapDbWishToWish);
}

export async function getFeaturedWishes(): Promise<Wish[]> {
  if (!isConfigured) {
    return mockWishes.filter((w) => w.featured).map(mapDbWishToWish);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wishes")
    .select("*")
    .eq("featured", true)
    .order("created_at", { ascending: false });

  if (error) {
    return mockWishes.filter((w) => w.featured).map(mapDbWishToWish);
  }

  return data.map(mapDbWishToWish);
}

export async function getWishById(id: string): Promise<Wish | null> {
  if (!isConfigured) {
    const wish = mockWishes.find((w) => w.id === id);
    return wish ? mapDbWishToWish(wish) : null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wishes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    const wish = mockWishes.find((w) => w.id === id);
    return wish ? mapDbWishToWish(wish) : null;
  }

  return mapDbWishToWish(data);
}

export async function getResponsesByWishId(wishId: string): Promise<WishResponse[]> {
  if (!isConfigured) {
    return mockResponses
      .filter((r) => r.wishId === wishId)
      .map(mapDbResponseToResponse);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("responses")
    .select("*")
    .eq("wish_id", wishId)
    .order("created_at", { ascending: false });

  if (error) {
    return mockResponses
      .filter((r) => r.wishId === wishId)
      .map(mapDbResponseToResponse);
  }

  return data.map(mapDbResponseToResponse);
}

export async function createWish(data: {
  title: string;
  description: string;
  whyImportant: string;
  currentBlocker: string;
  desiredResponseTypes: string[];
  allowAnonymous: boolean;
  allowPlatformSupport: boolean;
  category?: string;
  userId?: string;
}): Promise<Wish | null> {
  if (!isConfigured) {
    const newWish: any = {
      id: `wish-${Date.now()}`,
      title: data.title,
      summary: "",
      description: data.description,
      why_important: data.whyImportant,
      current_blocker: data.currentBlocker,
      desired_response_types: data.desiredResponseTypes,
      category: "Life",
      status: "open",
      response_count: 0,
      featured: false,
      allow_anonymous: data.allowAnonymous,
      allow_platform_support: data.allowPlatformSupport,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockWishes.unshift(newWish);
    return mapDbWishToWish(newWish);
  }

  const supabase = await createClient();
  const { data: newWish, error } = await supabase
    .from("wishes")
    .insert({
      ...(data.userId && { user_id: data.userId }),
      title: data.title,
      summary: "",
      description: data.description,
      why_important: data.whyImportant,
      current_blocker: data.currentBlocker,
      desired_response_types: data.desiredResponseTypes,
      category: data.category || "Life",
      status: "open",
      response_count: 0,
      featured: false,
      allow_anonymous: data.allowAnonymous,
      allow_platform_support: data.allowPlatformSupport,
    })
    .select()
    .single();

  if (error) {
    return null;
  }

  return mapDbWishToWish(newWish);
}

export async function createResponse(
  wishId: string,
  data: {
    authorName: string;
    isAnonymous: boolean;
    type: string;
    content: string;
    userId?: string;
  },
): Promise<WishResponse | null> {
  if (!isConfigured) {
    const newResponse: any = {
      id: `resp-${Date.now()}`,
      wishId: wishId,
      userId: "mock-user",
      authorName: data.authorName,
      isAnonymous: data.isAnonymous,
      type: data.type,
      content: data.content,
      createdAt: new Date().toISOString(),
    };

    mockResponses.push(newResponse);

    const wish = mockWishes.find((w) => w.id === wishId);
    if (wish) {
      wish.responseCount += 1;
    }

    return mapDbResponseToResponse(newResponse);
  }

  const supabase = await createClient();
  const { data: newResponse, error } = await supabase
    .from("responses")
    .insert({
      wish_id: wishId,
      ...(data.userId && { user_id: data.userId }),
      author_name: data.authorName,
      is_anonymous: data.isAnonymous,
      type: data.type,
      content: data.content,
    })
    .select()
    .single();

  if (error) {
    return null;
  }

  return mapDbResponseToResponse(newResponse);
}

export async function updateWish(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    whyImportant: string;
    currentBlocker: string;
    desiredResponseTypes: string[];
    status: string;
    featured: boolean;
  }>,
): Promise<Wish | null> {
  if (!isConfigured) {
    const wish = mockWishes.find((w) => w.id === id);
    if (!wish) return null;

    if (data.title) wish.title = data.title;
    if (data.description) wish.description = data.description;
    if (data.whyImportant) wish.whyImportant = data.whyImportant;
    if (data.currentBlocker) wish.currentBlocker = data.currentBlocker;
    if (data.desiredResponseTypes) wish.desiredResponseTypes = data.desiredResponseTypes as any;
    if (data.status) wish.status = data.status as any;
    if (data.featured !== undefined) wish.featured = data.featured;
    wish.updatedAt = new Date().toISOString();

    return mapDbWishToWish(wish);
  }

  const supabase = await createClient();
  const { data: updatedWish, error } = await supabase
    .from("wishes")
    .update({
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description }),
      ...(data.whyImportant && { why_important: data.whyImportant }),
      ...(data.currentBlocker && { current_blocker: data.currentBlocker }),
      ...(data.desiredResponseTypes && { desired_response_types: data.desiredResponseTypes }),
      ...(data.status && { status: data.status }),
      ...(data.featured !== undefined && { featured: data.featured }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return null;
  }

  return mapDbWishToWish(updatedWish);
}

export async function deleteWish(id: string): Promise<boolean> {
  if (!isConfigured) {
    const index = mockWishes.findIndex((w) => w.id === id);
    if (index === -1) return false;

    mockWishes.splice(index, 1);
    return true;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("wishes")
    .delete()
    .eq("id", id);

  if (error) {
    return false;
  }

  return true;
}
