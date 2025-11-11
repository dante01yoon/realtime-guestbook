"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabase-client";
import type { Database } from "@/types/supabase";
import type { CommentFormValues } from "@/lib/zod-schemas";
import { toast } from "sonner";

export type Comment = Database["public"]["Tables"]["comments"]["Row"];

const commentKey = (entryId: string) => ["comments", entryId] as const;

async function fetchComments(entryId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("comments")
    .select("id, author, body, created_at, entry_id")
    .eq("entry_id", entryId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export function useComments(entryId: string) {
  const supabase = getSupabaseClient();
  const queryClient = useQueryClient();

  const commentsQuery = useQuery({
    queryKey: commentKey(entryId),
    queryFn: () => fetchComments(entryId),
    enabled: Boolean(entryId)
  });

  const addCommentMutation = useMutation({
    mutationFn: async ({ author, body }: CommentFormValues) => {
      const optimisticComment: Comment = {
        id: `optimistic-${Date.now()}`,
        author,
        body,
        entry_id: entryId,
        created_at: new Date().toISOString()
      };

      queryClient.setQueryData(commentKey(entryId), (prev: Comment[] | undefined) => {
        if (!prev) return [optimisticComment];
        return [...prev, optimisticComment];
      });

      const { data, error } = await supabase
        .from("comments")
        .insert({ author, body, entry_id: entryId })
        .select()
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
          const newComment = payload.new as Comment;
          queryClient.setQueryData(commentKey(entryId), (prev: Comment[] | undefined) => {
            if (!prev) return [newComment];
            const exists = prev.some((comment) => comment.id === newComment.id);
            if (exists) return prev;
            return [...prev, newComment];
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [entryId, queryClient, supabase]);

  return {
    comments: commentsQuery.data ?? [],
    isLoading: commentsQuery.isLoading,
    addComment: addCommentMutation.mutateAsync,
    isAdding: addCommentMutation.isPending
  };
}
