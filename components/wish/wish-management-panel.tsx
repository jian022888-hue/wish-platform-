import { createClient } from "@/lib/supabase/server";
import type { Wish } from "@/types";
import { WishOwnerActions } from "@/components/wish/wish-owner-actions";
import { StatusManager } from "@/components/wish/status-manager";

interface WishManagementPanelProps {
  wish: Wish;
}

export async function WishManagementPanel({ wish }: WishManagementPanelProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const profileResult = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (profileResult.error) return null;

  const wishResult = await supabase
    .from("wishes")
    .select("user_id")
    .eq("id", wish.id)
    .single();

  if (wishResult.error || wishResult.data?.user_id !== user.id) {
    return null;
  }

  return (
    <div className="space-y-4">
      <WishOwnerActions wish={wish} />
      <StatusManager wishId={wish.id} currentStatus={wish.status} />
    </div>
  );
}
