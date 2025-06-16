import { latexToGLSL } from "./latexToGLSL";

describe("latexToGLSL", () => {
  test("数値の変換", () => {
    expect(latexToGLSL("1")).toBe("vec2(1.0, 0.0)");
    expect(latexToGLSL("1.0")).toBe("vec2(1.0, 0.0)");
    expect(latexToGLSL(".1")).toBe("vec2(0.1, 0.0)");
  });

  test("定数や変数の変換", () => {
    expect(latexToGLSL("z")).toBe("z");
    expect(latexToGLSL("c")).toBe("c");
    expect(latexToGLSL("t")).toBe("t");
    expect(latexToGLSL("i")).toBe("vec2(0.0, 1.0)");
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

  test("三角関数を含む分数の変換", () => {
    expect(latexToGLSL("\\frac{\\sin(z)}{\\cos(z)}")).toBe(
      "cdiv(csin(z), ccos(z))"
    );
  });

  test("基本的な演算の変換", () => {
    expect(latexToGLSL("z + 1")).toBe("z + vec2(1.0, 0.0)");
    expect(latexToGLSL("z - 1")).toBe("z - vec2(1.0, 0.0)");
    expect(latexToGLSL("z * 2")).toBe("cprod(z, vec2(2.0, 0.0))");
  });

  test("複雑な式の変換", () => {
    expect(latexToGLSL("z^2 + \\frac{1}{z}")).toBe(
      "cpow(z, vec2(2.0, 0.0)) + cdiv(vec2(1.0, 0.0), z)"
    );
  });

  test("エラーケース", () => {
    expect(() => latexToGLSL("\\frac{1}")).toThrow();
    expect(() => latexToGLSL("\\frac{1}{")).toThrow();
    expect(() => latexToGLSL("\\frac{}{1}")).toThrow();
  });
});
