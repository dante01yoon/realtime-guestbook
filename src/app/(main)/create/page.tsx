import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { EntryFormSkeleton } from "@/components/entry-form";

const EntryForm = dynamic(() => import("@/components/entry-form"), {
  ssr: false,
  loading: () => <EntryFormSkeleton />
});

export const metadata: Metadata = {
  title: "카드 만들기 | 전자 방명록"
};

export default function CreatePage() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Step 1
        </p>
        <h1 className="text-3xl font-bold text-slate-900">방명록 카드를 만들어 주세요</h1>
        <p className="max-w-2xl text-sm text-slate-600">
          사진을 업로드하거나 아래 드로잉 캔버스에서 자유롭게 그림을 그린 뒤 이름과 메시지를 남겨 주세요.
        </p>
      </header>
      <Suspense fallback={<EntryFormSkeleton />}>
        <EntryForm />
      </Suspense>
    </section>
  );
}
