"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      toastOptions={{
        className: "rounded-xl bg-slate-900 text-white shadow-lg",
        duration: 4000
      }}
      richColors
    />
  );
}
