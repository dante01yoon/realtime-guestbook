"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabase-client";
import type { Database } from "@/types/supabase";
import type { EntryFormValues } from "@/lib/zod-schemas";
import { uploadImage } from "@/lib/upload";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";

const ENTRY_LIST_QUERY_KEY = ["entries"] as const;

type EntryRow = Database["public"]["Tables"]["entries"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type Entry = EntryRow & {
  profiles: Pick<ProfileRow, "id" | "nickname" | "avatar_url"> | null;
};

async function fetchEntries() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("entries")
    .select(
      "id, message, image_url, created_at, user_id, author_profile_id, profiles(id, nickname, avatar_url)"
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as Entry[];
}

export function useEntries() {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);
  const { user, profile } = useAuth();
  const profileCache = useRef(new Map<string, Entry["profiles"]>());

  const cacheProfile = (profileValue: (ProfileRow | Entry["profiles"]) | null) => {
    if (profileValue) {
      profileCache.current.set(profileValue.id, {
        id: profileValue.id,
        nickname: (profileValue as ProfileRow).nickname ?? (profileValue as Entry["profiles"]).nickname,
        avatar_url: profileValue.avatar_url ?? null
      });
    }
  };

  const resolveProfile = async (profileId: string | null): Promise<Entry["profiles"]> => {
    if (!profileId) return null;
    if (profileCache.current.has(profileId)) {
      return profileCache.current.get(profileId) ?? null;
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("id, nickname, avatar_url")
      .eq("id", profileId)
      .maybeSingle();
    if (error) {
      console.error(error);
      profileCache.current.set(profileId, null);
      return null;
    }
    if (data) {
      const profileData = {
        id: data.id,
        nickname: data.nickname,
        avatar_url: data.avatar_url
      } as Entry["profiles"];
      profileCache.current.set(profileId, profileData);
      return profileData;
    }
    profileCache.current.set(profileId, null);
    return null;
  };

  const entriesQuery = useQuery({
    queryKey: ENTRY_LIST_QUERY_KEY,
    queryFn: fetchEntries,
    staleTime: 1000 * 30
  });

  const createEntryMutation = useMutation({
    mutationFn: async ({ message, imageFile }: EntryFormValues) => {
      if (!user || !profile) {
        toast.error("로그인 후 카드를 등록할 수 있어요.");
        throw new Error("Unauthorized");
      }
      setUploadProgress(0);
      try {
        const publicUrl = await uploadImage(imageFile, setUploadProgress);
        const { data, error } = await supabase
          .from("entries")
          .insert({
            message,
            image_url: publicUrl,
            user_id: user.id,
            author_profile_id: profile.id
          })
          .select(
            "id, message, image_url, created_at, user_id, author_profile_id, profiles(id, nickname, avatar_url)"
          )
          .single();

        if (error) {
          throw error;
        }

        cacheProfile(profile);
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
    if (entriesQuery.data) {
      entriesQuery.data.forEach((entry) => cacheProfile(entry.profiles));
    }
  }, [entriesQuery.data]);

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
        const row = payload.new as EntryRow;
        void (async () => {
          const relatedProfile = await resolveProfile(row.author_profile_id ?? row.user_id);
          const newEntry: Entry = { ...row, profiles: relatedProfile };
            queryClient.setQueryData(ENTRY_LIST_QUERY_KEY, (prev: Entry[] | undefined) => {
              if (!prev) return [newEntry];
              const exists = prev.some((item) => item.id === newEntry.id);
              if (exists) return prev;
              return [newEntry, ...prev];
            });
          })();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
