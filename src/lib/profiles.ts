"use client";

import { v4 as uuid } from "uuid";
import { getSupabaseClient } from "@/lib/supabase-client";
import type { Database } from "@/types/supabase";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

const AVATAR_BUCKET = "avatars";

function ensureAuthedUser() {
  const supabase = getSupabaseClient();
  return supabase.auth.getUser().then(({ data, error }) => {
    if (error || !data.user) {
      throw new Error("로그인 후 다시 시도해주세요.");
    }
    return { supabase, userId: data.user.id };
  });
}

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

export async function deleteAvatarByUrl(avatarUrl: string | null) {
  const path = getAvatarPathFromUrl(avatarUrl);
  if (!path) return;
  const supabase = getSupabaseClient();
  void supabase.storage.from(AVATAR_BUCKET).remove([path]);
}

export async function uploadAvatar(file: File) {
  const { supabase, userId } = await ensureAuthedUser();
  const ext = file.type.split("/")[1] || "png";
  const fileName = `${uuid()}.${ext}`;
  const path = `${userId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, { upsert: true, cacheControl: "3600" });
  if (uploadError) throw uploadError;

  const { data: publicUrlData, error: publicUrlError } = supabase.storage
    .from(AVATAR_BUCKET)
    .getPublicUrl(path);
  if (publicUrlError) throw publicUrlError;

  return { publicUrl: publicUrlData.publicUrl, path };
}

export async function fetchProfile(): Promise<ProfileRow | null> {
  const { supabase, userId } = await ensureAuthedUser();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, user_id, nickname, avatar_url, created_at, updated_at")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function upsertProfile({
  nickname,
  avatarUrl
}: {
  nickname: string;
  avatarUrl: string | null;
}) {
  const { supabase, userId } = await ensureAuthedUser();
  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        user_id: userId,
        nickname,
        display_name: nickname,
        avatar_url: avatarUrl
      },
      { onConflict: "id" }
    )
    .select("id, user_id, nickname, avatar_url, display_name, created_at, updated_at")
    .single();

  if (error) throw error;
  return data;
}

export async function removeAvatar(currentAvatarUrl: string | null) {
  const { supabase, userId } = await ensureAuthedUser();
  const oldPath = getAvatarPathFromUrl(currentAvatarUrl);

  const { data, error } = await supabase
    .from("profiles")
    .update({ avatar_url: null })
    .eq("id", userId)
    .select("id, user_id, nickname, avatar_url, created_at, updated_at")
    .single();

  if (error) throw error;

  if (oldPath) {
    void supabase.storage.from(AVATAR_BUCKET).remove([oldPath]);
  }

  return data;
}
