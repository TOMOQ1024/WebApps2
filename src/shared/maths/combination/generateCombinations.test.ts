import { generateCombinations } from "./generateCombinations";
import { getCombinations } from "./getCombinations";

describe("generateCombinations", () => {
  test("getCombinations と同じ結果", () => {
    const items = [1, 2, 3, 4];
    const count = 2;
    expect([...generateCombinations(items, count)]).toEqual(
      getCombinations(items, count),
    );
  });
});
