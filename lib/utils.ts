export function hashString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function randomFromArray<T>(list: T[], seed: number) {
  if (list.length === 0) return undefined;
  const index = seed % list.length;
  return list[index];
}

export function rotationFromSeed(seed: number) {
  const rotations = [-4, -2, 0, 2, 4];
  return rotations[seed % rotations.length];
}
