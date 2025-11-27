"use client";

import { z } from "zod";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const nicknameSchema = z
  .string()
  .trim()
  .min(2, "닉네임은 2자 이상이어야 해요.")
  .max(20, "닉네임은 20자 이하로 입력해 주세요.")
  .regex(/^[\p{L}\p{N} ._-]+$/u, "닉네임은 문자, 숫자, 공백, . _ - 만 사용할 수 있어요.");

export const avatarFileSchema = z
  .instanceof(File)
  .optional()
  .refine(
    (file) => !file || ALLOWED_AVATAR_TYPES.includes(file.type),
    "JPEG/PNG/WebP 이미지만 업로드할 수 있어요."
  )
  .refine(
    (file) => !file || file.size <= MAX_AVATAR_SIZE,
    "아바타 이미지는 5MB 이하만 허용돼요."
  );

export const profileFormSchema = z.object({
  nickname: nicknameSchema,
  avatarFile: avatarFileSchema
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
