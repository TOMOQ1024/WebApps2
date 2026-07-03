import { getPermutations } from "./getPermutations";

function samePermutationSet<T>(actual: T[][], expected: T[][]): void {
  const key = (row: T[]) => JSON.stringify(row);
  expect(actual.map(key).sort()).toEqual(expected.map(key).sort());
}

describe("getPermutations", () => {
  test("全順列", () => {
    expect(getPermutations([1, 2]).length).toBe(2);
    samePermutationSet(getPermutations([1, 2, 3]), [
      [1, 2, 3],
      [1, 3, 2],
      [2, 1, 3],
      [2, 3, 1],
      [3, 1, 2],
      [3, 2, 1],
    ]);
  });

  test("部分順列", () => {
    expect(getPermutations([1, 2, 3], 2).length).toBe(6);
  });
});
