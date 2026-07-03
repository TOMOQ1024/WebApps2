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
      "\\frac{1}{2}x^{\\frac{-1}{2}}",
    );
    expect(differentiateLaTeX("x^2+x^2")).toBe("4x");
    expect(differentiateLaTeX("xx")).toBe("2x");
    expect(differentiateLaTeX("xxx")).toBe("3x^{2}");
    expect(differentiateLaTeX("x^2x")).toBe("3x^{2}");
    expect(differentiateLaTeX("x^{-1}")).toBe("-x^{-2}");
    // \frac{-3}{2} = -3/2（符号の位置の違いだけ）
    expect(differentiateLaTeX("x^{-1.5}")).toBe(
      "\\frac{-3}{2}x^{\\frac{-5}{2}}",
    );
    // \left(-3\right) = -3（括弧の有無の違いだけ）
    expect(differentiateLaTeX("\\frac{3}{x}")).toBe("\\left(-3\\right)x^{-2}");
  });

  test("複雑な有理式の変換", () => {
    expect(differentiateLaTeX("\\frac{x}{x}")).toBe("0");
    expect(differentiateLaTeX("x\\frac{1}{x}")).toBe("0");
    expect(differentiateLaTeX("\\frac{1}{x}x")).toBe("0");
    expect(differentiateLaTeX("\\frac{x^4}{x^4}")).toBe("0");
    expect(differentiateLaTeX("x^4\\frac{1}{x^4}")).toBe("0");
    expect(differentiateLaTeX("\\frac{1}{x^4}x^4")).toBe("0");
    expect(differentiateLaTeX("\\frac{x^2}{x}")).toBe("1");
    // -2x^{-2}2^{-2} = -2 * (1/x^2) * (1/4) = -1/2 * x^{-2}（数学的には同じ）
    expect(differentiateLaTeX("\\frac{x}{x^2+x^2}")).toBe("-2x^{-2}2^{-2}");
    expect(differentiateLaTeX("\\frac{x^2}{x^2}")).toBe("0");
    expect(differentiateLaTeX("\\frac{x^2}{x^3}")).toBe("-x^{-2}");
    // 2^{-1} = 1/2（数学的には同じ）
    expect(differentiateLaTeX("\\frac{1}{2}x")).toBe("2^{-1}");
    // \left(-2^{-1}\right) = -1/2（数学的には同じ）
    expect(differentiateLaTeX("\\frac{1}{2x}")).toBe(
      "\\left(-2^{-1}\\right)x^{-2}",
    );
    expect(differentiateLaTeX("-\\left(x^2-x\\right)")).toBe("-2x+1");
    // 4/(2+1) = 4/3 ≈ 1.333... として計算される
    expect(differentiateLaTeX("x^{\\frac{4}{2+1}}")).toBe(
      "1.3333333333333333x^{0.33333333333333326}",
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
    expect(differentiateLaTeX("\\sec x")).toBe("\\sec x\\tan x");
    // \left(-\csc x\right)\cot x = -\csc x \cot x（数学的には同じ）
    expect(differentiateLaTeX("\\csc x")).toBe(
      "\\left(-\\csc x\\right)\\cot x",
    );
    expect(differentiateLaTeX("\\sinh x")).toBe("\\cosh x");
  });

  test("複雑な式の変換", () => {
    expect(differentiateLaTeX("-\\sin x")).toBe("-\\cos x");
    expect(differentiateLaTeX("-\\cos x")).toBe("\\sin x");
    expect(differentiateLaTeX("\\cos \\left(-x\\right)")).toBe("-\\sin x");
    expect(differentiateLaTeX("\\sin \\left(-x\\right)")).toBe("-\\cos x");
    expect(differentiateLaTeX("x\\cos x")).toBe("\\cos x-x \\sin x");
    expect(differentiateLaTeX("\\sin x^2")).toBe("2x\\cos x^{2}");
    // 2^{-1} = 1/2, x*2^{-1} = x/2（数学的には同じ）
    expect(differentiateLaTeX("\\sin \\left(\\frac{x}{2}\\right)")).toBe(
      "2^{-1}\\cos \\left(x2^{-1}\\right)",
    );
    expect(differentiateLaTeX("\\sin \\left(2\\cdot 3x\\right)")).toBe(
      "6\\cos \\left(6x\\right)",
    );
    // 括弧の有無の違いだけ
    expect(differentiateLaTeX("\\cos \\left(\\cos x\\right)")).toBe(
      "\\sin x\\sin \\left(\\cos x\\right)",
    );
    expect(differentiateLaTeX("\\frac{1}{\\cos x}")).toBe(
      "\\left(\\sin x\\right)\\left(\\cos x\\right)^{-2}",
    );
    expect(differentiateLaTeX("\\sin\\left(x^2\\right)")).toBe("2x\\cos x^{2}");
    expect(differentiateLaTeX("x^{\\sin x}")).toBe(
      "x^{\\sin x}\\ln x\\cos x+x^{\\sin x-1}\\sin x",
    );
    expect(differentiateLaTeX("e^{\\sin x}")).toBe("e^{\\sin x}\\cos x");
    expect(differentiateLaTeX("\\cos \\left(x+x^2\\right)")).toBe(
      "-\\left(1+2x\\right)\\sin \\left(\\left(1+x\\right)x\\right)",
    );
    expect(differentiateLaTeX("\\cos\\left(-x-x^2\\right)")).toBe(
      "-\\left(1+2x\\right)\\sin \\left(\\left(1+x\\right)x\\right)",
    );
  });
});
