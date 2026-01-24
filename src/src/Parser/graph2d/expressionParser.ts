/**
 * Graph 2D 用の式パーサー
 * - 関数定義: "f\\left(x\\right)=x^2" → { name: "f", args: ["x"], body: "x^2" }
 * - 不等式: "x^2+y^2<1" → { expression: "x^2+y^2-(1)", isLessThan: true }
 */

export interface FunctionDef {
  name: string;
  args: string[];
  body: string;
}

export interface InequalityResult {
  left: string;
  right: string;
  isLessThan: boolean;
}

/**
 * 関数定義をパースする
 * 対応形式:
 * - f\left(x\right)=...
 * - f\left(x,y\right)=...
 * - f(x)=...
 * - f(x,y)=...
 */
export function parseFunctionDef(latex: string): FunctionDef | null {
  // \left( \right) 形式
  const leftRightMatch = latex.match(
    /^([a-zA-Z])\\left\(([^)]+)\\right\)=(.+)$/
  );
  if (leftRightMatch) {
    const [, name, argsStr, body] = leftRightMatch;
    const args = argsStr.split(",").map((a) => a.trim());
    return { name, args, body };
  }

  // 通常の括弧形式
  const simpleMatch = latex.match(/^([a-zA-Z])\(([^)]+)\)=(.+)$/);
  if (simpleMatch) {
    const [, name, argsStr, body] = simpleMatch;
    const args = argsStr.split(",").map((a) => a.trim());
    return { name, args, body };
  }

  return null;
}

/**
 * 不等式をパースする
 * 対応形式:
 * - x^2+y^2<1
 * - x^2+y^2>1
 * - x^2+y^2\le 1
 * - x^2+y^2\ge 1
 * - x^2+y^2\leq 1
 * - x^2+y^2\geq 1
 */
export function parseInequality(latex: string): InequalityResult | null {
  // 不等号のパターン
  // \le, \ge などは後ろにアルファベットが続かないことを確認（\left, \geq などとの誤マッチを防ぐ）
  const inequalityPatterns = [
    { pattern: /^(.+)<(.+)$/, isLessThan: true },
    { pattern: /^(.+)>(.+)$/, isLessThan: false },
    { pattern: /^(.+)\\leq\s*(.+)$/, isLessThan: true },
    { pattern: /^(.+)\\geq\s*(.+)$/, isLessThan: false },
    { pattern: /^(.+)\\le(?![a-zA-Z])\s*(.+)$/, isLessThan: true },
    { pattern: /^(.+)\\ge(?![a-zA-Z])\s*(.+)$/, isLessThan: false },
  ];

  for (const { pattern, isLessThan } of inequalityPatterns) {
    const match = latex.match(pattern);
    if (match) {
      const [, left, right] = match;
      return { left: left.trim(), right: right.trim(), isLessThan };
    }
  }

  return null;
}

/**
 * 式が関数定義かどうかを判定する
 */
export function isFunctionDefinition(latex: string): boolean {
  return parseFunctionDef(latex) !== null;
}

/**
 * 式が不等式かどうかを判定する
 */
export function isInequality(latex: string): boolean {
  return parseInequality(latex) !== null;
}
