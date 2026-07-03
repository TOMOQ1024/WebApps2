import { getAllPermutations } from "./getAllPermutations";
import { getPermutations } from "./getPermutations";

function samePermutationSet<T>(actual: T[][], expected: T[][]): void {
  const key = (row: T[]) => JSON.stringify(row);
  expect(actual.map(key).sort()).toEqual(expected.map(key).sort());
}

describe("getAllPermutations", () => {
  test("getPermutations と同じ", () => {
    samePermutationSet(getAllPermutations(["x", "y"]), getPermutations(["x", "y"]));
  });
});
