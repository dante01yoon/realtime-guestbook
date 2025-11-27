"use client";

import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  onFileSelect: (file: File) => void;
}

export function ImageUpload({ onFileSelect }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    onFileSelect(file);
  }, [onFileSelect]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}>
          사진 업로드
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={handleFileChange}
        />
        <p className="text-sm text-slate-500">PNG, JPG 파일을 업로드 할 수 있어요.</p>
      </div>
      {preview ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-inner">
          <img src={preview} alt="업로드 미리보기" className="h-[300px] w-full object-cover" />
        </div>
      ) : (
        <p className="text-sm text-slate-500">아직 업로드된 이미지가 없어요.</p>
      )}
    </div>
  );
}
