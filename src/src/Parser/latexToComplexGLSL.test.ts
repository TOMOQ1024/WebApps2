import { latexToComplexGLSL } from "./latexToComplexGLSL";

describe("latexToComplexGLSL", () => {
  test("数値の変換", () => {
    expect(latexToComplexGLSL("1")).toBe("vec2(1.0, 0.0)");
    expect(latexToComplexGLSL("1.0")).toBe("vec2(1.0, 0.0)");
    expect(latexToComplexGLSL(".1")).toBe("vec2(0.1, 0.0)");
  });

  test("定数や変数の変換", () => {
    expect(latexToComplexGLSL("\\pi")).toBe("vec2(PI, 0.0)");
    expect(latexToComplexGLSL("e")).toBe("vec2(E, 0.0)");
    expect(latexToComplexGLSL("z")).toBe("z");
    expect(latexToComplexGLSL("c")).toBe("c");
    expect(latexToComplexGLSL("t")).toBe("t");
    expect(latexToComplexGLSL("i")).toBe("vec2(0.0, 1.0)");
  });

  test("基本的な演算の変換", () => {
    expect(latexToComplexGLSL("-z")).toBe("-z");
    expect(latexToComplexGLSL("z+1")).toBe("z + vec2(1.0, 0.0)");
    expect(latexToComplexGLSL("z-1")).toBe("z - vec2(1.0, 0.0)");
    expect(latexToComplexGLSL("z\\cdot 2")).toBe("cprod(z, vec2(2.0, 0.0))");
    expect(latexToComplexGLSL("z^22")).toBe(
      "cprod(cpow(z, vec2(2.0, 0.0)), vec2(2.0, 0.0))"
    );
    expect(latexToComplexGLSL("z^234")).toBe(
      "cprod(cpow(z, vec2(2.0, 0.0)), vec2(34.0, 0.0))"
    );
    expect(latexToComplexGLSL("zz")).toBe("cprod(z, z)");
    expect(latexToComplexGLSL("ziz")).toBe(
      "cprod(cprod(z, vec2(0.0, 1.0)), z)"
    );
    expect(latexToComplexGLSL("z^2")).toBe("cpow(z, vec2(2.0, 0.0))");
    expect(latexToComplexGLSL("iz^2")).toBe(
      "cprod(vec2(0.0, 1.0), cpow(z, vec2(2.0, 0.0)))"
    );
    expect(latexToComplexGLSL("2^{-2}")).toBe(
      "cpow(vec2(2.0, 0.0), -vec2(2.0, 0.0))"
    );
    expect(latexToComplexGLSL("\\left|z\\right|")).toBe("cabs(z)");
  });

  test("括弧の変換", () => {
    expect(latexToComplexGLSL("(z+1)^2")).toBe(
      "cpow(z + vec2(1.0, 0.0), vec2(2.0, 0.0))"
    );
    expect(latexToComplexGLSL("\\left|z\\right|")).toBe("cabs(z)");
  });

  test("空白を含む数式の変換", () => {
    expect(latexToComplexGLSL("z+\\ 1")).toBe("z + vec2(1.0, 0.0)");
  });

  test("基本的な分数の変換", () => {
    expect(latexToComplexGLSL("\\frac{1}{2}")).toBe(
      "cdiv(vec2(1.0, 0.0), vec2(2.0, 0.0))"
    );
  });

  test("変数を含む分数の変換", () => {
    expect(latexToComplexGLSL("z + \\frac{1}{z}")).toBe(
      "z + cdiv(vec2(1.0, 0.0), z)"
    );
  });

  test("複雑な式を含む分数の変換", () => {
    expect(latexToComplexGLSL("\\frac{z^2 + 1}{z - 1}")).toBe(
      "cdiv(cpow(z, vec2(2.0, 0.0)) + vec2(1.0, 0.0), z - vec2(1.0, 0.0))"
    );
  });

  test("operatorname形式の複素関数の変換", () => {
    expect(latexToComplexGLSL("\\operatorname{Re}z")).toBe("cre(z)");
    expect(latexToComplexGLSL("\\operatorname{Im}z")).toBe("cim(z)");
    expect(latexToComplexGLSL("\\operatorname{Log}z")).toBe("clog(z)");
    expect(latexToComplexGLSL("\\operatorname{Arg}z")).toBe("carg(z)");
    expect(latexToComplexGLSL("\\operatorname{conj}z")).toBe("cconj(z)");
    expect(latexToComplexGLSL("\\operatorname{Log}\\left(z\\right)")).toBe(
      "clog(z)"
    );
    expect(latexToComplexGLSL("\\operatorname{Re}\\left(z+1\\right)")).toBe(
      "cre(z + vec2(1.0, 0.0))"
    );
  });

  test("複雑な式の変換", () => {
    expect(latexToComplexGLSL("\\cos z-1")).toBe("ccos(z) - vec2(1.0, 0.0)");
    expect(latexToComplexGLSL("\\cos z^2-1")).toBe(
      "ccos(cpow(z, vec2(2.0, 0.0))) - vec2(1.0, 0.0)"
    );
    expect(latexToComplexGLSL("e^{i\\pi}")).toBe(
      "cpow(vec2(E, 0.0), cprod(vec2(0.0, 1.0), vec2(PI, 0.0)))"
    );
    expect(latexToComplexGLSL("\\frac{1}{z}2^3")).toBe(
      "cprod(cdiv(vec2(1.0, 0.0), z), cpow(vec2(2.0, 0.0), vec2(3.0, 0.0)))"
    );
    expect(latexToComplexGLSL("exp\\left(z\\right)")).toBe("cexp(z)");
    expect(latexToComplexGLSL("\\frac{\\sin(z)}{\\cos(z)}")).toBe(
      "cdiv(csin(z), ccos(z))"
    );
    expect(latexToComplexGLSL("z^2 + \\frac{1}{z}")).toBe(
      "cpow(z, vec2(2.0, 0.0)) + cdiv(vec2(1.0, 0.0), z)"
    );
    expect(latexToComplexGLSL("\\cos 2iz")).toBe(
      "ccos(cprod(cprod(vec2(2.0, 0.0), vec2(0.0, 1.0)), z))"
    );
    expect(latexToComplexGLSL("\\sin\\left(\\frac{z}{2}\\right)")).toBe(
      "csin(cdiv(z, vec2(2.0, 0.0)))"
    );
    expect(latexToComplexGLSL("2\\operatorname{Arg}z")).toBe(
      "cprod(vec2(2.0, 0.0), carg(z))"
    );
  });

  test("overline記法の複素共役変換", () => {
    expect(latexToComplexGLSL("\\overline{z}")).toBe("cconj(z)");
    expect(latexToComplexGLSL("\\overline{z+1}")).toBe(
      "cconj(z + vec2(1.0, 0.0))"
    );
    expect(latexToComplexGLSL("\\overline{z^2}")).toBe(
      "cconj(cpow(z, vec2(2.0, 0.0)))"
    );
    expect(latexToComplexGLSL("\\overline{\\frac{z}{z+1}}")).toBe(
      "cconj(cdiv(z, z + vec2(1.0, 0.0)))"
    );
  });

  test("エラーケース", () => {
    expect(() => latexToComplexGLSL(".")).toThrow();
    expect(() => latexToComplexGLSL("z^-z")).toThrow();
    expect(() => latexToComplexGLSL("\\sin")).toThrow();
    expect(() => latexToComplexGLSL("\\frac{1}")).toThrow();
    expect(() => latexToComplexGLSL("\\frac{1}{")).toThrow();
    expect(() => latexToComplexGLSL("\\frac{}{1}")).toThrow();
    expect(() => latexToComplexGLSL("\\operatorname{re}z")).toThrow();
    expect(() => latexToComplexGLSL("\\operatorname{im}z")).toThrow();
    expect(() => latexToComplexGLSL("\\operatorname{log}z")).toThrow();
    expect(() => latexToComplexGLSL("\\operatorname{arg}z")).toThrow();
  });
});
