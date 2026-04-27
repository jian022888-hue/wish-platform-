import { NextResponse } from "next/server";
import { createClient, isConfigured } from "@/lib/supabase/server";

export async function GET() {
  if (!isConfigured) {
    return NextResponse.json({
      success: true,
      user: null,
    });
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return NextResponse.json({
      success: true,
      user: user ? {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.display_name || user.email?.split("@")[0],
        avatar_url: user.user_metadata?.avatar_url,
      } : null,
    });
  } catch {
    return NextResponse.json({
      success: true,
      user: null,
    });
  }
}
