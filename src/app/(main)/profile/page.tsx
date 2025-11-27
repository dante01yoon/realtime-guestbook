"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "@/hooks/use-profile";
import { useAuth } from "@/components/providers/auth-provider";
import { profileFormSchema } from "@/lib/validation/profile";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const { profile, saveProfile, removeAvatar, isSaving } = useProfile();
  const [nickname, setNickname] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (profile?.nickname) {
      setNickname(profile.nickname);
    }
  }, [profile]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});
    const validation = profileFormSchema.safeParse({ nickname, avatarFile: avatarFile ?? undefined });
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (typeof field === "string") {
          fieldErrors[field] = issue.message;
        }
      });
      setErrors(fieldErrors);
      toast.error("입력값을 확인해주세요.");
      return;
    }

    try {
      await saveProfile({
        nickname: validation.data.nickname,
        avatarFile: validation.data.avatarFile ?? undefined
      });
      setAvatarFile(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await removeAvatar();
      setAvatarFile(null);
      toast.success("아바타를 제거했어요.");
    } catch (error) {
      console.error(error);
      toast.error("아바타 제거에 실패했어요.");
    }
  };

  if (authLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 p-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 p-6 text-center">
        <p className="text-lg font-semibold text-slate-900">로그인 후 프로필을 설정할 수 있어요.</p>
        <div className="flex justify-center gap-3">
          <Button asChild>
            <Link href="/login">로그인하기</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/signup">회원가입</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between" aria-live="polite">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-500">프로필</p>
            <h1 className="text-2xl font-bold text-slate-900">닉네임 & 프로필 이미지</h1>
            <p className="text-sm text-slate-600">
              방명록에서 표시될 이름과 이미지를 설정하세요. 닉네임은 전역 고유값으로 관리돼요.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              닉네임 (2-20자, 고유)
              <Input
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                placeholder="방명록에서 표시될 이름"
                aria-describedby={errors.nickname ? "nickname-error" : undefined}
                aria-invalid={Boolean(errors.nickname)}
                disabled={isSaving}
              />
            </label>
            {errors.nickname ? (
              <p id="nickname-error" className="text-sm text-red-500" role="status">
                {errors.nickname}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">프로필 이미지</p>
            <AvatarUpload
              initialUrl={profile?.avatar_url ?? null}
              onFileSelect={setAvatarFile}
              disabled={isSaving}
            />
            <Button
              type="button"
              variant="ghost"
              onClick={handleRemoveAvatar}
              disabled={isSaving}
              aria-label="현재 아바타 제거"
            >
              아바타 제거
            </Button>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "저장 중..." : "프로필 저장"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
