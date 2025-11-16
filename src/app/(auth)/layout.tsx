import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white/70">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/gallery" className="text-lg font-semibold text-slate-900">
            전자 방명록
          </Link>
          <Link
            href="/gallery"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            갤러리로 돌아가기
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
