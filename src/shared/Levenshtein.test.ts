import { Levenshtein } from "./Levenshtein";

describe("Levenshtein", () => {
  test("同一文字列", () => {
    expect(Levenshtein("abc", "abc")).toBe(0);
  });

  test("空文字列", () => {
    expect(Levenshtein("", "")).toBe(0);
    expect(Levenshtein("", "abc")).toBe(3);
    expect(Levenshtein("abc", "")).toBe(3);
  });

  test("1 文字差", () => {
    expect(Levenshtein("abc", "ab")).toBe(1);
    expect(Levenshtein("abc", "abd")).toBe(1);
  });

  test("典型例", () => {
    expect(Levenshtein("kitten", "sitting")).toBe(3);
  });

  test("大文字小文字を区別", () => {
    expect(Levenshtein("ABC", "abc")).toBe(3);
  });
});
