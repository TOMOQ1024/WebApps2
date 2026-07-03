/**
 * 配列から指定された数の組み合わせをすべて生成する
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
