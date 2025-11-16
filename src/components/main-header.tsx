"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { getSupabaseClient } from "@/lib/supabase-client";
import { Skeleton } from "@/components/ui/skeleton";

export function MainHeader() {
  const { user, profile, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleLogout = async () => {
    setIsSigningOut(true);
    try {
      await supabase.auth.signOut();
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  };

  const nextParam = pathname?.startsWith("/login") ? "/gallery" : pathname ?? "/gallery";

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
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
        <div className="flex items-center gap-3">
          {isLoading ? (
            <Skeleton className="h-9 w-40 rounded-full" />
          ) : user && profile ? (
            <>
              <div className="text-right text-sm">
                <p className="font-semibold text-slate-900">{profile.display_name}</p>
                <p className="text-xs text-slate-500">내 카드 & 댓글</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} disabled={isSigningOut}>
                {isSigningOut ? "로그아웃 중..." : "로그아웃"}
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild size="sm">
                <Link href={`/login?next=${encodeURIComponent(nextParam)}`}>로그인</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/signup">회원가입</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
