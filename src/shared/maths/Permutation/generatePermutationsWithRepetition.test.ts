import { generatePermutationsWithRepetition } from "./generatePermutationsWithRepetition";
import { getPermutationsWithRepetition } from "./getPermutationsWithRepetition";

describe("generatePermutationsWithRepetition", () => {
  test("getPermutationsWithRepetition と同じ結果", () => {
    expect([...generatePermutationsWithRepetition(["+"], 2)]).toEqual(
      getPermutationsWithRepetition(["+"], 2),
    );
  });
});
