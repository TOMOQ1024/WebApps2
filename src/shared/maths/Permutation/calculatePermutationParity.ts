/**
 * 置換の偶奇性を計算する
 * @returns 0 なら偶置換、1 なら奇置換
 */
export function calculatePermutationParity(
  from: string[],
  to: string[],
): number {
  if (from.length !== to.length) {
    throw new Error("Arrays must have the same length");
  }

  const indexMap = new Map<string, number>();
  from.forEach((val, idx) => {
    indexMap.set(val, idx);
  });

  let inversions = 0;
  for (let i = 0; i < to.length; i++) {
    const fromIdx = indexMap.get(to[i]);
    if (fromIdx === undefined) {
      throw new Error(`Element ${to[i]} not found in source array`);
    }
    for (let j = i + 1; j < to.length; j++) {
      const toIdx = indexMap.get(to[j]);
      if (toIdx !== undefined && fromIdx > toIdx) {
        inversions++;
      }
    }
  }

  return inversions % 2;
}
