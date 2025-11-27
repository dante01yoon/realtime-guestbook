import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Suspense } from "react";
import { createServerClient } from "@/lib/supabase-server";
import { CommentThreadSkeleton } from "@/components/comment-thread";
import dynamic from "next/dynamic";
import { formatRelativeDate } from "@/lib/format";

const CommentThread = dynamic(() => import("@/components/comment-thread"), {
  ssr: false,
  loading: () => <CommentThreadSkeleton />
});

export const metadata: Metadata = {
  title: "카드 상세 | 전자 방명록"
};

interface EntryPageProps {
  params: { id: string };
}

export default async function EntryPage({ params }: EntryPageProps) {
  const { id } = params;
  const supabase = createServerClient();
  const { data: entry } = await supabase
    .from("entries")
    .select("id, message, image_url, created_at, user_id, author_profile_id, profiles(nickname)")
    .eq("id", id)
    .single();

  if (!entry) {
    notFound();
  }

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">
          {entry.profiles?.nickname ?? "방명록 사용자"}님의 카드
        </h1>
        <p className="text-sm text-slate-600">
          {formatRelativeDate(entry.created_at)}에 작성된 메시지
        </p>
      </header>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
        <Image
          src={entry.image_url}
          alt={`${entry.profiles?.nickname ?? "방명록 사용자"}님의 방명록 이미지`}
          width={1200}
          height={900}
          className="h-full w-full bg-slate-100 object-contain"
          loading="lazy"
        />
        <div className="border-t border-slate-100 p-6">
          <p className="text-base text-slate-700">{entry.message}</p>
        </div>
      </div>
      <Suspense fallback={<CommentThreadSkeleton />}>
        <CommentThread entryId={entry.id} />
      </Suspense>
    </section>
  );
}
