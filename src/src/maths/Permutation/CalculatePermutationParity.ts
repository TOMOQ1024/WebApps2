/**
 * 置換の偶奇性を計算する
 * @param from 元の配列
 * @param to 変換後の配列
 * @returns 0 なら偶置換、1 なら奇置換
 */
export function calculatePermutationParity(
  from: string[],
  to: string[],
): number {
  // 要素が同じであることを確認
  if (from.length !== to.length) {
    throw new Error("Arrays must have the same length");
  }

  // 各要素の位置をマッピング
  const indexMap = new Map<string, number>();
  from.forEach((val, idx) => {
    indexMap.set(val, idx);
  });

  // 転倒数を数える
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

  // 転倒数が奇数なら奇置換（1）、偶数なら偶置換（0）
  return inversions % 2;
}
