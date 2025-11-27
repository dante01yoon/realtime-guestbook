import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { nicknameSchema } from "@/lib/validation/profile";

export async function GET() {
  const supabase = createServerClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, user_id, nickname, avatar_url, created_at, updated_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? null, { status: 200 });
}

export async function PUT(request: Request) {
  const supabase = createServerClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const nicknameParse = nicknameSchema.safeParse(body.nickname);
  if (!nicknameParse.success) {
    return NextResponse.json({ error: "닉네임 형식을 확인해주세요." }, { status: 400 });
  }
  const avatarUrl = typeof body.avatarUrl === "string" ? body.avatarUrl : null;

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        user_id: user.id,
        nickname: nicknameParse.data,
        display_name: nicknameParse.data,
        avatar_url: avatarUrl
      },
      { onConflict: "id" }
    )
    .select("id, user_id, nickname, display_name, avatar_url, created_at, updated_at")
    .single();

  if (error) {
    const status = error.code === "23505" ? 409 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json(data, { status: 200 });
}
