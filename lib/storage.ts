import { STORAGE_BUCKET, supabaseClient } from "@/lib/supabase-client";

export async function uploadEntryImage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  const fileExt = file.type.split("/").pop() ?? "png";
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `entries/${fileName}`;

  const { error } = await supabaseClient.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
      onUploadProgress: ({ bytesLoaded, bytesTotal }) => {
        if (onProgress && bytesTotal) {
          onProgress(Math.round((bytesLoaded / bytesTotal) * 100));
        }
      }
    });

  if (error) {
    throw error;
  }

  const {
    data: { publicUrl }
  } = supabaseClient.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);

  return publicUrl;
}
