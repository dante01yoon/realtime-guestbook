import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import Link from "next/link";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "실시간 전자 방명록",
  description: "Supabase Realtime으로 구현한 전자 방명록"
};

export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen">
        <Providers>
          <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6">
            <header className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold">전자 방명록</h1>
                <p className="text-sm text-slate-600">
                  사진 혹은 드로잉으로 방명록 카드를 남기고 실시간으로 감상해 보세요.
                </p>
              </div>
              <nav className="flex gap-3 text-sm font-medium">
                <Link className="rounded-md bg-white px-3 py-2 shadow" href="/">
                  갤러리
                </Link>
                <Link className="rounded-md bg-blue-500 px-3 py-2 text-white shadow" href="/create">
                  카드 등록
                </Link>
              </nav>
            </header>
            <main className="flex-1 pb-16">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
