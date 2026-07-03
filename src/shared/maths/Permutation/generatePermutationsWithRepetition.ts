/**
 * 重複を許す順列を生成する（反復可能な実装）
 */
export function* generatePermutationsWithRepetition<T>(
  items: T[],
  count: number,
): Generator<T[]> {
  const stack: { path: T[] }[] = [];
  stack.push({ path: [] });

  while (stack.length > 0) {
    const { path } = stack.pop()!;

    if (path.length === count) {
      yield path;
      continue;
    }

    for (let i = items.length - 1; i >= 0; i--) {
      stack.push({ path: [...path, items[i]] });
    }
  }
}
