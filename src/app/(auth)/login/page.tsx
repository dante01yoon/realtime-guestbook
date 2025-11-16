import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "로그인 | 전자 방명록",
  description: "내 계정으로 실시간 방명록을 이용하세요."
};

export default async function LoginPage() {
  const supabase = createServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/gallery");
  }

  return (
    <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/70">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold text-slate-900">로그인</h1>
        <p className="text-sm text-slate-600">내 카드와 댓글을 관리하려면 로그인해주세요.</p>
      </div>
      <LoginForm />
    </section>
  );
}
