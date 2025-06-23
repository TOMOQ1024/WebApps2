import { latexToGLSL } from "./latexToGLSL";

describe("latexToGLSL", () => {
  test("数値の変換", () => {
    expect(latexToGLSL("1")).toBe("vec2(1.0, 0.0)");
    expect(latexToGLSL("1.0")).toBe("vec2(1.0, 0.0)");
    expect(latexToGLSL(".1")).toBe("vec2(0.1, 0.0)");
  });

  test("定数や変数の変換", () => {
    expect(latexToGLSL("\\pi")).toBe("vec2(PI, 0.0)");
    expect(latexToGLSL("e")).toBe("vec2(E, 0.0)");
    expect(latexToGLSL("z")).toBe("z");
    expect(latexToGLSL("c")).toBe("c");
    expect(latexToGLSL("t")).toBe("t");
    expect(latexToGLSL("i")).toBe("vec2(0.0, 1.0)");
  });

  test("基本的な演算の変換", () => {
    expect(latexToGLSL("-z")).toBe("-z");
    expect(latexToGLSL("z+1")).toBe("z + vec2(1.0, 0.0)");
    expect(latexToGLSL("z-1")).toBe("z - vec2(1.0, 0.0)");
    expect(latexToGLSL("z\\cdot 2")).toBe("cprod(z, vec2(2.0, 0.0))");
    expect(latexToGLSL("zz")).toBe("cprod(z, z)");
    expect(latexToGLSL("ziz")).toBe("cprod(cprod(z, vec2(0.0, 1.0)), z)");
    expect(latexToGLSL("z^2")).toBe("cpow(z, vec2(2.0, 0.0))");
    expect(latexToGLSL("2^{-2}")).toBe("cpow(vec2(2.0, 0.0), -vec2(2.0, 0.0))");
  });

  test("括弧の変換", () => {
    expect(latexToGLSL("(z+1)^2")).toBe(
      "cpow(z + vec2(1.0, 0.0), vec2(2.0, 0.0))"
    );
    expect(latexToGLSL("\\left|z\\right|")).toBe("cabs(z)");
  });

  test("空白を含む数式の変換", () => {
    expect(latexToGLSL("z+\\ 1")).toBe("z + vec2(1.0, 0.0)");
  });

  test("基本的な分数の変換", () => {
    expect(latexToGLSL("\\frac{1}{2}")).toBe(
      "cdiv(vec2(1.0, 0.0), vec2(2.0, 0.0))"
    );
  });

  test("変数を含む分数の変換", () => {
    expect(latexToGLSL("z + \\frac{1}{z}")).toBe("z + cdiv(vec2(1.0, 0.0), z)");
  });

  test("複雑な式を含む分数の変換", () => {
    expect(latexToGLSL("\\frac{z^2 + 1}{z - 1}")).toBe(
      "cdiv(cpow(z, vec2(2.0, 0.0)) + vec2(1.0, 0.0), z - vec2(1.0, 0.0))"
    );
  });

  test("複雑な式の変換", () => {
    expect(latexToGLSL("exp\\left(z\\right)")).toBe("cexp(z)");
    expect(latexToGLSL("\\frac{\\sin(z)}{\\cos(z)}")).toBe(
      "cdiv(csin(z), ccos(z))"
    );
    expect(latexToGLSL("z^2 + \\frac{1}{z}")).toBe(
      "cpow(z, vec2(2.0, 0.0)) + cdiv(vec2(1.0, 0.0), z)"
    );
    expect(latexToGLSL("\\cos 2iz")).toBe(
      "ccos(cprod(vec2(2.0, 0.0), cprod(vec2(0.0, 1.0), z)))"
    );
    expect(latexToGLSL("\\sin\\left(\\frac{z}{2}\\right)")).toBe(
      "csin(cdiv(z, vec2(2.0, 0.0)))"
    );
  });

  test("複素関数の変換", () => {
    expect(latexToGLSL("Re\\left(z\\right)")).toBe("cre(z)");
    expect(latexToGLSL("Im\\left(z\\right)")).toBe("cim(z)");
    expect(latexToGLSL("conj\\left(z\\right)")).toBe("cconj(z)");
    expect(latexToGLSL("Arg\\left(z\\right)")).toBe("carg(z)");
    expect(latexToGLSL("Log\\left(z\\right)")).toBe("clog(z)");
    expect(latexToGLSL("\\left|z\\right|")).toBe("cabs(z)");
    // 小文字版もテスト
    expect(latexToGLSL("re\\left(z\\right)")).toBe("cre(z)");
    expect(latexToGLSL("im\\left(z\\right)")).toBe("cim(z)");
    expect(latexToGLSL("log\\left(z\\right)")).toBe("clog(z)");
    expect(latexToGLSL("arg\\left(z\\right)")).toBe("carg(z)");
  });

  test("operatorname形式の複素関数の変換", () => {
    expect(latexToGLSL("\\operatorname{Re}z")).toBe("cre(z)");
    expect(latexToGLSL("\\operatorname{Im}z")).toBe("cim(z)");
    expect(latexToGLSL("\\operatorname{Log}z")).toBe("clog(z)");
    expect(latexToGLSL("\\operatorname{Arg}z")).toBe("carg(z)");
    expect(latexToGLSL("\\operatorname{conj}z")).toBe("cconj(z)");
    expect(latexToGLSL("\\operatorname{exp}z")).toBe("cexp(z)");
    expect(latexToGLSL("\\operatorname{sin}z")).toBe("csin(z)");
    expect(latexToGLSL("\\operatorname{cos}z")).toBe("ccos(z)");
    expect(latexToGLSL("\\operatorname{Log}\\left(z\\right)")).toBe("clog(z)");
    expect(latexToGLSL("\\operatorname{Re}\\left(z+1\\right)")).toBe(
      "cre(z + vec2(1.0, 0.0))"
    );
    // 小文字版もテスト
    expect(latexToGLSL("\\operatorname{re}z")).toBe("cre(z)");
    expect(latexToGLSL("\\operatorname{im}z")).toBe("cim(z)");
    expect(latexToGLSL("\\operatorname{log}z")).toBe("clog(z)");
    expect(latexToGLSL("\\operatorname{arg}z")).toBe("carg(z)");
  });

  test("エラーケース", () => {
    expect(() => latexToGLSL(".")).toThrow();
    expect(() => latexToGLSL("\\sin")).toThrow();
    expect(() => latexToGLSL("\\frac{1}")).toThrow();
    expect(() => latexToGLSL("\\frac{1}{")).toThrow();
    expect(() => latexToGLSL("\\frac{}{1}")).toThrow();
  });
});
