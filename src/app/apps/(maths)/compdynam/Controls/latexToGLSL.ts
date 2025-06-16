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
    // '\ ' も空白としてスキップ
    while (peek() === "\\" && latex[pos + 1] === " ") {
      advance(); // '\'
      advance(); // ' '
      while (peek().match(/\s/)) advance();
    }
  }

  function parseCommand(): string {
    let cmd = "";
    advance(); // '\'
    while (peek().match(/[a-zA-Z]/)) {
      cmd += advance();
    }
    return cmd;
  }

  function parseFraction(): ASTNode {
    advance(); // '\'
    const cmd = parseCommand();
    if (cmd !== "frac") {
      throw new Error(`Expected \\frac, got \\${cmd}`);
    }

    skipWhitespace();
    const numerator = parseExpression();
    skipWhitespace();
    const denominator = parseExpression();

    return {
      type: "operator",
      op: "/",
      left: numerator,
      right: denominator,
    };
  }

  function parseNumber(): ASTNode {
    let num = "";
    if (peek() === ".") {
      num += advance();
    }
    while (peek().match(/[0-9.]/)) {
      num += advance();
    }
    return { type: "number", value: parseFloat(num) };
  }

  function parseSymbol(): ASTNode {
    // 1文字ずつsymbolノードに分割し、暗黙の乗算でつなぐ
    let nodes: ASTNode[] = [];
    while (peek().match(/[a-zA-Z]/)) {
      nodes.push({ type: "symbol", name: advance() });
    }
    if (nodes.length === 0) throw new Error("Expected symbol");
    let node = nodes[0];
    for (let i = 1; i < nodes.length; i++) {
      node = { type: "operator", op: "*", left: node, right: nodes[i] };
    }
    return node;
  }

  // 左結合でcprodを作るヘルパー
  function leftAssocCprod(factors: ASTNode[]): ASTNode {
    if (factors.length === 0) throw new Error("No factors");
    let node = factors[0];
    for (let i = 1; i < factors.length; i++) {
      node = { type: "operator", op: "*", left: node, right: factors[i] };
    }
    return node;
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
    }

    // 引数のパース
    const args: ASTNode[] = [];
    if (
      peek() !== ")" &&
      peek() !== "" &&
      !(peek() === "\\" && latex.slice(pos + 1, pos + 6) === "right")
    ) {
      skipWhitespace();
      // 連続するfactorを配列で集めて左結合
      const factors = [];
      while (peek().match(/[a-zA-Z0-9.\\(]/)) {
        factors.push(parseFactor());
        skipWhitespace();
      }
      if (factors.length > 0) {
        const argNode = leftAssocCprod(factors);
        args.push(argNode);
      }
    }

    if (hasLeft && peek() === "\\") {
      const rightCmd = parseCommand();
      if (rightCmd === "right") {
        skipWhitespace();
        if (peek() !== ")") {
          throw new Error("Expected ) after \\right");
        }
        advance(); // ')'
      } else {
        throw new Error(`Expected \\right, got \\${rightCmd}`);
      }
    } else if (peek() === ")") {
      advance();
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

    if (char.match(/[0-9.]/)) {
      return parseNumber();
    }

    if (char === "\\") {
      const cmd = parseCommand();
      if (cmd === "frac") {
        skipWhitespace();
        if (peek() !== "{") {
          throw new Error("Expected { after \\frac");
        }
        advance(); // '{'
        const numerator = parseExpression();
        skipWhitespace();
        if (peek() !== "}") {
          throw new Error("Expected } after numerator");
        }
        advance(); // '}'
        skipWhitespace();
        if (peek() !== "{") {
          throw new Error("Expected { before denominator");
        }
        advance(); // '{'
        const denominator = parseExpression();
        skipWhitespace();
        if (peek() !== "}") {
          throw new Error("Expected } after denominator");
        }
        advance(); // '}'
        return {
          type: "operator",
          op: "/",
          left: numerator,
          right: denominator,
        };
      }
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
      }
      // それ以外のコマンドは関数としてparseFunctionに渡す
      pos -= cmd.length + 1; // コマンドの先頭に戻す
      return parseFunction();
    }

    if (char.match(/[a-zA-Z]/)) {
      // 次の文字が ( か \ かどうかを判定。ただし、\cdot など演算子の場合はparseFunctionを呼ばない
      const next = latex[pos + 1];
      if (next === "(") {
        return parseFunction();
      }
      if (next === "\\") {
        // \cdot, \times など演算子の場合はparseFunctionを呼ばずsymbolのみ返す
        const opCandidate = latex.slice(pos + 2, pos + 6);
        if (opCandidate === "cdot" || opCandidate === "times") {
          return parseSymbol();
        } else {
          return parseFunction();
        }
      }
      const symbol = parseSymbol();
      // 次の文字が数値の場合、暗黙的な乗算を追加
      if (peek().match(/[0-9.]/)) {
        return {
          type: "operator",
          op: "*",
          left: symbol,
          right: parseNumber(),
        };
      }
      return symbol;
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

    while (
      peek().match(/[*\/]/) ||
      (peek() === "\\" && latex.slice(pos + 1, pos + 5) === "cdot")
    ) {
      let op: string;
      if (peek() === "*") {
        op = advance();
      } else if (peek() === "/") {
        op = advance();
      } else if (peek() === "\\" && latex.slice(pos + 1, pos + 5) === "cdot") {
        advance(); // '\'
        for (let i = 0; i < 4; i++) advance(); // 'cdot'
        op = "*";
      } else {
        throw new Error("Unknown operator in parseTerm");
      }
      skipWhitespace();
      const right = parsePower();
      left = { type: "operator", op, left, right };
      skipWhitespace();
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
      return `vec2(${
        node.value % 1 === 0 ? node.value.toFixed(1) : node.value
      }, 0.0)`;

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

// テストコードを追加
export function testLatexToGLSL() {
  const testCases = [
    {
      input: "\\frac{1}{2}",
      expected: "cdiv(vec2(1.0, 0.0), vec2(2.0, 0.0))",
    },
    {
      input: "z + \\frac{1}{z}",
      expected: "z + cdiv(vec2(1.0, 0.0), z)",
    },
    {
      input: "\\frac{z^2 + 1}{z - 1}",
      expected: "cdiv(cprod(z, z) + vec2(1.0, 0.0), z - vec2(1.0, 0.0))",
    },
    {
      input: "\\frac{\\sin(z)}{\\cos(z)}",
      expected: "cdiv(csin(z), ccos(z))",
    },
  ];

  console.log("Running LaTeX to GLSL conversion tests...");
  testCases.forEach((testCase, index) => {
    try {
      const result = latexToGLSL(testCase.input);
      if (result === testCase.expected) {
        console.log(`✅ Test ${index + 1} passed`);
      } else {
        console.error(`❌ Test ${index + 1} failed`);
        console.error(`Input: ${testCase.input}`);
        console.error(`Expected: ${testCase.expected}`);
        console.error(`Got: ${result}`);
      }
    } catch (error) {
      console.error(`❌ Test ${index + 1} failed with error:`, error);
    }
  });
}
