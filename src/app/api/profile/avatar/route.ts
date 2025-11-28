import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

function getAvatarPathFromUrl(avatarUrl: string | null) {
  if (!avatarUrl) return null;
  try {
    const url = new URL(avatarUrl);
    const marker = "/storage/v1/object/public/avatars/";
    const idx = url.pathname.indexOf(marker);
    if (idx === -1) return null;
    return url.pathname.slice(idx + marker.length);
  } catch {
    return null;
  }
}

export async function DELETE() {
  const supabase = createServerClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const { data, error } = await supabase
    .from("profiles")
    .update({ avatar_url: null })
    .eq("id", user.id)
    .select("id, user_id, nickname, avatar_url, created_at, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const path = getAvatarPathFromUrl(currentProfile?.avatar_url ?? null);
  if (path) {
    void supabase.storage.from("avatars").remove([path]);
  }

  return NextResponse.json(data, { status: 200 });
}
