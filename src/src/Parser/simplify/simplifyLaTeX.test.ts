import { simplifyLaTeX } from "./simplifyLaTeX";

describe("simplifyLaTeX", () => {
  console.log("NOTE: 同じ意味であれば，空白や括弧の有無は無視して良い．");

  test("加法に関する簡単化", () => {
    expect(
      simplifyLaTeX(
        "9\\left(\\pi^{x}+\\sin x\\right)+2\\left(\\pi^{x}+\\sin x\\right)"
      )
    ).toBe("11\\left(\\pi^{x}+\\sin x\\right)");
    expect(
      simplifyLaTeX("9\\left(\\pi^{x}+\\sin x\\right)+\\pi^{x}+\\sin x")
    ).toBe("10\\left(\\pi^{x}+\\sin x\\right)");
    expect(
      simplifyLaTeX("9\\left(\\pi^{x}+\\sin x\\right)+34+\\pi^{x}+\\sin x")
    ).toBe("10\\left(\\pi^{x}+\\sin x\\right)+34");
  });
  expect(
    simplifyLaTeX(
      "\\left(9+\\tan x\\right)\\left(\\pi^{x}+\\sin x\\right)+\\pi^{x}+\\sin x"
    )
  ).toBe("\\left(10+\\tan x\\right)\\left(\\pi^{x}+\\sin x\\right)");

  test("乗法に関する簡単化", () => {
    expect(
      simplifyLaTeX(
        "\\left(\\pi^{x}+\\sin x\\right)\\left(\\pi^{x}+\\sin x\\right)^7"
      )
    ).toBe("\\left(\\pi^{x}+\\sin x\\right)^{8}");
    expect(
      simplifyLaTeX(
        "\\left(\\pi^{x}+\\sin x\\right)^7\\left(\\pi^{x}+\\sin x\\right)^2"
      )
    ).toBe("\\left(\\pi^{x}+\\sin x\\right)^{9}");
    expect(
      simplifyLaTeX(
        "\\frac{\\left(\\pi^{x}+\\sin x\\right)^{3}\\left(\\pi^{x}+\\sin x\\right)}{\\left(\\pi^{x}+\\sin x\\right)^{5}}"
      )
    ).toBe("\\left(\\pi^{x}+\\sin x\\right)^{-1}");
  });

  test("約分できない場合はそのままにする", () => {
    expect(simplifyLaTeX("x^{\\frac{254}{3}}")).toBe("x^{\\frac{254}{3}}");
    expect(simplifyLaTeX("x^{\\frac{102}{398157}}")).toBe(
      "x^{\\frac{2}{7807}}"
    );
    expect(simplifyLaTeX("x^{\\frac{25467}{378173}}")).toBe(
      "x^{\\frac{25467}{378173}}"
    );
  });

  test("指数に関する簡単化", () => {
    expect(
      simplifyLaTeX(
        "\\left(2\\left(\\pi^{x}+\\sin x\\right)^{3}\\left(\\pi^{x}+2\\sin x\\right)\\right)^{2}"
      )
    ).toBe(
      "4\\left(\\pi^{x}+\\sin x\\right)^{6}\\left(\\pi^{x}+2\\sin x\\right)^{2}"
    );
    expect(
      simplifyLaTeX(
        "\\left(2\\left(\\pi^{x}+\\sin x\\right)^{3}\\left(\\pi^{x}+2\\sin x\\right)\\right)^{2}"
      )
    ).toBe(
      "2^{2}\\left(\\pi^{x}+\\sin x\\right)^{6}\\left(\\pi^{x}+2\\sin x\\right)^{2}"
    );
    expect(simplifyLaTeX("\\left(\\pi^{x}+\\sin x\\right)^{-1}")).toBe(
      "\\frac{1}{\\pi^{x}+\\sin x}"
    );
  });

  test("因数分解を行う", () => {
    expect(simplifyLaTeX("x^2+x")).toBe("x\\left(x+1\\right)");
    expect(simplifyLaTeX("x^2+x^2")).toBe("2x^{2}");
    expect(simplifyLaTeX("x^2+x^2+2x^2+\\frac{x^3}{x}")).toBe("5x^{2}");
    expect(simplifyLaTeX("x\\left(x+1\\right)")).toBe("x\\left(x+1\\right)");
  });

  test("有理式の変換", () => {
    expect(simplifyLaTeX("x^2x^5")).toBe("x^{7}");
    expect(simplifyLaTeX("\\left(x^3\\right)^2")).toBe("x^{6}");
    expect(simplifyLaTeX("x^4\\left(x^3\\right)^2x^{-2}")).toBe("x^{8}");
    expect(simplifyLaTeX("\\frac{x^7}{2x^3}")).toBe("\\frac{x^{4}}{2}");
    expect(simplifyLaTeX("\\frac{x+x}{2x}")).toBe("1");
    expect(simplifyLaTeX("\\frac{x+x^2}{2x}")).toBe("\\frac{1+x}{2}");
    expect(simplifyLaTeX("\\frac{x+x^2}{x^2}")).toBe("\\frac{1+x}{x}");
    expect(simplifyLaTeX("\\frac{6x+4x^2}{2x}")).toBe("3+2x");
    expect(simplifyLaTeX("\\frac{x^7 \\cdot 6x}{3x^3 \\cdot x^2}")).toBe(
      "2x^{3}"
    );
    expect(simplifyLaTeX("\\frac{x-x+x+x}{2x^2\\cdot 3}")).toBe(
      "\\frac{1}{3x}"
    );
    expect(simplifyLaTeX("\\frac{\\frac{x^2}{2}}{x^3}")).toBe("\\frac{1}{2x}");
    expect(simplifyLaTeX("\\frac{\\frac{x^2}{2}}{x^3}x")).toBe("\\frac{1}{2}");
    expect(simplifyLaTeX("\\frac{x^2}{2}+x^2")).toBe("\\frac{3x^{2}}{2}");
  });

  test("一般の変数名", () => {
    expect(simplifyLaTeX("xxyyyzzzz+wwwww")).toBe("x^{2}y^{3}z^{4}+w^{5}");
    expect(simplifyLaTeX("\\frac{x^4y^7z}{yz^2}")).toBe("x^{4}y^{6}z^{-1}");
  });

  test("同じ式が複数回現れる場合", () => {
    expect(
      simplifyLaTeX("\\frac{1+\\sin x}{e^x\\left(1+\\sin x\\right)}")
    ).toBe("e^{-x}");
    expect(
      simplifyLaTeX(
        "\\frac{1+\\sin x}{\\left(\\pi ^x+\\sin x\\right)^x\\left(1+\\sin x\\right)}"
      )
    ).toBe("\\left(\\pi^{x}+\\sin x\\right)^{-x}");
    expect(
      simplifyLaTeX(
        "\\left(\\pi ^x+\\sin x\\right)\\left(\\pi ^x+\\sin x\\right)^3"
      )
    ).toBe("\\left(\\pi^{x}+\\sin x\\right)^{4}");
  });
});
