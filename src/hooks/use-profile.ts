"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import {
  deleteAvatarByUrl,
  fetchProfile,
  removeAvatar,
  uploadAvatar,
  upsertProfile
} from "@/lib/profiles";
import { profileFormSchema, type ProfileFormValues } from "@/lib/validation/profile";

export function useProfile() {
  const { profile: authProfile, user, refreshProfile } = useAuth();
  const [profile, setProfile] = useState(authProfile);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    setProfile(authProfile);
  }, [authProfile]);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    if (authProfile) return;
    setIsFetching(true);
    fetchProfile()
      .then((data) => setProfile(data))
      .catch((error) => {
        console.error(error);
        toast.error("프로필을 불러오지 못했어요.");
      })
      .finally(() => setIsFetching(false));
  }, [authProfile, user]);

  const updateProfile = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const parsed = profileFormSchema.parse(values);
      let avatarUrl = profile?.avatar_url ?? null;
      const previousAvatarUrl = profile?.avatar_url ?? null;

      if (parsed.avatarFile) {
        const { publicUrl } = await uploadAvatar(parsed.avatarFile);
        avatarUrl = publicUrl;
        if (previousAvatarUrl && previousAvatarUrl !== publicUrl) {
          deleteAvatarByUrl(previousAvatarUrl);
        }
      }

      const updated = await upsertProfile({
        nickname: parsed.nickname,
        avatarUrl
      });

      return updated;
    },
    onSuccess: async (updated) => {
      setProfile(updated);
      await refreshProfile();
      toast.success("프로필을 저장했어요.");
    },
    onError: (error) => {
      console.error(error);
      toast.error("프로필 저장에 실패했어요.");
    }
  });

  const removeAvatarMutation = useMutation({
    mutationFn: async () => {
      const updated = await removeAvatar(profile?.avatar_url ?? null);
      if (profile?.avatar_url) {
        deleteAvatarByUrl(profile.avatar_url);
      }
      return updated;
    },
    onSuccess: async (updated) => {
      setProfile(updated);
      await refreshProfile();
      toast.success("아바타를 제거했어요.");
    },
    onError: (error) => {
      console.error(error);
      toast.error("아바타 제거에 실패했어요.");
    }
  });

  const isSaving = useMemo(
    () => updateProfile.isPending || removeAvatarMutation.isPending || isFetching,
    [updateProfile.isPending, removeAvatarMutation.isPending, isFetching]
  );

  return {
    profile,
    isSaving,
    isFetching,
    saveProfile: updateProfile.mutateAsync,
    removeAvatar: removeAvatarMutation.mutateAsync,
    error: updateProfile.error ?? removeAvatarMutation.error
  };
}
