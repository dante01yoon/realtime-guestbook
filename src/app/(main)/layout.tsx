import { MainHeader } from "@/components/main-header";

export default function MainLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <MainHeader />
      <main className="flex-1 bg-slate-50">{children}</main>
      <footer className="border-t border-slate-200 bg-white/70">
        <div className="mx-auto w-full max-w-5xl px-4 py-4 text-xs text-slate-500">
          © {new Date().getFullYear()} Realtime Guestbook.
        </div>
      </footer>
    </div>
  );
}
