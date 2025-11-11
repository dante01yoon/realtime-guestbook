"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabase-client";
import type { Database } from "@/types/supabase";
import type { EntryFormValues } from "@/lib/zod-schemas";
import { uploadImage } from "@/lib/upload";
import { toast } from "sonner";

const ENTRY_LIST_QUERY_KEY = ["entries"] as const;

type Entry = Database["public"]["Tables"]["entries"]["Row"];

async function fetchEntries() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("entries")
    .select("id, author, message, image_url, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export function useEntries() {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);

  const entriesQuery = useQuery({
    queryKey: ENTRY_LIST_QUERY_KEY,
    queryFn: fetchEntries,
    staleTime: 1000 * 30
  });

  const createEntryMutation = useMutation({
    mutationFn: async ({ author, message, imageFile }: EntryFormValues) => {
      setUploadProgress(0);
      try {
        const publicUrl = await uploadImage(imageFile, setUploadProgress);
        const { data, error } = await supabase
          .from("entries")
          .insert({
            author,
            message,
            image_url: publicUrl
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        return data;
      } catch (error) {
        toast.error("카드 등록에 실패했어요. 잠시 후 다시 시도해주세요.");
        throw error;
      }
    },
    onSuccess: (entry) => {
      setUploadProgress(100);
      queryClient.setQueryData(ENTRY_LIST_QUERY_KEY, (prev: Entry[] | undefined) => {
        if (!prev) return entry ? [entry] : [];
        if (!entry) return prev;
        const exists = prev.some((item) => item.id === entry.id);
        if (exists) return prev;
        return [entry, ...prev];
      });
    },
    onError: () => {
      setUploadProgress(0);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ENTRY_LIST_QUERY_KEY });
    }
  });

  useEffect(() => {
    const channel = supabase
      .channel("entries-list")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "entries"
        },
        (payload) => {
          const newEntry = payload.new as Entry;
          queryClient.setQueryData(ENTRY_LIST_QUERY_KEY, (prev: Entry[] | undefined) => {
            if (!prev) return [newEntry];
            const exists = prev.some((item) => item.id === newEntry.id);
            if (exists) return prev;
            return [newEntry, ...prev];
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [queryClient, supabase]);

  return {
    entries: entriesQuery.data ?? [],
    isLoading: entriesQuery.isLoading,
    isError: entriesQuery.isError,
    refetch: entriesQuery.refetch,
    createEntry: createEntryMutation.mutateAsync,
    isCreating: createEntryMutation.isPending,
    uploadProgress
  };
}
