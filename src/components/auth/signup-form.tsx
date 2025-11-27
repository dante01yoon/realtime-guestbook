"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/supabase-client";
import { toast } from "sonner";

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast.error("비밀번호가 일치하지 않습니다.");
      return;
    }
    setIsSubmitting(true);
    const supabase = getSupabaseClient();

    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        toast.error(error.message ?? "회원가입에 실패했습니다.");
        return;
      }

      const userId = data.user?.id;
      const fallbackDisplayName = displayName || email.split("@")[0];
      if (userId) {
        const response = await fetch("/api/profiles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            userId,
            displayName: fallbackDisplayName
          })
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          toast.error(
            payload?.error ?? "프로필을 생성하지 못했어요. 잠시 후 다시 시도해주세요."
          );
          return;
        }
      }

      toast.success("회원가입이 완료되었습니다!");
      router.replace("/gallery");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="space-y-2 text-sm font-medium text-slate-700">
          이메일
          <Input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="you@example.com"
          />
        </label>
      </div>
      <div>
        <label className="space-y-2 text-sm font-medium text-slate-700">
          공개 닉네임
          <Input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            required
            placeholder="방명록에서 사용할 이름"
          />
        </label>
      </div>
      <div>
        <label className="space-y-2 text-sm font-medium text-slate-700">
          비밀번호
          <Input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
            placeholder="8자 이상"
          />
        </label>
      </div>
      <div>
        <label className="space-y-2 text-sm font-medium text-slate-700">
          비밀번호 확인
          <Input
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            minLength={8}
            placeholder="다시 입력"
          />
        </label>
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "생성 중..." : "회원가입"}
      </Button>
      <p className="text-center text-sm text-slate-600">
        이미 계정이 있나요?{" "}
        <Link className="font-semibold text-slate-900" href="/login">
          로그인
        </Link>
      </p>
    </form>
  );
}
