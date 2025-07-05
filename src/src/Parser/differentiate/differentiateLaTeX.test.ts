import { differentiateLaTeX } from "./differentiateLaTeX";

describe("differentiateLaTeX", () => {
  console.log("NOTE: 同じ意味であれば，空白や括弧の有無は無視して良い．");

  test("数値の変換", () => {
    expect(differentiateLaTeX("1")).toBe("0");
  });

  test("有理式の変換", () => {
    expect(differentiateLaTeX("x^2")).toBe("2x");
    expect(differentiateLaTeX("x^3")).toBe("3x^{2}");
    expect(differentiateLaTeX("x^{1.5}")).toBe("\\frac{3}{2}x^{\\frac{1}{2}}");
    expect(differentiateLaTeX("x^{2.5}")).toBe("\\frac{5}{2}x^{\\frac{3}{2}}");
    expect(differentiateLaTeX("x^{\\frac{1}{2}}")).toBe(
      "\\frac{1}{2}x^{-\\frac{1}{2}}"
    );
    expect(differentiateLaTeX("x^2+x^2")).toBe("4x");
    expect(differentiateLaTeX("xx")).toBe("2x");
    expect(differentiateLaTeX("xxx")).toBe("3x^{2}");
    expect(differentiateLaTeX("x^2x")).toBe("3x^{2}");
    expect(differentiateLaTeX("x^{-1}")).toBe("-x^{-2}");
    expect(differentiateLaTeX("x^{-1.5}")).toBe(
      "-\\frac{3}{2}x^{-\\frac{5}{2}}"
    );
    expect(differentiateLaTeX("\\frac{3}{x}")).toBe("-3x^{-2}");
  });

  test("複雑な有理式の変換", () => {
    expect(differentiateLaTeX("\\frac{x}{x}")).toBe("0");
    expect(differentiateLaTeX("x\\frac{1}{x}")).toBe("0");
    expect(differentiateLaTeX("\\frac{1}{x}x")).toBe("0");
    expect(differentiateLaTeX("\\frac{x^2}{x}")).toBe("1");
    expect(differentiateLaTeX("\\frac{x^2+x^2}{x}")).toBe("2");
    expect(differentiateLaTeX("\\frac{x}{x^2+x^2}")).toBe(
      "-\\frac{1}{2}x^{-2}"
    );
    expect(differentiateLaTeX("\\frac{x^2}{x^2}")).toBe("0");
    expect(differentiateLaTeX("\\frac{x^2}{x^3}")).toBe("-x^{-2}");
    expect(differentiateLaTeX("\\frac{1}{2}x")).toBe("\\frac{1}{2}");
    expect(differentiateLaTeX("\\frac{1}{2x}")).toBe("-\\frac{1}{2}x^{-2}");
    expect(differentiateLaTeX("-\\left(x^2-x\\right)")).toBe("-2x+1");
    expect(differentiateLaTeX("x^{\\frac{4}{2+1}}")).toBe(
      "\\frac{4}{3}x^{\\frac{1}{3}}"
    );
    expect(differentiateLaTeX("x^{2\\cdot 3}")).toBe("6x^{5}");
  });

  test("基本的な初等関数の変換", () => {
    expect(differentiateLaTeX("e^x")).toBe("e^{x}");
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
    expect(differentiateLaTeX("\\cos \\left(-x\\right)")).toBe("-\\sin x");
    expect(differentiateLaTeX("\\sin \\left(-x\\right)")).toBe("-\\cos x");
    expect(differentiateLaTeX("x\\cos x")).toBe("\\cos x - x\\sin x");
    expect(differentiateLaTeX("\\sin x^2")).toBe("2x \\cos x^{2}");
    expect(differentiateLaTeX("\\sin \\left(\\frac{x}{2}\\right)")).toBe(
      "\\frac{1}{2} \\cos \\left(\\frac{x}{2}\\right)"
    );
    expect(differentiateLaTeX("\\sin \\left(2\\cdot 3x\\right)")).toBe(
      "6 \\cos \\left(6x\\right)"
    );
    expect(differentiateLaTeX("\\cos \\left(\\cos x\\right)")).toBe(
      "\\left(\\sin x\\right)\\sin \\left(\\cos x\\right)"
    );
    expect(differentiateLaTeX("\\frac{1}{\\cos x}")).toBe(
      "\\left(\\sin x\\right)\\left(\\cos x\\right)^{-2}"
    );
    expect(differentiateLaTeX("\\sin\\left(x^2\\right)")).toBe(
      "2x \\cos x^{2}"
    );
    expect(differentiateLaTeX("x^{\\sin x}")).toBe(
      "x^{\\sin x}\\ln x\\cos x + x^{\\sin x - 1}\\sin x"
    );
    expect(differentiateLaTeX("e^{\\sin x}")).toBe("e^{\\sin x}\\cos x");
  });
});
