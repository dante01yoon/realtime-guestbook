"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { DrawingCanvas, type DrawingCanvasHandle } from "@/components/drawing-canvas";
import { uploadEntryImage } from "@/lib/storage";
import { useCreateEntry } from "@/hooks/use-entries";

const formSchema = z.object({
  author: z.string().min(1, "이름을 입력해주세요").max(40),
  message: z.string().min(1, "메시지를 입력해주세요").max(200)
});

type Mode = "upload" | "draw";

export default function CreateEntryPage() {
  const [mode, setMode] = useState<Mode>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [drawingDirty, setDrawingDirty] = useState(false);
  const [drawingPreview, setDrawingPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const canvasRef = useRef<DrawingCanvasHandle | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const createEntry = useCreateEntry();

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    setUploadProgress(0);
    if (mode === "upload") {
      setDrawingPreview(null);
      setDrawingDirty(false);
    } else {
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
    }
  }, [mode, previewUrl]);

  const isSubmitting = createEntry.isPending;

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일만 업로드할 수 있어요.");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const values = {
      author: String(formData.get("author") ?? "").trim(),
      message: String(formData.get("message") ?? "").trim()
    };
    const parsed = formSchema.safeParse(values);
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => toast.error(issue.message));
      return;
    }

    let fileToUpload: File | null = null;

    if (mode === "upload") {
      if (!selectedFile) {
        toast.error("이미지를 선택해주세요.");
        return;
      }
      fileToUpload = selectedFile;
    } else {
      const blob = await canvasRef.current?.toBlob();
      if (!blob || !drawingDirty) {
        toast.error("캔버스에 그림을 그려주세요.");
        return;
      }
      fileToUpload = new File([blob], `${crypto.randomUUID()}.png`, { type: "image/png" });
    }

    try {
      toast.info("이미지를 업로드 중입니다...");
      const imageUrl = await uploadEntryImage(fileToUpload, setUploadProgress);
      await createEntry.mutateAsync({
        author: parsed.data.author,
        message: parsed.data.message,
        image_url: imageUrl
      });
      toast.success("카드가 등록되었습니다!");
      setSelectedFile(null);
      setPreviewUrl(null);
      setDrawingDirty(false);
      setDrawingPreview(null);
      setUploadProgress(0);
      canvasRef.current?.clear();
      formRef.current?.reset();
    } catch (error) {
      console.error(error);
      toast.error("카드를 등록하지 못했습니다.");
    }
  }

  const currentPreview = mode === "upload" ? previewUrl : drawingPreview;

  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 rounded-xl bg-white p-6 shadow">
        <fieldset className="space-y-3" aria-label="이미지 입력 방식 선택">
          <legend className="text-sm font-semibold text-slate-700">이미지 입력 방식</legend>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setMode("upload")}
              className={`rounded-md px-3 py-2 text-sm font-medium shadow ${mode === "upload" ? "bg-blue-500 text-white" : "bg-slate-100"}`}
            >
              사진 업로드
            </button>
            <button
              type="button"
              onClick={() => setMode("draw")}
              className={`rounded-md px-3 py-2 text-sm font-medium shadow ${mode === "draw" ? "bg-blue-500 text-white" : "bg-slate-100"}`}
            >
              직접 그리기
            </button>
          </div>
          {mode === "upload" ? (
            <div className="space-y-2">
              <label className="block text-sm font-medium" htmlFor="file">
                이미지를 업로드하세요
              </label>
              <input
                id="file"
                name="file"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                aria-describedby="file-description"
                className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm"
              />
              <p id="file-description" className="text-xs text-slate-500">
                PNG, JPG 등 이미지 파일을 업로드할 수 있습니다.
              </p>
            </div>
          ) : (
            <DrawingCanvas
              ref={canvasRef}
              onDirtyChange={setDrawingDirty}
              onImageChange={setDrawingPreview}
            />
          )}
        </fieldset>

        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="author">
            이름
          </label>
          <input
            id="author"
            name="author"
            required
            maxLength={40}
            className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm"
            placeholder="홍길동"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="message">
            메시지
          </label>
          <textarea
            id="message"
            name="message"
            required
            maxLength={200}
            rows={4}
            className="w-full resize-none rounded border border-slate-300 bg-white px-3 py-2 text-sm"
            placeholder="짧은 인사말을 남겨주세요"
          />
        </div>

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div aria-live="polite" className="space-y-1">
            <p className="text-sm text-slate-600">업로드 중... {uploadProgress}%</p>
            <div className="h-2 rounded-full bg-slate-200">
              <div
                className="h-2 rounded-full bg-blue-500 transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
        >
          {isSubmitting ? "등록 중..." : "등록"}
        </button>
      </form>

      <aside className="rounded-xl bg-white p-6 shadow" aria-live="polite">
        <h2 className="mb-3 text-lg font-semibold">미리보기</h2>
        <div className="flex h-80 items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50">
          {currentPreview ? (
            <img src={currentPreview} alt="카드 미리보기" className="h-full w-full object-contain" />
          ) : (
            <p className="text-sm text-slate-500">이미지를 선택하거나 그림을 그리면 미리보기로 확인할 수 있어요.</p>
          )}
        </div>
        <p className="mt-4 text-xs text-slate-500">
          등록 버튼을 누르면 이미지가 Supabase Storage에 저장되고 카드가 생성됩니다.
        </p>
      </aside>
    </section>
  );
}
