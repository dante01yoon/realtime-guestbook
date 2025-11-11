"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabaseClient } from "@/lib/supabase-client";
import type { Entry, NewEntry } from "@/lib/types";

const ENTRIES_KEY = ["entries"] as const;

async function fetchEntries(): Promise<Entry[]> {
  const { data, error } = await supabaseClient
    .from("entries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export function useEntries() {
  const queryClient = useQueryClient();
  const query = useQuery<Entry[]>({ queryKey: ENTRIES_KEY, queryFn: fetchEntries });

  useEffect(() => {
    const channel = supabaseClient
      .channel("entries-stream")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "entries" },
        (payload) => {
          queryClient.setQueryData<Entry[]>(ENTRIES_KEY, (current = []) => {
            const exists = current.some((item) => item.id === (payload.new as Entry).id);
            if (exists) return current;
            return [payload.new as Entry, ...current];
          });
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

export function useCreateEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: NewEntry) => {
      const { data, error } = await supabaseClient
        .from("entries")
        .insert(payload)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (entry) => {
      queryClient.setQueryData<Entry[]>(ENTRIES_KEY, (current = []) => {
        const exists = current.some((item) => item.id === entry.id);
        if (exists) return current;
        return [entry, ...current];
      });
    }
  });
}
