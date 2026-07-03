import { generateAllPermutations } from "./generateAllPermutations";
import { getAllPermutations } from "./getAllPermutations";

describe("generateAllPermutations", () => {
  test("getAllPermutations と同じ結果", () => {
    expect([...generateAllPermutations(["a", "b"])]).toEqual(
      getAllPermutations(["a", "b"]),
    );
  });
});
