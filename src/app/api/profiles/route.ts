import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

type Body = {
  userId?: string;
  nickname?: string;
  avatarUrl?: string | null;
};

export async function POST(request: Request) {
  const supabase = getSupabaseAdminClient();

  const { userId, nickname, avatarUrl = null }: Body = await request.json();

  if (!userId || !nickname) {
    return NextResponse.json(
      { error: "userId와 nickname이 필요합니다." },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      user_id: userId,
      nickname,
      avatar_url: avatarUrl
    },
    { onConflict: "id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
