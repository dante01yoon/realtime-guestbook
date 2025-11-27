export const POST_IT_COLORS = [
  "bg-postit-lemon",
  "bg-postit-mint",
  "bg-postit-peach",
  "bg-postit-lilac",
  "bg-postit-sky"
];

export const POST_IT_TEXT_COLOR = "text-slate-800";

export function getPostItColor(index: number) {
  return POST_IT_COLORS[index % POST_IT_COLORS.length];
}

const rotationAngles = [-3, -2, 0, 2, 3, 1, -1];

export function getPostItRotation(index: number) {
  return rotationAngles[index % rotationAngles.length];
}
