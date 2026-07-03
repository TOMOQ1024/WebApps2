import { getPermutationsWithRepetition } from "./getPermutationsWithRepetition";

function samePermutationSet<T>(actual: T[][], expected: T[][]): void {
  const key = (row: T[]) => JSON.stringify(row);
  expect(actual.map(key).sort()).toEqual(expected.map(key).sort());
}

describe("getPermutationsWithRepetition", () => {
  test("重複順列 2 桁", () => {
    samePermutationSet(getPermutationsWithRepetition([0, 1], 2), [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ]);
  });
});
