"use client";

import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabase-client";
import type { Entry } from "@/lib/types";

async function fetchEntry(id: string): Promise<Entry | null> {
  const { data, error } = await supabaseClient
    .from("entries")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export function useEntry(id: string) {
  return useQuery<Entry | null>({
    queryKey: ["entry", id],
    queryFn: () => fetchEntry(id),
    enabled: Boolean(id)
  });
}
