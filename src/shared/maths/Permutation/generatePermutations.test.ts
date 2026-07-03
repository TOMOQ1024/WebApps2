import { generatePermutations } from "./generatePermutations";
import { getPermutations } from "./getPermutations";

describe("generatePermutations", () => {
  test("getPermutations と同じ結果", () => {
    expect([...generatePermutations(["a", "b"])]).toEqual(
      getPermutations(["a", "b"]),
    );
  });
});
