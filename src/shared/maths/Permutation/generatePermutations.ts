/**
 * 配列から指定された数の順列をすべて生成する（反復可能な実装）
 */
export function* generatePermutations<T>(
  items: T[],
  count?: number,
): Generator<T[]> {
  const actualCount = count ?? items.length;
  const stack: { path: T[]; remaining: T[] }[] = [];
  stack.push({ path: [], remaining: [...items] });

  while (stack.length > 0) {
    const { path, remaining } = stack.pop()!;

    if (path.length === actualCount) {
      yield path;
      continue;
    }

    for (let i = remaining.length - 1; i >= 0; i--) {
      const newRemaining = [...remaining];
      const item = newRemaining.splice(i, 1)[0];
      stack.push({ path: [...path, item], remaining: newRemaining });
    }
  }
}
