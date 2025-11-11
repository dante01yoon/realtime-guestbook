"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";
import { useEntries } from "@/hooks/use-entries";
import { getPostItColor, getPostItRotation, POST_IT_TEXT_COLOR } from "@/lib/colors";
import { Skeleton } from "@/components/ui/skeleton";

export default function PostItBoard() {
  const { entries, isLoading, isError, refetch } = useEntries();

  const items = useMemo(
    () =>
      entries.map((entry, index) => ({
        ...entry,
        color: getPostItColor(index),
        rotation: getPostItRotation(index)
      })),
    [entries]
  );

  if (isLoading) {
    return <GallerySkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-white/60 p-10 text-center">
        <p className="text-sm text-slate-600">카드를 불러오는 중 문제가 발생했습니다.</p>
        <button
          type="button"
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          onClick={() => refetch()}
        >
          다시 시도하기
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <AnimatePresence>
        {items.map((entry) => (
          <motion.article
            key={entry.id}
            layout
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
          >
            <Link href={`/entry/${entry.id}`} className="group block focus:outline-none focus:ring-2 focus:ring-slate-400">
              <div
                className={`relative flex h-64 w-full flex-col justify-between rounded-3xl p-6 shadow-lg shadow-slate-300/30 ${entry.color} ${POST_IT_TEXT_COLOR}`}
                style={{ transform: `rotate(${entry.rotation}deg)` }}
              >
                <div className="space-y-3">
                  <div className="overflow-hidden rounded-2xl border border-black/10 bg-black/5">
                    <img
                      src={entry.image_url}
                      alt={`${entry.author}님의 카드 미리보기`}
                      className="h-36 w-full object-cover transition duration-200 group-hover:scale-105"
                    />
                  </div>
                  <p className="line-clamp-2 text-sm font-medium">{entry.message}</p>
                </div>
                <footer className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                  {entry.author}
                </footer>
              </div>
            </Link>
          </motion.article>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function GallerySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <Skeleton key={index} className="h-64 w-full rounded-3xl" />
      ))}
    </div>
  );
}
