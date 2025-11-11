import type { Entry } from "@/lib/types";
import { hashString, randomFromArray, rotationFromSeed } from "@/lib/utils";
import Link from "next/link";

const COLORS = [
  "bg-postit-yellow",
  "bg-postit-pink",
  "bg-postit-green",
  "bg-postit-blue"
];

export function PostitCard({ entry }: { entry: Entry }) {
  const seed = hashString(entry.id);
  const color = randomFromArray(COLORS, seed) ?? COLORS[0];
  const rotation = rotationFromSeed(seed);

  return (
    <Link
      href={`/entry/${entry.id}`}
      className="block transform transition hover:-translate-y-1 focus-visible:-translate-y-1"
      aria-label={`${entry.author}님의 카드 보기`}
    >
      <article
        className={`relative flex h-60 w-full max-w-xs flex-col gap-3 rounded-md p-4 text-slate-800 shadow-postit ${color}`}
        style={{ rotate: `${rotation}deg` }}
      >
        <div className="flex-1 overflow-hidden rounded-md bg-white shadow-inner">
          <img
            src={entry.image_url}
            alt={`${entry.author}님의 방명록 카드 이미지`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        <div>
          <p className="text-sm font-semibold">{entry.author}</p>
          <p className="clamp-2 text-sm text-slate-700">{entry.message}</p>
        </div>
      </article>
    </Link>
  );
}
