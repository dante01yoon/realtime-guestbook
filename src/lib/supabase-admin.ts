import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

let supabaseAdminClient: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseAdminClient() {
  if (supabaseAdminClient) return supabaseAdminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase 서비스 롤 키가 설정되지 않았습니다.");
  }

  supabaseAdminClient = createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return supabaseAdminClient;
}
