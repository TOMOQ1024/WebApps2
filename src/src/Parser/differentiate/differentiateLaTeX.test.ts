import { differentiateLaTeX } from "./differentiateLaTeX";

describe("differentiateLaTeX", () => {
  console.log("NOTE: 同じ意味であれば，空白や括弧の有無は無視して良い．");

  test("数値の変換", () => {
    expect(differentiateLaTeX("1")).toBe("0");
  });

  test("多項式の変換", () => {
    expect(differentiateLaTeX("x^2")).toBe("2x");
    expect(differentiateLaTeX("x^3")).toBe("3x^{2}");
    expect(differentiateLaTeX("x^{1.5}")).toBe("1.5x^{0.5}");
    expect(differentiateLaTeX("x^{2.5}")).toBe("2.5x^{1.5}");
    expect(differentiateLaTeX("x^{\\frac{1}{2}}")).toBe("0.5x^{-0.5}");
    expect(differentiateLaTeX("x^2+x^2")).toBe("4x");
    expect(differentiateLaTeX("xx")).toBe("2x");
    expect(differentiateLaTeX("xxx")).toBe("3x^{2}");
    expect(differentiateLaTeX("x^2x")).toBe("3x^{2}");
  });

  test("基本的な初等関数の変換", () => {
    // expect(differentiateLaTeX("e^x")).toBe("e^x");
    expect(differentiateLaTeX("\\exp x")).toBe("\\exp x");
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
    expect(differentiateLaTeX("-\\cos x")).toBe("\\sin x");
    expect(differentiateLaTeX("x\\cos x")).toBe("\\cos x - x\\sin x");
    expect(differentiateLaTeX("\\sin x^2")).toBe("2x \\cos x^{2}");
    expect(differentiateLaTeX("\\sin\\left(x^2\\right)")).toBe(
      "2x \\cos x^{2}"
    );
    expect(differentiateLaTeX("x^{\\sin x}")).toBe(
      "x^{\\sin x}\\ln x\\cos x + x^{\\sin x}\\frac{\\sin x}{x}"
    );
  });
});
