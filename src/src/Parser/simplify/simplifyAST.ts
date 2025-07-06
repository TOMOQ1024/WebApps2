import { ASTNode } from "../ASTNode";
import { SimplifyOptions } from "./simplifyLaTeX";
import { normalizeAST } from "./normalizeAST";
import { simplifyNormalizedAST } from "./simplifyNormalizedAST";
import { denormalizeAST } from "./denormalizeAST";
import { flattenAddition } from "./flattenAddition";
import { extractCoefficient } from "./extractCoefficient";
import { groupLikeTerms } from "./groupLikeTerms";

// 深い比較でASTノードが等しいかチェック
function deepEqual(a: ASTNode, b: ASTNode): boolean {
  if (a.type !== b.type) return false;

  if (a.type === "number") {
    return a.value === (b as any).value;
  } else if (a.type === "symbol") {
    return a.name === (b as any).name;
  } else if (a.type === "operator") {
    const bOp = b as any;
    return (
      a.op === bOp.op &&
      deepEqual(a.left, bOp.left) &&
      deepEqual(a.right, bOp.right)
    );
  } else if (a.type === "function") {
    const bFunc = b as any;
    return (
      a.name === bFunc.name &&
      a.args.length === bFunc.args.length &&
      a.args.every((arg, i) => deepEqual(arg, bFunc.args[i]))
    );
  }

  return false;
}

// ASTノードの正規化されたキーを生成
function getNodeKey(node: ASTNode): string {
  if (node.type === "number") {
    return `num:${node.value}`;
  } else if (node.type === "symbol") {
    return `sym:${node.name}`;
  } else if (node.type === "operator") {
    return `op:${node.op}:${getNodeKey(node.left)}:${getNodeKey(node.right)}`;
  } else if (node.type === "function") {
    return `func:${node.name}:${node.args.map(getNodeKey).join(":")}`;
  }
  return "unknown";
}

// 複合式内の項を抽出
function extractTermsFromCompound(node: ASTNode): ASTNode[] {
  if (node.type === "operator" && node.op === "+") {
    return flattenAddition(node.left, node.right);
  }
  return [node];
}

// 加算の直接的な簡単化
function simplifyAdditionDirect(node: ASTNode): ASTNode {
  if (node.type !== "operator" || node.op !== "+") {
    return node;
  }

  // 加算項を平坦化
  const terms = flattenAddition(node.left, node.right);

  // 同類項をグループ化
  const groups = groupLikeTerms(terms);

  // 結果を構築
  const resultTerms: ASTNode[] = [];

  for (const { coefficient, base } of groups.values()) {
    if (coefficient === 0) continue;

    if (base.type === "number" && base.value === 1) {
      // 定数項
      resultTerms.push({ type: "number", value: coefficient });
    } else if (coefficient === 1) {
      resultTerms.push(base);
    } else if (coefficient === -1) {
      resultTerms.push({
        type: "operator",
        op: "*",
        left: { type: "number", value: -1 },
        right: base,
      });
    } else {
      resultTerms.push({
        type: "operator",
        op: "*",
        left: { type: "number", value: coefficient },
        right: base,
      });
    }
  }

  if (resultTerms.length === 0) {
    return { type: "number", value: 0 };
  } else if (resultTerms.length === 1) {
    return resultTerms[0];
  } else {
    return resultTerms.reduce((a, b) => ({
      type: "operator",
      op: "+",
      left: a,
      right: b,
    }));
  }
}

// ASTの簡約化
export function simplifyAST(node: ASTNode, options?: SimplifyOptions): ASTNode {
  // 子ノードを先に簡約化
  let simplified = node;

  if (node.type === "operator") {
    const leftSimplified = simplifyAST(node.left, options);
    const rightSimplified = simplifyAST(node.right, options);

    simplified = {
      ...node,
      left: leftSimplified,
      right: rightSimplified,
    };
  } else if (node.type === "function") {
    simplified = {
      ...node,
      args: node.args.map((arg) => simplifyAST(arg, options)),
    };
  }

  // 通常の簡約化プロセス
  const normalized = normalizeAST(simplified);
  const normalizedSimplified = simplifyNormalizedAST(normalized, options);
  return denormalizeAST(normalizedSimplified, options);
}
