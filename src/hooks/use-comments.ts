"use client";

import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabase-client";
import type { Database } from "@/types/supabase";
import type { CommentFormValues } from "@/lib/zod-schemas";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";

type CommentRow = Database["public"]["Tables"]["comments"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export type Comment = CommentRow & {
  profiles: Pick<ProfileRow, "id" | "display_name" | "avatar_url"> | null;
};

const commentKey = (entryId: string) => ["comments", entryId] as const;

async function fetchComments(entryId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("comments")
    .select("id, body, created_at, entry_id, user_id, profiles(id, display_name, avatar_url)")
    .eq("entry_id", entryId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as Comment[];
}

export function useComments(entryId: string) {
  const supabase = getSupabaseClient();
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();
  const profileCache = useRef(new Map<string, Comment["profiles"]>());

  const cacheProfile = (profileValue: (ProfileRow | Comment["profiles"]) | null) => {
    if (profileValue) {
      profileCache.current.set(profileValue.id, {
        id: profileValue.id,
        display_name: profileValue.display_name,
        avatar_url: profileValue.avatar_url ?? null
      });
    }
  };

  const resolveProfile = async (userId: string): Promise<Comment["profiles"]> => {
    if (profileCache.current.has(userId)) {
      return profileCache.current.get(userId) ?? null;
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .eq("id", userId)
      .maybeSingle();
    if (error) {
      console.error(error);
      profileCache.current.set(userId, null);
      return null;
    }
    if (data) {
      const profileData = {
        id: data.id,
        display_name: data.display_name,
        avatar_url: data.avatar_url ?? null
      } as Comment["profiles"];
      profileCache.current.set(userId, profileData);
      return profileData;
    }
    profileCache.current.set(userId, null);
    return null;
  };

  const commentsQuery = useQuery({
    queryKey: commentKey(entryId),
    queryFn: () => fetchComments(entryId),
    enabled: Boolean(entryId)
  });

  const addCommentMutation = useMutation({
    mutationFn: async ({ body }: CommentFormValues) => {
      if (!user || !profile) {
        toast.error("로그인 후 댓글을 남길 수 있어요.");
        throw new Error("Unauthorized");
      }

      const optimisticComment: Comment = {
        id: `optimistic-${Date.now()}`,
        body,
        entry_id: entryId,
        created_at: new Date().toISOString(),
        user_id: user.id,
        profiles: {
          id: profile.id,
          display_name: profile.display_name,
          avatar_url: profile.avatar_url
        }
      };

      queryClient.setQueryData(commentKey(entryId), (prev: Comment[] | undefined) => {
        if (!prev) return [optimisticComment];
        return [...prev, optimisticComment];
      });

      const { data, error } = await supabase
        .from("comments")
        .insert({ body, entry_id: entryId, user_id: user.id })
        .select("id, body, created_at, entry_id, user_id, profiles(id, display_name, avatar_url)")
        .single();

      if (error) {
        throw error;
      }

      return { optimisticComment, confirmedComment: data };
    },
    onSuccess: ({ optimisticComment, confirmedComment }) => {
      queryClient.setQueryData(commentKey(entryId), (prev: Comment[] | undefined) => {
        if (!prev) return [confirmedComment];
        return prev.map((comment) =>
          comment.id === optimisticComment.id ? confirmedComment : comment
        );
      });
    },
    onError: (error, _variables, context) => {
      toast.error("댓글 등록에 실패했어요. 다시 시도해주세요.");
      queryClient.setQueryData(commentKey(entryId), (prev: Comment[] | undefined) =>
        prev?.filter((comment) => !comment.id.startsWith("optimistic-")) ?? []
      );
      return context;
    }
  });

  useEffect(() => {
    if (commentsQuery.data) {
      commentsQuery.data.forEach((comment) => cacheProfile(comment.profiles));
    }
  }, [commentsQuery.data]);

  useEffect(() => {
    const channel = supabase
      .channel(`comments-${entryId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `entry_id=eq.${entryId}`
        },
        (payload) => {
          const row = payload.new as CommentRow;
          void (async () => {
            const relatedProfile = await resolveProfile(row.user_id);
            const newComment: Comment = { ...row, profiles: relatedProfile };
            queryClient.setQueryData(commentKey(entryId), (prev: Comment[] | undefined) => {
              if (!prev) return [newComment];
              const exists = prev.some((comment) => comment.id === newComment.id);
              if (exists) return prev;
              return [...prev, newComment];
            });
          })();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryId, queryClient, supabase]);

  return {
    comments: commentsQuery.data ?? [],
    isLoading: commentsQuery.isLoading,
    addComment: addCommentMutation.mutateAsync,
    isAdding: addCommentMutation.isPending
  };
}
