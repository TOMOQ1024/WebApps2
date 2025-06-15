// 抽象構文木の型定義
type ASTNode =
  | { type: "number"; value: number }
  | { type: "symbol"; name: string }
  | { type: "operator"; op: string; left: ASTNode; right: ASTNode }
  | { type: "function"; name: string; args: ASTNode[] };

export function latexToGLSL(latex: string): string {
  try {
    // LaTeXをパースして抽象構文木に変換
    console.log(`latex: ${latex}`);
    const ast = parseLatex(latex);
    console.log(`ast: ${ast}`);

    // 抽象構文木をGLSLコードに変換
    let glslCode = convertToGLSL(ast);
    console.log(`glslCode: ${glslCode}`);

    return glslCode;
  } catch (error) {
    console.error("Failed to parse LaTeX:", error);
    throw error;
  }
}

function parseLatex(latex: string): ASTNode {
  let pos = 0;

  function peek(): string {
    return latex[pos] || "";
  }

  function advance(): string {
    return latex[pos++] || "";
  }

  function skipWhitespace() {
    while (peek().match(/\s/)) advance();
  }

  function parseCommand(): string {
    let cmd = "";
    advance(); // '\'
    while (peek().match(/[a-zA-Z]/)) {
      cmd += advance();
    }
    return cmd;
  }

  function parseNumber(): ASTNode {
    let num = "";
    while (peek().match(/[0-9.]/)) {
      num += advance();
    }
    return { type: "number", value: parseFloat(num) };
  }

  function parseSymbol(): ASTNode {
    let name = "";
    while (peek().match(/[a-zA-Z]/)) {
      name += advance();
    }
    return { type: "symbol", name };
  }

  function parseFunction(): ASTNode {
    let name: string;
    if (peek() === "\\") {
      name = parseCommand();
    } else {
      const symbol = parseSymbol();
      if (symbol.type !== "symbol") {
        throw new Error("Expected function name");
      }
      name = symbol.name;
    }

    skipWhitespace();

    // 括弧の処理
    let hasLeft = false;
    if (peek() === "\\") {
      const cmd = parseCommand();
      if (cmd === "left") {
        hasLeft = true;
        skipWhitespace();
        if (peek() !== "(") {
          throw new Error("Expected ( after \\left");
        }
        advance(); // '('
      } else {
        throw new Error(`Expected \\left, got \\${cmd}`);
      }
    } else if (peek() === "(") {
      advance(); // '('
    } else {
      throw new Error("Expected ( or \\left(");
    }

    const args: ASTNode[] = [];
    while (true) {
      if (peek() === "\\") {
        const cmd = parseCommand();
        if (hasLeft && cmd === "right") {
          skipWhitespace();
          if (peek() !== ")") {
            throw new Error("Expected ) after \\right");
          }
          advance(); // ')'
          break;
        } else if (!hasLeft && cmd === "right") {
          throw new Error("Unexpected \\right without \\left");
        } else {
          throw new Error(
            `Expected ${hasLeft ? "\\right" : ")"}, got \\${cmd}`
          );
        }
      } else if (peek() === ")") {
        if (hasLeft) {
          throw new Error("Expected \\right, got )");
        }
        advance();
        break;
      } else if (peek() === "") {
        throw new Error(
          "Unexpected end of input while parsing function arguments"
        );
      }
      args.push(parseExpression());
      if (peek() === ",") {
        advance();
        skipWhitespace();
      }
    }

    // 空の引数リストの場合、デフォルトの引数を設定
    if (args.length === 0) {
      args.push({ type: "symbol", name: "z" });
    }

    return { type: "function", name, args };
  }

  function parseFactor(): ASTNode {
    skipWhitespace();
    const char = peek();

    if (char.match(/[0-9]/)) {
      return parseNumber();
    }

    if (char === "\\") {
      const cmd = parseCommand();
      if (cmd === "left") {
        advance(); // '('
        const expr = parseExpression();
        skipWhitespace();
        if (peek() === "\\") {
          const rightCmd = parseCommand();
          if (rightCmd === "right") {
            advance(); // ')'
            return expr;
          } else {
            throw new Error(`Expected \\right, got \\${rightCmd}`);
          }
        } else if (peek() === ")") {
          throw new Error("Expected \\right, got )");
        }
        throw new Error("Expected closing parenthesis");
      } else {
        // 単項関数の場合
        skipWhitespace();
        const arg = parseFactor();
        return { type: "function", name: cmd, args: [arg] };
      }
    }

    if (char.match(/[a-zA-Z]/)) {
      const next = latex[pos + 1];
      if (next === "(" || next === "\\") {
        return parseFunction();
      }
      return parseSymbol();
    }

    if (char === "(") {
      advance();
      const expr = parseExpression();
      skipWhitespace();
      if (peek() === ")") {
        advance();
        return expr;
      }
      throw new Error("Expected closing parenthesis");
    }

    throw new Error(`Unexpected character: ${char} at position ${pos}`);
  }

  function parsePower(): ASTNode {
    let left = parseFactor();
    skipWhitespace();

    while (peek() === "^") {
      advance();
      skipWhitespace();
      const right = parseFactor();
      left = { type: "operator", op: "^", left, right };
    }

    return left;
  }

  function parseTerm(): ASTNode {
    let left = parsePower();
    skipWhitespace();

    while (peek().match(/[*\/]/)) {
      const op = advance();
      skipWhitespace();
      const right = parsePower();
      left = { type: "operator", op, left, right };
    }

    return left;
  }

  function parseExpression(): ASTNode {
    let left = parseTerm();
    skipWhitespace();

    while (peek().match(/[+-]/)) {
      const op = advance();
      skipWhitespace();
      const right = parseTerm();
      left = { type: "operator", op, left, right };
    }

    return left;
  }

  return parseExpression();
}

function convertToGLSL(node: ASTNode): string {
  switch (node.type) {
    case "number":
      return `vec2(${node.value}, 0.0)`;

    case "symbol":
      switch (node.name) {
        case "z":
          return "z";
        case "c":
          return "c";
        case "t":
          return "t";
        case "i":
          return "vec2(0.0, 1.0)";
        default:
          return node.name;
      }

    case "operator":
      const left = convertToGLSL(node.left);
      const right = convertToGLSL(node.right);

      switch (node.op) {
        case "+":
          return `${left} + ${right}`;
        case "-":
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
      const args = node.args.map(convertToGLSL);
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
