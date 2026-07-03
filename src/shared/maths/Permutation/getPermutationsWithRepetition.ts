/**
 * 重複を許す順列を生成する
 */
export function getPermutationsWithRepetition<T>(
  items: T[],
  count: number,
): T[][] {
  const result: T[][] = [];
  const stack: { path: T[] }[] = [];

  stack.push({ path: [] });

  while (stack.length > 0) {
    const { path } = stack.pop()!;

    if (path.length === count) {
      result.push(path);
      continue;
    }

    for (let i = items.length - 1; i >= 0; i--) {
      stack.push({ path: [...path, items[i]] });
    }
  }

  return result;
}
