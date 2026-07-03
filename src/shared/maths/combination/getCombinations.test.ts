import { getCombinations } from "./getCombinations";

function sameCombinationSet<T>(actual: T[][], expected: T[][]): void {
  const key = (row: T[]) => JSON.stringify(row);
  expect(actual.map(key).sort()).toEqual(expected.map(key).sort());
}

describe("getCombinations", () => {
  test("2 要素取り from 3 要素", () => {
    sameCombinationSet(getCombinations(["a", "b", "c"], 2), [
      ["a", "b"],
      ["a", "c"],
      ["b", "c"],
    ]);
  });

  test("count が 0 のとき空組み合わせ 1 件", () => {
    expect(getCombinations([1, 2, 3], 0)).toEqual([[]]);
  });

  test("count が配列長より大きいとき空", () => {
    expect(getCombinations([1, 2], 3)).toEqual([]);
  });

  test("空配列", () => {
    expect(getCombinations([], 0)).toEqual([[]]);
    expect(getCombinations([], 1)).toEqual([]);
  });
});
