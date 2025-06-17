import { ASTNode } from "./ASTNode";

export function ASTToGLSL(node: ASTNode, knownVars: string[]): string {
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
      const left = ASTToGLSL(node.left, knownVars);
      const right = ASTToGLSL(node.right, knownVars);

      switch (node.op) {
        case "+":
          return `${left} + ${right}`;
        case "-":
          // 単項マイナスの場合
          if (right === "vec2(0.0, 0.0)") {
            return `-${left}`;
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
      const args = node.args.map((arg) => ASTToGLSL(arg, knownVars));
      const fnName = node.name.toLowerCase();

      switch (fnName) {
        case "sinh":
          return `csinh(${args[0]})`;
        case "cosh":
          return `ccosh(${args[0]})`;
        case "tanh":
          return `ctanh(${args[0]})`;
        case "sin":
          return `csin(${args[0]})`;
        case "cos":
          return `ccos(${args[0]})`;
        case "tan":
          return `ctan(${args[0]})`;
        case "exp":
          return `cexp(${args[0]})`;
        case "sqrt":
          return `csqrt(${args[0]})`;
        case "abs":
          return `cabs(${args[0]})`;
        default:
          throw new Error(`Unsupported function: ${fnName}`);
      }
  }
}
