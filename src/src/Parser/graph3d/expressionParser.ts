/**
 * Graph 3D 用の式パーサー
 * - z=f(x,y) 形式: "z=\sin(x)\cos(y)" → { expression: "\sin(x)\cos(y)" }
 * - z=f(x,y) 形式: "z=x^2+y^2" → { expression: "x^2+y^2" }
 */

export interface Graph3DExpressionResult {
  expression: string;
}

/**
 * z=f(x,y) 形式の式をパースする
 * 対応形式:
 * - z=...
 * - z = ... (スペースあり)
 */
export function parseGraph3DExpression(
  latex: string,
): Graph3DExpressionResult | null {
  // z= または z = のパターン（スペースの有無に対応）
  const match = latex.match(/^z\s*=\s*(.+)$/);
  if (match) {
    const [, expression] = match;
    return { expression: expression.trim() };
  }

  return null;
}

/**
 * 式が z=f(x,y) 形式かどうかを判定する
 */
export function isGraph3DExpression(latex: string): boolean {
  return parseGraph3DExpression(latex) !== null;
}
