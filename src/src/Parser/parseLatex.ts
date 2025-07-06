import { ASTNode } from "./ASTNode";

export function parseLatex(latex: string, knownFuncs: string[]): ASTNode {
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

  function parseNumber(): ASTNode {
    let num = "";
    if (peek() === ".") {
      num += advance();
    }
    while (peek().match(/[0-9.]/)) {
      num += advance();
    }
    const value = parseFloat(num);
    if (isNaN(value)) {
      throw new Error(`Invalid number: ${num}`);
    }
    return { type: "number", value };
  }

  function parseSymbol(): ASTNode {
    // 1文字だけsymbolノードとして返す
    if (!peek().match(/[a-zA-Z]/)) throw new Error("Expected symbol");
    return { type: "symbol", name: advance() };
  }

  function parseFunction(name: string): ASTNode {
    skipWhitespace();

    // 関数の引数をパース
    const args: ASTNode[] = [];

    // 括弧がある場合
    if (peek() === "(") {
      advance(); // '('
      if (peek() !== ")") {
        args.push(parseExpression());
      }
      if (peek() === ")") {
        advance(); // ')'
      }
    }
    // 括弧がない場合は次の単純な要素を引数とする
    else {
      if (peek().match(/[a-zA-Z]/)) {
        args.push(parseSymbol());
      } else if (peek().match(/[0-9.]/)) {
        args.push(parseNumber());
      } else if (peek() === "\\") {
        const savePos = pos;
        const cmd = parseCommand();
        if (cmd === "pi") {
          args.push({ type: "symbol", name: "pi" });
        } else {
          pos = savePos; // 位置を戻す
        }
      }
    }

    return { type: "function", name, args };
  }

  function parseLeftRight(): ASTNode {
    // \left を消費済み
    skipWhitespace();
    if (peek() !== "(") throw new Error("Expected ( after \\left");
    advance(); // '('

    const expr = parseExpression();

    skipWhitespace();
    if (peek() === "\\" && latex.slice(pos, pos + 6) === "\\right") {
      advance(); // '\'
      advance();
      advance();
      advance();
      advance();
      advance();
      advance(); // 'right'
      if (peek() === ")") {
        advance(); // ')'
      }
    }

    return expr;
  }

  function parseFactor(): ASTNode {
    skipWhitespace();
    const char = peek();

    // 単項マイナスの処理
    if (char === "-") {
      advance();
      const expr = parseFactor();
      return {
        type: "operator",
        op: "-",
        left: { type: "number", value: 0 },
        right: expr,
      };
    }

    if (char.match(/[0-9.]/)) {
      return parseNumber();
    }

    if (char === "\\") {
      const savePos = pos;
      const cmd = parseCommand();

      if (knownFuncs.includes(cmd)) {
        return parseFunction(cmd);
      } else if (cmd === "pi") {
        return { type: "symbol", name: "pi" };
      } else if (cmd === "frac") {
        skipWhitespace();
        if (peek() !== "{") throw new Error("Expected { after \\frac");
        advance(); // '{'
        const numerator = parseExpression();
        skipWhitespace();
        if (peek() !== "}") throw new Error("Expected } after numerator");
        advance(); // '}'
        skipWhitespace();
        if (peek() !== "{") throw new Error("Expected { before denominator");
        advance(); // '{'
        const denominator = parseExpression();
        skipWhitespace();
        if (peek() !== "}") throw new Error("Expected } after denominator");
        advance(); // '}'
        return {
          type: "operator",
          op: "/",
          left: numerator,
          right: denominator,
        };
      } else if (cmd === "left") {
        return parseLeftRight();
      } else {
        throw new Error(`Unknown command: \\${cmd}`);
      }
    }

    if (char.match(/[a-zA-Z]/)) {
      // 関数名かどうかチェック
      for (const func of knownFuncs) {
        if (latex.slice(pos, pos + func.length) === func) {
          pos += func.length;
          return parseFunction(func);
        }
      }
      return parseSymbol();
    }

    if (char === "(") {
      advance();
      const expr = parseExpression();
      skipWhitespace();
      if (peek() === ")") {
        advance();
      }
      return expr;
    }

    if (char === "{") {
      advance();
      const expr = parseExpression();
      skipWhitespace();
      if (peek() === "}") {
        advance();
      }
      return expr;
    }

    if (char === ")" || char === "}" || char === "") {
      throw new Error(`Unexpected end of input at position ${pos}`);
    }

    throw new Error(`Unexpected character: ${char} at position ${pos}`);
  }

  function parsePower(): ASTNode {
    let left = parseFactor();
    skipWhitespace();

    if (peek() === "^") {
      advance();
      skipWhitespace();
      let right: ASTNode;

      if (peek() === "{") {
        advance(); // '{'
        right = parseExpression();
        if (peek() !== "}") {
          throw new Error("Expected } after exponent");
        }
        advance(); // '}'
      } else {
        right = parseFactor();
      }

      left = { type: "operator", op: "^", left, right };
    }

    return left;
  }

  function parseTerm(): ASTNode {
    let left = parsePower();
    skipWhitespace();

    // 明示的な乗算・除算
    while (peek().match(/[*\/]/)) {
      const op = advance();
      skipWhitespace();
      const right = parsePower();
      left = { type: "operator", op, left, right };
      skipWhitespace();
    }

    // \cdot の処理
    while (peek() === "\\" && latex.slice(pos + 1, pos + 5) === "cdot") {
      advance(); // '\'
      advance();
      advance();
      advance();
      advance(); // 'cdot'
      skipWhitespace();
      const right = parsePower();
      left = { type: "operator", op: "*", left, right };
      skipWhitespace();
    }

    // 暗黙の乗算（隣接）
    while (
      peek() !== ")" &&
      peek() !== "" &&
      peek() !== "}" &&
      peek() !== "+" &&
      peek() !== "-" &&
      peek() !== "*" &&
      peek() !== "/" &&
      peek() !== "^" &&
      (peek().match(/[0-9a-zA-Z]/) || peek() === "\\" || peek() === "(")
    ) {
      const savePos = pos;
      try {
        const right = parsePower();
        left = { type: "operator", op: "*", left, right };
        skipWhitespace();
      } catch (e) {
        pos = savePos;
        break;
      }
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
      skipWhitespace();
    }

    return left;
  }

  try {
    skipWhitespace();
    if (pos >= latex.length) {
      return { type: "number", value: 0 };
    }
    const result = parseExpression();
    return result;
  } catch (error) {
    console.error(
      "Parse error:",
      (error as Error).message,
      "at position",
      pos,
      "in:",
      latex
    );
    return { type: "number", value: 0 };
  }
}
