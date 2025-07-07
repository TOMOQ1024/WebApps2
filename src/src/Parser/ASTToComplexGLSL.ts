import { ASTNode } from "./ASTNode";

export function ASTToComplexGLSL(
  node: ASTNode,
  knownVars: string[],
  knownFuncs: string[]
): string {
  switch (node.type) {
    case "number":
      return `vec2(${
        node.value % 1 === 0 ? node.value.toFixed(1) : node.value
      }, 0.0)`;

    case "symbol":
      switch (node.name) {
        case "i":
          return "vec2(0.0, 1.0)";
        case "pi":
          return "vec2(PI, 0.0)";
        case "e":
          return "vec2(E, 0.0)";
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
        if (knownFuncs.indexOf(fnName) !== -1) {
          const arg = ASTToComplexGLSL(node.right, knownVars, knownFuncs);
          switch (fnName) {
            case "sinh":
              return `csinh(${arg})`;
            case "cosh":
              return `ccosh(${arg})`;
            case "tanh":
              return `ctanh(${arg})`;
            case "coth":
              return `ccoth(${arg})`;
            case "sech":
              return `csech(${arg})`;
            case "csch":
              return `ccsch(${arg})`;
            case "sin":
              return `csin(${arg})`;
            case "cos":
              return `ccos(${arg})`;
            case "tan":
              return `ctan(${arg})`;
            case "cot":
              return `ccot(${arg})`;
            case "sec":
              return `csec(${arg})`;
            case "csc":
              return `ccsc(${arg})`;
            case "exp":
              return `cexp(${arg})`;
            case "abs":
              return `cabs(${arg})`;
            case "Re":
              return `cre(${arg})`;
            case "Im":
              return `cim(${arg})`;
            case "conj":
              return `cconj(${arg})`;
            case "Arg":
              return `carg(${arg})`;
            case "Log":
              return `clog(${arg})`;
            default:
              throw new Error(`Unsupported function: ${fnName}`);
          }
        }
      }

      const left = ASTToComplexGLSL(node.left, knownVars, knownFuncs);
      const right = ASTToComplexGLSL(node.right, knownVars, knownFuncs);

      switch (node.op) {
        case "+":
          return `${left} + ${right}`;
        case "-":
          // 単項マイナスの場合
          if (left === "vec2(0.0, 0.0)") {
            return `-${right}`;
          }
          return `${left} - ${right}`;
        case "*":
          return `cprod(${left}, ${right})`;
        case "/":
          return `cdiv(${left}, ${right})`;
        case "^":
          return `cpow(${left}, ${right})`;
        default:
          throw new Error(`Unsupported operator: ${node.op}`);
      }

    case "function":
      const args = node.args.map((arg) =>
        ASTToComplexGLSL(arg, knownVars, knownFuncs)
      );
      const fnName = node.name;

      switch (fnName) {
        case "sinh":
          if (args.length === 0)
            throw new Error(`Function ${fnName} requires an argument`);
          return `csinh(${args[0]})`;
        case "cosh":
          if (args.length === 0)
            throw new Error(`Function ${fnName} requires an argument`);
          return `ccosh(${args[0]})`;
        case "tanh":
          if (args.length === 0)
            throw new Error(`Function ${fnName} requires an argument`);
          return `ctanh(${args[0]})`;
        case "coth":
          if (args.length === 0)
            throw new Error(`Function ${fnName} requires an argument`);
          return `ccoth(${args[0]})`;
        case "sech":
          if (args.length === 0)
            throw new Error(`Function ${fnName} requires an argument`);
          return `csech(${args[0]})`;
        case "csch":
          if (args.length === 0)
            throw new Error(`Function ${fnName} requires an argument`);
          return `ccsch(${args[0]})`;
        case "sin":
          if (args.length === 0)
            throw new Error(`Function ${fnName} requires an argument`);
          return `csin(${args[0]})`;
        case "cos":
          if (args.length === 0)
            throw new Error(`Function ${fnName} requires an argument`);
          return `ccos(${args[0]})`;
        case "tan":
          if (args.length === 0)
            throw new Error(`Function ${fnName} requires an argument`);
          return `ctan(${args[0]})`;
        case "cot":
          if (args.length === 0)
            throw new Error(`Function ${fnName} requires an argument`);
          return `ccot(${args[0]})`;
        case "sec":
          if (args.length === 0)
            throw new Error(`Function ${fnName} requires an argument`);
          return `csec(${args[0]})`;
        case "csc":
          if (args.length === 0)
            throw new Error(`Function ${fnName} requires an argument`);
          return `ccsc(${args[0]})`;
        case "exp":
          if (args.length === 0)
            throw new Error(`Function ${fnName} requires an argument`);
          return `cexp(${args[0]})`;
        case "abs":
          if (args.length === 0)
            throw new Error(`Function ${fnName} requires an argument`);
          return `cabs(${args[0]})`;
        case "re":
          throw new Error("re is not supported. Use Re instead.");
        case "Re":
          if (args.length === 0)
            throw new Error(`Function ${fnName} requires an argument`);
          return `cre(${args[0]})`;
        case "im":
          throw new Error("im is not supported. Use Im instead.");
        case "Im":
          if (args.length === 0)
            throw new Error(`Function ${fnName} requires an argument`);
          return `cim(${args[0]})`;
        case "conj":
          if (args.length === 0)
            throw new Error(`Function ${fnName} requires an argument`);
          return `cconj(${args[0]})`;
        case "arg":
          throw new Error("arg is not supported. Use Arg instead.");
        case "Arg":
          if (args.length === 0)
            throw new Error(`Function ${fnName} requires an argument`);
          return `carg(${args[0]})`;
        case "log":
          throw new Error("log is not supported. Use Log instead.");
        case "Log":
          if (args.length === 0)
            throw new Error(`Function ${fnName} requires an argument`);
          return `clog(${args[0]})`;
        default:
          throw new Error(`Unsupported function: ${fnName}`);
      }
  }
}
