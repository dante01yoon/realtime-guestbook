"use client";

import {
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { useEffect } from "react";
import { supabaseClient } from "@/lib/supabase-client";
import type { Comment, NewComment } from "@/lib/types";

const commentsKey = (entryId: string) => ["comments", entryId] as const;

async function fetchComments(entryId: string): Promise<Comment[]> {
  const { data, error } = await supabaseClient
    .from("comments")
    .select("*")
    .eq("entry_id", entryId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}

export function useComments(entryId: string) {
  const queryClient = useQueryClient();
  const query = useQuery<Comment[]>({
    queryKey: commentsKey(entryId),
    queryFn: () => fetchComments(entryId),
    enabled: Boolean(entryId)
  });

  useEffect(() => {
    if (!entryId) return;

    const channel = supabaseClient
      .channel(`comments-${entryId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "comments", filter: `entry_id=eq.${entryId}` },
        (payload) => {
          queryClient.setQueryData<Comment[]>(commentsKey(entryId), (current = []) => [
            ...current,
            payload.new as Comment
          ]);
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [entryId, queryClient]);

  return query;
}

export function useAddComment(entryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Omit<NewComment, "entry_id">) => {
      const payload: NewComment = {
        entry_id: entryId,
        ...input
      };

      const { data, error } = await supabaseClient
        .from("comments")
        .insert(payload)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: commentsKey(entryId) });
      const optimisticComment: Comment = {
        id: crypto.randomUUID(),
        entry_id: entryId,
        author: input.author,
        body: input.body,
        created_at: new Date().toISOString()
      };

      const previous = queryClient.getQueryData<Comment[]>(commentsKey(entryId));
      queryClient.setQueryData<Comment[]>(commentsKey(entryId), (current = []) => [
        ...current,
        optimisticComment
      ]);

      return { previous, optimisticId: optimisticComment.id };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData<Comment[]>(commentsKey(entryId), context.previous);
      }
    },
    onSuccess: (_data, _variables, context) => {
      if (context?.optimisticId) {
        queryClient.setQueryData<Comment[]>(commentsKey(entryId), (current = []) =>
          current.filter((comment) => comment.id !== context.optimisticId)
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: commentsKey(entryId) });
    }
  });
}
