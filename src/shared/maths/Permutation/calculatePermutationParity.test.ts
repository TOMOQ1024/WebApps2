import { calculatePermutationParity } from "./calculatePermutationParity";

describe("calculatePermutationParity", () => {
  test("同一順序は偶置換", () => {
    expect(calculatePermutationParity(["a", "b", "c"], ["a", "b", "c"])).toBe(0);
  });

  test("隣接 swap は奇置換", () => {
    expect(calculatePermutationParity(["a", "b", "c"], ["b", "a", "c"])).toBe(1);
  });

  test("3 循環は偶置換", () => {
    expect(calculatePermutationParity(["a", "b", "c"], ["b", "c", "a"])).toBe(0);
  });

  test("長さ不一致で例外", () => {
    expect(() =>
      calculatePermutationParity(["a"], ["a", "b"]),
    ).toThrow("Arrays must have the same length");
  });

  test("存在しない要素で例外", () => {
    expect(() =>
      calculatePermutationParity(["a", "b"], ["a", "z"]),
    ).toThrow("Element z not found in source array");
  });
});
