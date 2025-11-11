import { v4 as uuid } from "uuid";
import { getSupabaseClient } from "@/lib/supabase-client";

export async function uploadImage(file: File | Blob, onProgress?: (progress: number) => void) {
  const supabase = getSupabaseClient();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Supabase 환경 변수가 설정되지 않았습니다.");
  }

  const fileExt = "png";
  const fileName = `${uuid()}.${fileExt}`;
  const path = `cards/${fileName}`;
  const uploadUrl = `${url}/storage/v1/object/guestbook/${path}`;
  const fileToUpload =
    file instanceof File ? file : new File([file], fileName, { type: "image/png" });

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", uploadUrl);
    xhr.setRequestHeader("Authorization", `Bearer ${key}`);
    xhr.setRequestHeader("apikey", key);

    xhr.upload.onprogress = (event) => {
      if (onProgress && event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve();
      } else {
        reject(new Error(xhr.responseText || "업로드에 실패했습니다."));
      }
    };

    xhr.onerror = () => {
      reject(new Error("업로드에 실패했습니다."));
    };

    const formData = new FormData();
    formData.append("file", fileToUpload, fileName);
    xhr.send(formData);
  });

  const { data: publicUrl, error } = supabase.storage.from("guestbook").getPublicUrl(path);
  if (error) {
    throw error;
  }
  return publicUrl.publicUrl;
}
