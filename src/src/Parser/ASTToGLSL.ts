import { ASTNode } from "./ASTNode";

export function ASTToGLSL(
  node: ASTNode,
  knownFuncs: string[] = [],
  knownVars: string[] = []
): string {
  switch (node.type) {
    case "number":
      return `${node.value % 1 === 0 ? node.value.toFixed(1) : node.value}`;

    case "symbol":
      switch (node.name) {
        case "pi":
          return "PI";
        case "e":
          return "E";
        default:
          if (knownVars.includes(node.name)) {
            return node.name;
          }
          throw new Error(`Unsupported symbol: ${node.name}`);
      }

    case "operator":
      // 特別な場合：関数名 * 引数 → 関数呼び出し
      if (node.op === "*" && node.left.type === "symbol") {
        const fnName = node.left.name;
        // 関数名リストに含まれているかチェック（関数名のリストを追加）
        if (knownFuncs.includes(fnName)) {
          const arg = ASTToGLSL(node.right, knownFuncs, knownVars);
          switch (fnName) {
            case "sinh":
              return `sinh(${arg})`;
            case "cosh":
              return `cosh(${arg})`;
            case "tanh":
              return `tanh(${arg})`;
            case "coth":
              return `coth(${arg})`;
            case "sech":
              return `sech(${arg})`;
            case "csch":
              return `csch(${arg})`;
            case "sin":
              return `sin(${arg})`;
            case "cos":
              return `cos(${arg})`;
            case "tan":
              return `tan(${arg})`;
            case "cot":
              return `cot(${arg})`;
            case "sec":
              return `sec(${arg})`;
            case "csc":
              return `csc(${arg})`;
            case "exp":
              return `exp(${arg})`;
            case "abs":
              return `abs(${arg})`;
            case "ln":
              return `ln(${arg})`;
            default:
              // ユーザー定義関数（1引数）のサポート
              return `${fnName}(${arg})`;
          }
        }
      }

      const left = ASTToGLSL(node.left, knownFuncs, knownVars);
      const right = ASTToGLSL(node.right, knownFuncs, knownVars);

      switch (node.op) {
        case "+":
          return `${left} + ${right}`;
        case "-":
          // 単項マイナスの場合
          if (right === "0") {
            return `-${left}`;
          }
          return `${left} - ${right}`;
        case "*":
          return `(${left}) * (${right})`;
        case "/":
          return `(${left}) / (${right})`;
        case "^":
          return `pow(${left}, ${right})`;
        default:
          throw new Error(`Unsupported operator: ${node.op}`);
      }

    case "function":
      const args = node.args.map((arg) =>
        ASTToGLSL(arg, knownFuncs, knownVars)
      );
      const fnName = node.name;

      switch (fnName) {
        case "sinh":
          if (args.length === 0)
            throw new Error(`Function ${fnName} requires an argument`);
          return `sinh(${args[0]})`;
        case "cosh":
          if (args.length === 0)
            throw new Error(`Function ${fnName} requires an argument`);
          return `cosh(${args[0]})`;
        case "tanh":
          if (args.length === 0)
            throw new Error(`Function ${fnName} requires an argument`);
          return `tanh(${args[0]})`;
        case "coth":
          if (args.length === 0)
            throw new Error(`Function ${fnName} requires an argument`);
          return `coth(${args[0]})`;
        case "sech":
          if (args.length === 0)
            throw new Error(`Function ${fnName} requires an argument`);
          return `sech(${args[0]})`;
        case "csch":
          if (args.length === 0)
            throw new Error(`Function ${fnName} requires an argument`);
          return `csch(${args[0]})`;
        case "sin":
          if (args.length === 0)
            throw new Error(`Function ${fnName} requires an argument`);
          return `sin(${args[0]})`;
        case "cos":
          if (args.length === 0)
            throw new Error(`Function ${fnName} requires an argument`);
          return `cos(${args[0]})`;
        case "tan":
          if (args.length === 0)
            throw new Error(`Function ${fnName} requires an argument`);
          return `tan(${args[0]})`;
        case "cot":
          if (args.length === 0)
            throw new Error(`Function ${fnName} requires an argument`);
          return `cot(${args[0]})`;
        case "sec":
          if (args.length === 0)
            throw new Error(`Function ${fnName} requires an argument`);
          return `sec(${args[0]})`;
        case "csc":
          if (args.length === 0)
            throw new Error(`Function ${fnName} requires an argument`);
          return `csc(${args[0]})`;
        case "exp":
          if (args.length === 0)
            throw new Error(`Function ${fnName} requires an argument`);
          return `exp(${args[0]})`;
        case "abs":
          if (args.length === 0)
            throw new Error(`Function ${fnName} requires an argument`);
          return `abs(${args[0]})`;
        case "log":
          throw new Error("log is not supported. Use Log instead.");
        case "ln":
          if (args.length === 0)
            throw new Error(`Function ${fnName} requires an argument`);
          return `ln(${args[0]})`;
        default:
          // ユーザー定義関数のサポート
          if (knownFuncs.includes(fnName)) {
            return `${fnName}(${args.join(", ")})`;
          }
          throw new Error(`Unsupported function: ${fnName}`);
      }
  }
}
