import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "회원가입 | 전자 방명록",
  description: "계정을 만들고 나만의 이름으로 방명록을 남겨보세요."
};

export default async function SignupPage() {
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
        <h1 className="text-2xl font-bold text-slate-900">회원가입</h1>
        <p className="text-sm text-slate-600">고유한 닉네임으로 방명록을 작성해보세요.</p>
      </div>
      <SignupForm />
    </section>
  );
}
