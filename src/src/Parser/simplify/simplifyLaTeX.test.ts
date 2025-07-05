import { simplifyLaTeX } from "./simplifyLaTeX";

describe("simplifyLaTeX", () => {
  console.log("NOTE: 同じ意味であれば，空白や括弧の有無は無視して良い．");

  test("有理式の変換", () => {
    expect(simplifyLaTeX("x^2x^5")).toBe("x^{7}");
    expect(simplifyLaTeX("\\left(x^3\\right)^2")).toBe("x^{6}");
    expect(simplifyLaTeX("x^4\\left(x^3\\right)^2x^{-2}")).toBe("x^{8}");
    expect(simplifyLaTeX("\\frac{x^7}{2x^3}")).toBe("\\frac{x^{4}}{2}");
    expect(simplifyLaTeX("\\frac{x+x}{2x}")).toBe("1");
    expect(simplifyLaTeX("\\frac{x+x^2}{2x}")).toBe("\\frac{1+x}{2}");
    expect(simplifyLaTeX("\\frac{6x+4x^2}{2x}")).toBe("3+2x");
    expect(simplifyLaTeX("\\frac{x^7 \\cdot 6x}{3x^3 \\cdot x^2}")).toBe(
      "2x^{3}"
    );
    expect(simplifyLaTeX("\\frac{x-x+x+x}{2x^2\\cdot 3}")).toBe(
      "\\frac{1}{3x}"
    );
    expect(simplifyLaTeX("\\frac{\\frac{x^2}{2}}{x^3}")).toBe("\\frac{1}{2x}");
    expect(simplifyLaTeX("\\frac{\\frac{x^2}{2}}{x^3}x")).toBe("\\frac{1}{2}");
  });

  test("一般の変数名", () => {
    expect(simplifyLaTeX("xxyyyzzzz+wwwww")).toBe("x^{2}y^{3}z^{4}+w^{5}");
    expect(simplifyLaTeX("\\frac{x^4y^7z}{yz^2}")).toBe("x^{4}y^{6}z^{-1}");
  });
});
