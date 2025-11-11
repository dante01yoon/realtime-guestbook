import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { GallerySkeleton } from "@/components/postit-board";

const PostItBoard = dynamic(() => import("@/components/postit-board"), {
  ssr: false,
  loading: () => <GallerySkeleton />
});

export const metadata: Metadata = {
  title: "갤러리 | 전자 방명록"
};

export default function GalleryPage() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">모두의 포스트잇 갤러리</h1>
        <p className="max-w-2xl text-sm text-slate-600">
          친구들과 함께 만든 방명록 카드를 실시간으로 확인해보세요. 새 카드가 추가되면 자동으로 나타납니다.
        </p>
      </header>
      <Suspense fallback={<GallerySkeleton />}>
        <PostItBoard />
      </Suspense>
    </section>
  );
}
