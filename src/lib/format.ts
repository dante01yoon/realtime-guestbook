export function formatRelativeDate(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diff = now.getTime() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "방금 전";
  if (diff < hour) return `${Math.floor(diff / minute)}분 전`;
  if (diff < day) return `${Math.floor(diff / hour)}시간 전`;
  return date.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}
