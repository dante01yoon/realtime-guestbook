"use client";

import { useEffect, useMemo } from "react";
import { useEntry } from "@/hooks/use-entry";
import { useAddComment, useComments } from "@/hooks/use-comments";
import { CommentSkeleton } from "@/components/skeletons";
import { toast } from "sonner";

interface EntryDetailPageProps {
  params: { id: string };
}

export default function EntryDetailPage({ params }: EntryDetailPageProps) {
  const entryId = params.id;
  const { data: entry, isLoading: entryLoading, error: entryError } = useEntry(entryId);
  const {
    data: comments,
    isLoading: commentsLoading,
    error: commentsError
  } = useComments(entryId);
  const addComment = useAddComment(entryId);

  useEffect(() => {
    if (entryError) {
      toast.error("카드를 불러오지 못했습니다.");
    }
  }, [entryError]);

  useEffect(() => {
    if (commentsError) {
      toast.error("댓글을 불러오지 못했습니다.");
    }
  }, [commentsError]);

  const commentCount = useMemo(() => comments?.length ?? 0, [comments]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const author = String(formData.get("author") ?? "").trim();
    const body = String(formData.get("body") ?? "").trim();

    if (!author || !body) {
      toast.error("이름과 댓글을 입력해주세요.");
      return;
    }

    try {
      await addComment.mutateAsync({ author, body });
      event.currentTarget.reset();
    } catch (error) {
      console.error(error);
      toast.error("댓글을 등록하지 못했습니다.");
    }
  }

  if (entryLoading) {
    return <p className="text-sm text-slate-600">카드를 불러오는 중입니다...</p>;
  }

  if (!entry) {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow">
        <p className="text-lg font-semibold text-rose-600">카드를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <article className="space-y-4 rounded-xl bg-white p-6 shadow">
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <img
            src={entry.image_url}
            alt={`${entry.author}님의 방명록 카드 이미지`}
            className="w-full object-contain"
          />
        </div>
        <div>
          <h2 className="text-xl font-semibold">{entry.author}</h2>
          <p className="text-sm text-slate-700">{entry.message}</p>
          <p className="text-xs text-slate-500">
            등록일: {new Date(entry.created_at).toLocaleString("ko-KR")}
          </p>
        </div>
      </article>

      <aside className="space-y-4 rounded-xl bg-white p-6 shadow" aria-live="polite">
        <header className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">댓글</h2>
          <span className="text-sm text-slate-500" aria-label={`총 ${commentCount}개의 댓글`}>
            {commentCount}개
          </span>
        </header>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="block text-sm font-medium" htmlFor="author">
              이름
            </label>
            <input
              id="author"
              name="author"
              required
              maxLength={40}
              className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm"
              placeholder="이름"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium" htmlFor="body">
              댓글
            </label>
            <textarea
              id="body"
              name="body"
              required
              maxLength={280}
              rows={3}
              className="w-full resize-none rounded border border-slate-300 bg-white px-3 py-2 text-sm"
              placeholder="응원의 한마디를 남겨주세요"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow disabled:cursor-not-allowed disabled:opacity-70"
            disabled={addComment.isPending}
          >
            {addComment.isPending ? "등록 중..." : "댓글 등록"}
          </button>
        </form>

        {commentsLoading ? (
          <CommentSkeleton />
        ) : comments && comments.length > 0 ? (
          <ul className="space-y-4">
            {comments.map((comment) => (
              <li key={comment.id} className="rounded-md bg-slate-100 p-3">
                <p className="text-sm font-semibold text-slate-800">{comment.author}</p>
                <p className="text-sm text-slate-700">{comment.body}</p>
                <p className="text-xs text-slate-500">
                  {new Date(comment.created_at).toLocaleString("ko-KR")}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">첫 댓글을 남겨보세요!</p>
        )}
      </aside>
    </section>
  );
}
