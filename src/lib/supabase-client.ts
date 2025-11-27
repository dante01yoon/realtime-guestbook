import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

let supabaseBrowserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getSupabaseClient() {
  if (supabaseBrowserClient) return supabaseBrowserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Supabase 환경 변수가 설정되지 않았습니다.");
  }

  supabaseBrowserClient = createBrowserClient<Database>(url, key);
  return supabaseBrowserClient;
}
