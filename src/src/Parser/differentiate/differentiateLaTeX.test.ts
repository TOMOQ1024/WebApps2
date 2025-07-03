import { differentiateLaTeX } from "./differentiateLaTeX";

describe("differentiateLaTeX", () => {
  test("数値の変換", () => {
    expect(differentiateLaTeX("1")).toBe("0");
  });

  test("多項式の変換", () => {
    expect(differentiateLaTeX("x^2")).toBe("2x");
    expect(differentiateLaTeX("x^3")).toBe("3{x}^{2}");
    expect(differentiateLaTeX("x^{1.5}")).toBe("1.5{x}^{0.5}");
    expect(differentiateLaTeX("x^{\\frac{1}{2}}")).toBe(
      "\\frac{1}{2}x^{-\\frac{1}{2}}"
    );
  });

  test("三角関数の変換", () => {
    expect(differentiateLaTeX("\\sin x")).toBe("\\cos x");
  });
});
