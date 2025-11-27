"use client";

import React, { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { avatarFileSchema } from "@/lib/validation/profile";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  initialUrl?: string | null;
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
  className?: string;
}

export function AvatarUpload({ initialUrl, onFileSelect, disabled, className }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const validation = avatarFileSchema.safeParse(file);
      if (!validation.success) {
        setError(validation.error.issues[0]?.message ?? "이미지 파일을 확인해주세요.");
        onFileSelect(null);
        return;
      }
      setError(null);
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleRemove = useCallback(() => {
    setPreview(null);
    setError(null);
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = "";
  }, [onFileSelect]);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          aria-label="아바타 이미지 업로드"
        >
          아바타 업로드
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled}
        />
        <Button
          type="button"
          variant="ghost"
          onClick={handleRemove}
          disabled={disabled}
          aria-label="아바타 제거"
        >
          제거
        </Button>
        <p className="text-sm text-slate-500">JPEG/PNG/WebP, 최대 5MB</p>
      </div>
      {error ? (
        <p className="text-sm text-red-500" role="status">
          {error}
        </p>
      ) : null}
      <div className="h-32 w-32 overflow-hidden rounded-full border border-slate-200 bg-slate-50">
        {preview ? (
          <img src={preview} alt="아바타 미리보기" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
            미리보기 없음
          </div>
        )}
      </div>
    </div>
  );
}
