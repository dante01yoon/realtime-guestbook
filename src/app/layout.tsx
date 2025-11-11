import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/providers/toast-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "실시간 전자 방명록",
  description: "사진과 드로잉으로 남기는 포스트잇 방명록"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={inter.variable}>
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
