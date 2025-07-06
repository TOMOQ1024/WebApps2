import { ASTNode } from "../ASTNode";
import { SimplifyOptions } from "./simplifyLaTeX";
import { isZero } from "./helpers";
import { flattenAddition } from "./flattenAddition";
import { groupLikeTerms } from "./groupLikeTerms";
import { buildAddition } from "./buildAddition";
import { extractCoefficient } from "./extractCoefficient";

// ASTノードを文字列化（比較用）
function astToString(node: ASTNode): string {
  if (node.type === "number") {
    return node.value.toString();
  } else if (node.type === "symbol") {
    return node.name;
  } else if (node.type === "operator") {
    return `(${astToString(node.left)}${node.op}${astToString(node.right)})`;
  } else if (node.type === "function") {
    return `${node.name}(${node.args.map(astToString).join(",")})`;
  }
  return "";
}

// 加算の簡約化
export function simplifyAddition(
  left: ASTNode,
  right: ASTNode,
  options?: SimplifyOptions
): ASTNode {
  // 0 + a → a, a + 0 → a
  if (isZero(left)) return right;
  if (isZero(right)) return left;

  // 加算項を平坦化
  let terms = flattenAddition(left, right);

  // 分配法則を適用
  terms = applyDistributiveLaw(terms);

  // 同類項をまとめる
  const grouped = groupLikeTerms(terms);

  // 結果を構築
  let result = buildAddition(grouped, options);

  // 共通因子を括り出す
  result = factorizeCommonFactors(result);

  return result;
}

// 分配法則を適用（数値係数のみ）
function applyDistributiveLaw(terms: ASTNode[]): ASTNode[] {
  const result: ASTNode[] = [];

  for (const term of terms) {
    if (
      term.type === "operator" &&
      term.op === "*" &&
      term.left.type === "number" &&
      term.right.type === "operator" &&
      term.right.op === "+"
    ) {
      // 9(π^x + sin x) → 9π^x + 9sin x
      const coefficient = term.left.value;
      if (Number.isInteger(coefficient) && Math.abs(coefficient) <= 100) {
        const innerTerms = flattenAddition(term.right.left, term.right.right);

        for (const innerTerm of innerTerms) {
          result.push({
            type: "operator",
            op: "*",
            left: { type: "number", value: coefficient },
            right: innerTerm,
          });
        }
      } else {
        result.push(term);
      }
    } else if (
      term.type === "operator" &&
      term.op === "*" &&
      term.left.type === "operator" &&
      term.left.op === "+" &&
      term.right.type === "operator" &&
      (term.right.op === "+" || term.right.type !== "operator")
    ) {
      // (A+B)(C+D) → AC + AD + BC + BD の展開
      // ただし、C や D が他の項として既に存在する場合は展開を避ける
      const rightTerms =
        term.right.op === "+"
          ? flattenAddition(term.right.left, term.right.right)
          : [term.right];

      // 他の項をチェックして、rightTerms のいずれかが既に存在するかを確認
      const hasConflictingTerms = rightTerms.some((rightTerm) =>
        terms.some((otherTerm) => {
          if (otherTerm === term) return false; // 同じ項は除外
          return astToString(rightTerm) === astToString(otherTerm);
        })
      );

      if (!hasConflictingTerms) {
        // 安全に展開できる場合のみ実行
        const leftTerms = flattenAddition(term.left.left, term.left.right);

        for (const leftTerm of leftTerms) {
          for (const rightTerm of rightTerms) {
            result.push({
              type: "operator",
              op: "*",
              left: leftTerm,
              right: rightTerm,
            });
          }
        }
      } else {
        // 展開を避けて元の形を保持
        result.push(term);
      }
    } else {
      result.push(term);
    }
  }

  return result;
}

// 共通因子を括り出す
function factorizeCommonFactors(node: ASTNode): ASTNode {
  if (node.type !== "operator" || node.op !== "+") {
    return node;
  }

  // 加算項を平坦化
  const terms = flattenAddition(node.left, node.right);

  // 各項の係数を抽出
  const coefficientsAndBases = terms.map((term) => extractCoefficient(term));

  // 定数項でない項のみを対象とする（従来の処理）
  const nonConstantTerms = coefficientsAndBases.filter(
    ({ base }) => !(base.type === "number" && base.value === 1)
  );

  // 定数項を抽出
  const constantTerms = coefficientsAndBases.filter(
    ({ base }) => base.type === "number" && base.value === 1
  );

  if (nonConstantTerms.length < 2) {
    // 非定数項が2つ未満の場合は因数分解しない
    return node;
  }

  // 非定数項の係数から最大公約数を求める
  const coefficients = nonConstantTerms.map((cb) => cb.coefficient);
  const gcd = findGCD(coefficients);

  if (gcd > 1) {
    // 共通因子がある場合、括り出す
    const factorizedTerms = nonConstantTerms.map(({ coefficient, base }) => {
      const newCoefficient = coefficient / gcd;
      if (newCoefficient === 1) {
        return base;
      } else {
        return {
          type: "operator" as const,
          op: "*" as const,
          left: { type: "number" as const, value: newCoefficient },
          right: base,
        };
      }
    });

    // 括り出した項を加算で結合
    const factorizedSum = factorizedTerms.reduce((a, b) => ({
      type: "operator" as const,
      op: "+" as const,
      left: a,
      right: b,
    }));

    // 共通因子を掛ける
    const factorizedPart = {
      type: "operator" as const,
      op: "*" as const,
      left: { type: "number" as const, value: gcd },
      right: factorizedSum,
    };

    // 定数項がある場合は加算
    if (constantTerms.length > 0) {
      const constantSum = constantTerms.reduce(
        (sum, { coefficient }) => sum + coefficient,
        0
      );
      if (constantSum !== 0) {
        return {
          type: "operator" as const,
          op: "+" as const,
          left: factorizedPart,
          right: { type: "number" as const, value: constantSum },
        };
      }
    }

    return factorizedPart;
  }

  return node;
}

