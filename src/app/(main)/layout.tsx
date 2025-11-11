import Link from "next/link";

export default function MainLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/gallery" className="text-lg font-semibold text-slate-900">
            전자 방명록
          </Link>
          <nav className="flex items-center gap-3 text-sm font-medium text-slate-600">
            <Link
              href="/gallery"
              className="rounded-md px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900"
            >
              갤러리
            </Link>
            <Link
              href="/create"
              className="rounded-md px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900"
            >
              카드 만들기
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 bg-slate-50">{children}</main>
      <footer className="border-t border-slate-200 bg-white/70">
        <div className="mx-auto w-full max-w-5xl px-4 py-4 text-xs text-slate-500">
          © {new Date().getFullYear()} Realtime Guestbook.
        </div>
      </footer>
    </div>
  );
}
