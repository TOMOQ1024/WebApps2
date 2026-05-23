/**
 * 配列から指定された数の順列をすべて生成する
 * @param items 元となる配列
 * @param count 1つの順列に含める要素数（指定しない場合は配列の全要素を使用）
 * @returns 生成された順列の配列
 */
export function getPermutations<T>(items: T[], count?: number): T[][] {
  const actualCount = count ?? items.length;
  const result: T[][] = [];
  const stack: { path: T[]; remaining: T[] }[] = [];

  stack.push({ path: [], remaining: [...items] });

  while (stack.length > 0) {
    const { path, remaining } = stack.pop()!;

    if (path.length === actualCount) {
      result.push(path);
      continue;
    }

    for (let i = remaining.length - 1; i >= 0; i--) {
      const newRemaining = [...remaining];
      const item = newRemaining.splice(i, 1)[0];
      stack.push({ path: [...path, item], remaining: newRemaining });
    }
  }

  return result;
}

/**
 * 配列から指定された数の順列をすべて生成する（反復可能な実装）
 * @param items 元となる配列
 * @param count 1つの順列に含める要素数（指定しない場合は配列の全要素を使用）
 */
export function* generatePermutations<T>(
  items: T[],
  count?: number
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

/**
 * 配列の全順列を生成する（配列の長さと同じ要素数の順列）
 * @param items 元となる配列
 * @returns 生成された順列の配列
 */
export function getAllPermutations<T>(items: T[]): T[][] {
  return getPermutations(items);
}

/**
 * 配列の全順列を生成する（反復可能な実装）
 * @param items 元となる配列
 */
export function* generateAllPermutations<T>(items: T[]): Generator<T[]> {
  yield* generatePermutations(items);
}

/**
 * 重複を許す順列を生成する
 * @param items 元となる配列
 * @param count 1つの順列に含める要素数
 * @returns 生成された重複順列の配列
 */
export function getPermutationsWithRepetition<T>(
  items: T[],
  count: number
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

/**
 * 重複を許す順列を生成する（反復可能な実装）
 * @param items 元となる配列
 * @param count 1つの順列に含める要素数
 */
export function* generatePermutationsWithRepetition<T>(
  items: T[],
  count: number
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
