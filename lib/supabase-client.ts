import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import type { Database } from "@/lib/database.types";

export const supabaseClient = createClient<Database>(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: { persistSession: false },
    realtime: { params: { eventsPerSecond: 10 } }
  }
);

export const STORAGE_BUCKET = env.NEXT_PUBLIC_SUPABASE_BUCKET;
