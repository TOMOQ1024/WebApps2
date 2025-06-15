/**
 * 配列から指定された数の組み合わせをすべて生成する
 * @param items 元となる配列
 * @param count 1つの組み合わせに含める要素数
 * @returns 生成された組み合わせの配列
 */
export function getCombinations<T>(items: T[], count: number): T[][] {
  const result: T[][] = [];
  const stack: { path: T[]; start: number }[] = [];

  stack.push({ path: [], start: 0 });

  while (stack.length > 0) {
    const { path, start } = stack.pop()!;

    if (path.length === count) {
      result.push(path);
      continue;
    }

    for (let i = items.length - 1; i >= start; i--) {
      stack.push({ path: [...path, items[i]], start: i + 1 });
    }
  }

  return result;
}

/**
 * 配列から指定された数の組み合わせをすべて生成する（反復可能な実装）
 * @param items 元となる配列
 * @param count 1つの組み合わせに含める要素数
 */
export function* generateCombinations<T>(
  items: T[],
  count: number
): Generator<T[]> {
  const stack: { path: T[]; start: number }[] = [];
  stack.push({ path: [], start: 0 });

  while (stack.length > 0) {
    const { path, start } = stack.pop()!;

    if (path.length === count) {
      yield path;
      continue;
    }

    for (let i = items.length - 1; i >= start; i--) {
      stack.push({ path: [...path, items[i]], start: i + 1 });
    }
  }
}
