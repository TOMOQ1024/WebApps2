import { differentiateLaTeX } from "./differentiateLaTeX";

describe("differentiateLaTeX", () => {
  test("数値の変換", () => {
    expect(differentiateLaTeX("1")).toBe("0");
  });

  test("多項式の変換", () => {
    expect(differentiateLaTeX("x^2")).toBe("2x");
    expect(differentiateLaTeX("x^3")).toBe("3{x}^{2}");
    expect(differentiateLaTeX("x^{1.5}")).toBe("1.5{x}^{0.5}");
    expect(differentiateLaTeX("x^{\\frac{1}{2}}")).toBe("0.5{x}^{-0.5}");
    expect(differentiateLaTeX("x^2+x^2")).toBe("4x");
  });

  test("基本的な初等関数の変換", () => {
    expect(differentiateLaTeX("\\sin x")).toBe("\\cos x");
    expect(differentiateLaTeX("\\cos x")).toBe("-\\sin x");
    expect(differentiateLaTeX("\\tan x")).toBe("\\left(\\sec x\\right)^{2}");
    expect(differentiateLaTeX("\\cot x")).toBe("-\\left(\\csc x\\right)^{2}");
    expect(differentiateLaTeX("\\sec x")).toBe("\\sec x \\tan x");
    expect(differentiateLaTeX("\\csc x")).toBe("-\\csc x \\cot x");
    expect(differentiateLaTeX("\\sinh x")).toBe("\\cosh x");
  });

  test("複雑な式の変換", () => {
    expect(differentiateLaTeX("-\\sin x")).toBe("-\\cos x");
    expect(differentiateLaTeX("\\sin\\left(x^2\\right)")).toBe(
      "2x \\cos\\left(x^2\\right)"
    );
  });
});
