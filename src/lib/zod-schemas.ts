import { z } from "zod";

export const imageFileSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.type.startsWith("image/"), "이미지 파일만 업로드할 수 있어요.")
    .refine((file) => file.size <= 5 * 1024 * 1024, "파일 크기는 5MB 이하로 제한됩니다.")
});

export const entryFormSchema = z.object({
  author: z
    .string()
    .min(1, "이름을 입력해주세요.")
    .max(40, "이름은 40자 이하로 입력해주세요."),
  message: z
    .string()
    .min(1, "메시지를 입력해주세요.")
    .max(180, "메시지는 180자 이하로 입력해주세요."),
  imageFile: z
    .instanceof(File)
    .or(z.instanceof(Blob))
    .refine((blob) => blob.size > 0, "이미지를 추가해주세요.")
});

export const commentFormSchema = z.object({
  author: z
    .string()
    .min(1, "이름을 입력해주세요.")
    .max(40, "이름은 40자 이하로 입력해주세요."),
  body: z
    .string()
    .min(1, "댓글을 입력해주세요.")
    .max(280, "댓글은 280자 이하로 입력해주세요.")
});

export type EntryFormValues = z.infer<typeof entryFormSchema>;
export type CommentFormValues = z.infer<typeof commentFormSchema>;