// 最大公約数を求める
function findGCD(numbers: number[]): number {
  if (numbers.length === 0) return 1;
  if (numbers.length === 1) return Math.abs(numbers[0]);

  let result = Math.abs(numbers[0]);
  for (let i = 1; i < numbers.length; i++) {
    result = gcd(result, Math.abs(numbers[i]));
    if (result === 1) break;
  }
  return result;
}

// 2つの数の最大公約数
function gcd(a: number, b: number): number {
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

// 複合式の分配法則を試行
function tryFactorizeCompoundExpressions(terms: ASTNode[]): ASTNode[] {
  const result = [...terms];

  // 複合式とその構成要素を特定
  const compoundExpressions = new Map<
    string,
    { coefficient: number; base: ASTNode; index: number }
  >();
  const componentTerms = new Map<
    string,
    { coefficient: number; base: ASTNode; index: number }[]
  >();

  // 第1段階：複合式を特定
  for (let i = 0; i < result.length; i++) {
    const term = result[i];
    const { coefficient, base } = extractCoefficient(term);

    if (base.type === "operator" && base.op === "+") {
      const baseKey = getCompoundKey(base);
      compoundExpressions.set(baseKey, { coefficient, base, index: i });

      // 複合式の構成要素を記録
      const components = flattenAddition(base.left, base.right);
      for (const component of components) {
        const componentKey = getCompoundKey(component);
        if (!componentTerms.has(componentKey)) {
          componentTerms.set(componentKey, []);
        }
      }
    }
  }

  // 第2段階：個別の項が複合式の構成要素かチェック
  for (let i = 0; i < result.length; i++) {
    const term = result[i];
    const { coefficient, base } = extractCoefficient(term);

    // 複合式でない項のみチェック
    if (!(base.type === "operator" && base.op === "+")) {
      const baseKey = getCompoundKey(base);

      // この項が複合式の構成要素かチェック
      for (const [compoundKey, compoundInfo] of compoundExpressions) {
        if (
          compoundInfo.base.type === "operator" &&
          compoundInfo.base.op === "+"
        ) {
          const compoundComponents = flattenAddition(
            compoundInfo.base.left,
            compoundInfo.base.right
          );
          const isComponent = compoundComponents.some(
            (component) => getCompoundKey(component) === baseKey
          );

          if (isComponent) {
            // 複合式の係数に加算
            compoundInfo.coefficient += coefficient;
            // この項を削除対象としてマーク
            result[i] = null as any;
            break;
          }
        }
      }
    }
  }

  // 更新された複合式で元の複合式を置き換え
  for (const [compoundKey, compoundInfo] of compoundExpressions) {
    if (compoundInfo.coefficient !== 0) {
      if (compoundInfo.coefficient === 1) {
        result[compoundInfo.index] = compoundInfo.base;
      } else {
        result[compoundInfo.index] = {
          type: "operator",
          op: "*",
          left: { type: "number", value: compoundInfo.coefficient },
          right: compoundInfo.base,
        };
      }
    } else {
      result[compoundInfo.index] = null as any;
    }
  }

  // null項目を除去
  return result.filter((term) => term !== null);
}

// 複合式のキーを生成
function getCompoundKey(node: ASTNode): string {
  if (node.type === "number") {
    return `num:${node.value}`;
  } else if (node.type === "symbol") {
    return `sym:${node.name}`;
  } else if (node.type === "operator") {
    const leftKey = getCompoundKey(node.left);
    const rightKey = getCompoundKey(node.right);

    // 加算は可換なので順序を正規化
    if (node.op === "+") {
      const [first, second] = [leftKey, rightKey].sort();
      return `op:+:${first}:${second}`;
    }

    return `op:${node.op}:${leftKey}:${rightKey}`;
  } else if (node.type === "function") {
    const argsKey = node.args.map(getCompoundKey).join(",");
    return `func:${node.name}:${argsKey}`;
  }

  return `unknown:${JSON.stringify(node)}`;
}
