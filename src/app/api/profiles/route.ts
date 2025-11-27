import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

type Body = {
  userId?: string;
  displayName?: string;
  avatarUrl?: string | null;
};

export async function POST(request: Request) {
  const supabase = getSupabaseAdminClient();

  const { userId, displayName, avatarUrl = null }: Body = await request.json();

  if (!userId || !displayName) {
    return NextResponse.json(
      { error: "userId와 displayName이 필요합니다." },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      display_name: displayName,
      avatar_url: avatarUrl
    },
    { onConflict: "id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
