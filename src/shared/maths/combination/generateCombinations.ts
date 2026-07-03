/**
 * 配列から指定された数の組み合わせをすべて生成する（反復可能な実装）
 */
export function* generateCombinations<T>(
  items: T[],
  count: number,
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
