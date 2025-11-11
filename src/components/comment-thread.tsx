"use client";

import { useState } from "react";
import { useComments } from "@/hooks/use-comments";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { commentFormSchema } from "@/lib/zod-schemas";
import { toast } from "sonner";
import { formatRelativeDate } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

interface CommentThreadProps {
  entryId: string;
}

export default function CommentThread({ entryId }: CommentThreadProps) {
  const { comments, isLoading, addComment, isAdding } = useComments(entryId);
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});

    const validation = commentFormSchema.safeParse({ author, body });
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (typeof field === "string") {
          fieldErrors[field] = issue.message;
        }
      });
      setErrors(fieldErrors);
      toast.error("댓글 내용을 확인해주세요.");
      return;
    }

    try {
      await addComment(validation.data);
      setBody("");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-slate-900">댓글</h2>
        {isLoading ? (
          <div className="mt-4 space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-6 w-64" />
          </div>
        ) : (
          <ul className="mt-4 space-y-4">
            {comments.map((comment) => (
              <li key={comment.id} className="rounded-xl bg-slate-50 p-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">{comment.author}</span>
                  <span>{formatRelativeDate(comment.created_at)}</span>
                </div>
                <p className="mt-2 text-sm text-slate-700">{comment.body}</p>
              </li>
            ))}
            {comments.length === 0 ? (
              <li className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                아직 댓글이 없어요. 첫 댓글을 남겨주세요!
              </li>
            ) : null}
          </ul>
        )}
      </div>

      <form
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg"
        onSubmit={handleSubmit}
        aria-label="댓글 작성"
      >
        <h3 className="text-lg font-semibold text-slate-900">댓글 남기기</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">이름</span>
            <Input
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              placeholder="닉네임"
              aria-invalid={Boolean(errors.author)}
            />
            {errors.author ? <span className="text-sm text-red-500">{errors.author}</span> : null}
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-slate-700">댓글</span>
            <Textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="메시지를 남겨주세요"
              rows={3}
              aria-invalid={Boolean(errors.body)}
            />
            {errors.body ? <span className="text-sm text-red-500">{errors.body}</span> : null}
          </label>
        </div>
        <div className="mt-4 flex justify-end">
          <Button type="submit" disabled={isAdding}>
            {isAdding ? "등록 중..." : "댓글 등록"}
          </Button>
        </div>
      </form>
    </section>
  );
}

export function CommentThreadSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-64 w-full rounded-2xl" />
      <Skeleton className="h-48 w-full rounded-2xl" />
    </div>
  );
}
