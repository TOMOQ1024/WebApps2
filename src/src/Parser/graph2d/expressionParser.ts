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

export interface ChainedInequalityResult {
  parts: string[]; // ["x-1", "y", "x+1"]
  operators: ("<" | ">")[]; // ['<', '<']
}

export interface ConstantDef {
  name: string; // "a", "r" など
  value: string; // LaTeX形式の値 "2", "\\frac{1}{2}" など
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
  // 非貪欲マッチ (.+?) を使用して最初の \right) までマッチ
  const leftRightMatch = latex.match(
    /^([a-zA-Z])\\left\((.+?)\\right\)=(.+)$/
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
 * 定数定義をパースする
 * 対応形式:
 * - a=2
 * - r=0.5
 * - k=\frac{1}{2}
 * ※ 括弧を含む場合は関数定義として扱う
 */
export function parseConstantDef(latex: string): ConstantDef | null {
  // 形式: 単一の英字 = 値
  // 関数定義（括弧を含む）は除外
  const match = latex.match(/^([a-zA-Z])=(.+)$/);
  if (match) {
    const name = match[1];
    const value = match[2];
    // 値に括弧が含まれていないことを確認（関数定義との区別）
    // ただし \left( や \frac{}{} などは許可
    if (!value.match(/^[^\\]*\(/)) {
      return { name, value };
    }
  }
  return null;
}

/**
 * 式が定数定義かどうかを判定する
 */
export function isConstantDefinition(latex: string): boolean {
  return parseConstantDef(latex) !== null;
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

/**
 * 連鎖不等式をパースする
 * 対応形式:
 * - x-1<y<x+1
 * - 0<x^2+y^2<1
 * - a<b<c<d (複数の不等号)
 * - 混在: a<b>c も対応
 */
export function parseChainedInequality(
  latex: string
): ChainedInequalityResult | null {
  // 不等号のトークン化パターン
  // \leq, \geq, \le, \ge, <, > を認識
  // 注意: \left や \ge + アルファベット を誤マッチしないようにする
  const inequalityTokens = [
    { regex: /\\leq/g, op: "<" as const },
    { regex: /\\geq/g, op: ">" as const },
    { regex: /\\le(?![a-zA-Z])/g, op: "<" as const },
    { regex: /\\ge(?![a-zA-Z])/g, op: ">" as const },
    { regex: /(?<!\\left|\\right)</g, op: "<" as const },
    { regex: /(?<!\\left|\\right)>/g, op: ">" as const },
  ];

  // すべての不等号の位置と種類を収集
  interface InequalityMatch {
    index: number;
    length: number;
    op: "<" | ">";
  }
  const matches: InequalityMatch[] = [];

  for (const { regex, op } of inequalityTokens) {
    const re = new RegExp(regex.source, "g");
    let match = re.exec(latex);
    while (match !== null) {
      // 既に同じ位置にマッチがあれば、より長いものを優先
      const matchIndex = match.index;
      const matchLength = match[0].length;
      const existing = matches.find((m) => m.index === matchIndex);
      if (existing) {
        if (matchLength > existing.length) {
          existing.length = matchLength;
          existing.op = op;
        }
      } else {
        matches.push({ index: matchIndex, length: matchLength, op });
      }
      match = re.exec(latex);
    }
  }

  // 不等号がない場合は null
  if (matches.length === 0) {
    return null;
  }

  // 位置でソート
  matches.sort((a, b) => a.index - b.index);

  // 部分と演算子を抽出
  const parts: string[] = [];
  const operators: ("<" | ">")[] = [];
  let lastEnd = 0;

  for (const m of matches) {
    const part = latex.slice(lastEnd, m.index).trim();
    if (part) {
      parts.push(part);
    }
    operators.push(m.op);
    lastEnd = m.index + m.length;
  }

  // 最後の部分
  const lastPart = latex.slice(lastEnd).trim();
  if (lastPart) {
    parts.push(lastPart);
  }

  // parts.length は operators.length + 1 であるべき
  if (parts.length !== operators.length + 1) {
    return null;
  }

  return { parts, operators };
}

/**
 * 式が数値式かどうかを判定する（不等号を含まない、関数定義でも定数定義でもない）
 */
export function isNumericExpression(latex: string): boolean {
  if (!latex.trim()) return false;
  if (isFunctionDefinition(latex)) return false;
  if (isConstantDefinition(latex)) return false;
  return parseChainedInequality(latex) === null;
}
