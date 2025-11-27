"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { CanvasBoard, exportCanvasToBlob } from "@/components/canvas-board";
import { ImageUpload } from "@/components/image-upload";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { entryFormSchema } from "@/lib/zod-schemas";
import { useEntries } from "@/hooks/use-entries";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";

const modes = [
  { value: "upload" as const, label: "사진 업로드" },
  { value: "draw" as const, label: "캔버스 드로잉" }
];

type Mode = (typeof modes)[number]["value"];

export default function EntryForm() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { createEntry, isCreating, uploadProgress } = useEntries();
  const { user, profile, isLoading: authLoading } = useAuth();
  const [mode, setMode] = useState<Mode>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadVersion, setUploadVersion] = useState(0);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const progressLabel = useMemo(() => {
    if (!isCreating) return null;
    return `업로드 중... ${uploadProgress}%`;
  }, [isCreating, uploadProgress]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});
    let imageBlob: File | Blob | null = null;

    if (mode === "upload") {
      imageBlob = selectedFile;
    } else if (canvasRef.current) {
      imageBlob = await exportCanvasToBlob(canvasRef.current);
    }

    const validation = entryFormSchema.safeParse({
      message,
      imageFile: imageBlob ?? new Blob()
    });

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
      await createEntry({
        message,
        imageFile: validation.data.imageFile
      });
      toast.success("방명록 카드가 등록되었어요!");
      setSelectedFile(null);
      setUploadVersion((prev) => prev + 1);
      setMessage("");
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (authLoading) {
    return <EntryFormSkeleton />;
  }

  if (!user || !profile) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
        <p className="text-lg font-semibold text-slate-900">로그인 후 카드를 작성할 수 있어요.</p>
        <p className="mt-2 text-sm text-slate-600">내 닉네임으로 카드와 댓글을 남겨보세요.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <div className="flex-1">
            <Button asChild className="w-full">
              <Link href="/login?next=/create">로그인하기</Link>
            </Button>
          </div>
          <div className="flex-1">
            <Button asChild variant="outline" className="w-full">
              <Link href="/signup">회원가입</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <fieldset className="space-y-4" aria-label="이미지 작성 방식 선택">
        <legend className="text-sm font-semibold text-slate-700">이미지를 어떻게 남길까요?</legend>
        <div className="flex flex-wrap gap-3">
          {modes.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setMode(item.value)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition",
                mode === item.value
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-400/40"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              )}
              aria-pressed={mode === item.value}
            >
              {item.label}
            </button>
          ))}
        </div>
      </fieldset>

      {mode === "upload" ? (
        <ImageUpload key={uploadVersion} onFileSelect={setSelectedFile} />
      ) : (
        <CanvasBoard ref={canvasRef} />
      )}
      {errors.imageFile ? <p className="text-sm text-red-500">{errors.imageFile}</p> : null}

      <div className="grid gap-4">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          <span className="font-semibold text-slate-900">작성자</span>
          <span className="ml-2 text-slate-600">{profile.nickname}</span>
        </div>
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">한 줄 메시지</span>
          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="따뜻한 메시지를 남겨주세요"
            rows={4}
            aria-invalid={Boolean(errors.message)}
          />
          {errors.message ? <span className="text-sm text-red-500">{errors.message}</span> : null}
        </label>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {progressLabel ? (
          <div className="flex flex-col gap-1 text-sm text-slate-600" role="status">
            <span>{progressLabel}</span>
            <div className="h-2 w-48 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-slate-900 transition-all"
                style={{ width: `${uploadProgress}%` }}
                aria-valuenow={uploadProgress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">등록 후 갤러리에서 바로 확인할 수 있어요.</p>
        )}
        <Button type="submit" disabled={isCreating} className="min-w-[160px]">
          {isCreating ? "등록 중..." : "등록"}
        </Button>
      </div>
    </form>
  );
}

export function EntryFormSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-[320px] w-full" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full md:col-span-2" />
      </div>
      <Skeleton className="h-10 w-40" />
    </div>
  );
}
