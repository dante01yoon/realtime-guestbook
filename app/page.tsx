"use client";

import { useEffect } from "react";
import { useEntries } from "@/hooks/use-entries";
import { GallerySkeleton } from "@/components/skeletons";
import { PostitCard } from "@/components/postit-card";
import { toast } from "sonner";

export default function GalleryPage() {
  const { data, isLoading, error } = useEntries();

  useEffect(() => {
    if (error) {
      toast.error("카드를 불러오지 못했습니다.");
    }
  }, [error]);

  if (isLoading) {
    return <GallerySkeleton />;
  }

  if (error) {
    return <p className="text-sm text-rose-600">카드를 불러오는 중 오류가 발생했어요.</p>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow">
        <p className="text-lg font-semibold">아직 등록된 카드가 없어요.</p>
        <p className="text-sm text-slate-600">가장 먼저 방명록을 남겨보세요!</p>
      </div>
    );
  }

  return (
    <section aria-live="polite" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((entry) => (
        <PostitCard key={entry.id} entry={entry} />
      ))}
    </section>
  );
}
