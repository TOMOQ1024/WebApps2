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
    // 括弧がない場合は次の要素から乗算項を構築する
    else {
      // 最初の因子をパース
      let arg = parsePower();

      // 暗黙の乗算を続けてパース（2iz のような）
      skipWhitespace();
      while (
        peek() !== ")" &&
        peek() !== "" &&
        peek() !== "}" &&
        peek() !== "+" &&
        peek() !== "-" &&
        peek() !== "*" &&
        peek() !== "/" &&
        peek() !== "^" &&
        !(peek() === "\\" && latex.slice(pos, pos + 6) === "\\right") &&
        (peek().match(/[0-9a-zA-Z]/) || peek() === "\\" || peek() === "(")
      ) {
        const savePos = pos;
        try {
          const right = parsePower();
          arg = { type: "operator", op: "*", left: arg, right };
          skipWhitespace();
        } catch (e) {
          pos = savePos;
          break;
        }
      }

      args.push(arg);
    }

    return { type: "function", name, args };
  }

  function parseLeftRight(): ASTNode {
    // \left を消費済み
    skipWhitespace();
    const delimiter = peek();

    if (delimiter === "|") {
      // \left| の場合は絶対値として処理
      advance(); // '|'

      // ネストしたleft/rightを追跡しながら内容を収集
      let content = "";
      let leftCount = 1; // 既に一つの\leftを処理済み

      while (pos < latex.length && leftCount > 0) {
        const char = peek();

        if (char === "\\" && latex.slice(pos, pos + 5) === "\\left") {
          leftCount++;
          content += latex.slice(pos, pos + 5);
          pos += 5;
        } else if (char === "\\" && latex.slice(pos, pos + 6) === "\\right") {
          leftCount--;
          if (leftCount === 0) {
            // 対応する\rightを見つけた
            pos += 6; // '\\right'をスキップ
            if (peek() === "|") {
              advance(); // '|'をスキップ
            }
            break;
          } else {
            content += latex.slice(pos, pos + 6);
            pos += 6;
          }
        } else {
          content += advance();
        }
      }

      if (leftCount > 0) {
        throw new Error("Unmatched \\left");
      }

      // 収集した内容を新しいパーサーインスタンスでパースして絶対値関数として返す
      const expr = parseLatex(content, knownFuncs);
      return { type: "function", name: "abs", args: [expr] };
    } else if (delimiter === "(") {
      advance(); // '('

      // ネストしたleft/rightを追跡しながら内容を収集
      let content = "";
      let leftCount = 1; // 既に一つの\leftを処理済み

      while (pos < latex.length && leftCount > 0) {
        const char = peek();

        if (char === "\\" && latex.slice(pos, pos + 5) === "\\left") {
          leftCount++;
          content += latex.slice(pos, pos + 5);
          pos += 5;
        } else if (char === "\\" && latex.slice(pos, pos + 6) === "\\right") {
          leftCount--;
          if (leftCount === 0) {
            // 対応する\rightを見つけた
            pos += 6; // '\\right'をスキップ
            if (peek() === ")") {
              advance(); // ')'をスキップ
            }
            break;
          } else {
            content += latex.slice(pos, pos + 6);
            pos += 6;
          }
        } else {
          content += advance();
        }
      }

      if (leftCount > 0) {
        throw new Error("Unmatched \\left");
      }

      // 収集した内容を新しいパーサーインスタンスでパース
      const expr = parseLatex(content, knownFuncs);
      return expr;
    } else {
      throw new Error("Expected ( after \\left");
    }
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
      } else if (knownFuncs.includes(cmd)) {
        return parseFunction(cmd);
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

        // デバッグ用ログ

        const denominator = parseExpression();

        skipWhitespace();
        if (peek() !== "}") {
          console.log(`Expected }, but found "${peek()}" at position ${pos}`);
          throw new Error("Expected } after denominator");
        }
        advance(); // '}'
        return {
          type: "operator",
          op: "/",
          left: numerator,
          right: denominator,
        };
      } else if (cmd === "left") {
        return parseLeftRight();
      } else if (cmd === "operatorname") {
        skipWhitespace();
        if (peek() !== "{") throw new Error("Expected { after \\operatorname");
        advance(); // '{'

        // operatorname内の関数名を取得
        let funcName = "";
        while (peek() !== "}" && pos < latex.length) {
          funcName += advance();
        }

        if (peek() !== "}") throw new Error("Expected } after function name");
        advance(); // '}'

        // operatorname内の関数名を検証
        const validOperatornames = ["Re", "Im", "Log", "Arg", "conj"];
        if (!validOperatornames.includes(funcName)) {
          throw new Error(`Unsupported operatorname: ${funcName}`);
        }

        return parseFunction(funcName);
      } else if (cmd === "overline") {
        skipWhitespace();
        if (peek() !== "{") throw new Error("Expected { after \\overline");
        advance(); // '{'

        const arg = parseExpression();

        if (peek() !== "}")
          throw new Error("Expected } after overline content");
        advance(); // '}'

        // overlineは複素共役として扱う
        return { type: "function", name: "conj", args: [arg] };
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
        // {}なしの指数は1文字または特定のシンボルのみ
        if (peek().match(/[a-zA-Z]/)) {
          right = parseSymbol();
        } else if (peek().match(/[0-9]/)) {
          // 数値の場合は1桁のみ
          const digit = advance();
          right = { type: "number", value: parseFloat(digit) };
        } else if (peek() === "\\") {
          const savePos = pos;
          const cmd = parseCommand();
          if (cmd === "pi") {
            right = { type: "symbol", name: "pi" };
          } else {
            pos = savePos;
            throw new Error("Invalid exponent");
          }
        } else {
          throw new Error("Expected exponent");
        }
      }

      left = { type: "operator", op: "^", left, right };
    }

    return left;
  }

  function parseTerm(): ASTNode {
    let left = parsePower();
    skipWhitespace();

    // 明示的な乗算・除算と\cdotの処理を統合
    while (true) {
      // 明示的な乗算・除算
      if (peek().match(/[*\/]/)) {
        const op = advance();
        skipWhitespace();
        const right = parsePower();
        left = { type: "operator", op, left, right };
        skipWhitespace();
        continue;
      }

      // \cdot の処理
      if (peek() === "\\" && latex.slice(pos + 1, pos + 5) === "cdot") {
        advance(); // '\'
        advance(); // 'c'
        advance(); // 'd'
        advance(); // 'o'
        advance(); // 't'
        skipWhitespace();
        const right = parsePower();
        left = { type: "operator", op: "*", left, right };
        skipWhitespace();
        continue;
      }

      // 暗黙の乗算（隣接）のチェック
      if (
        peek() !== ")" &&
        peek() !== "" &&
        peek() !== "}" &&
        peek() !== "+" &&
        peek() !== "-" &&
        peek() !== "*" &&
        peek() !== "/" &&
        peek() !== "^" &&
        !(peek() === "\\" && latex.slice(pos, pos + 6) === "\\right") && // \right で停止
        (peek().match(/[0-9a-zA-Z]/) || peek() === "\\" || peek() === "(")
      ) {
        const savePos = pos;
        try {
          const right = parsePower();
          left = { type: "operator", op: "*", left, right };
          skipWhitespace();
          continue;
        } catch (e) {
          pos = savePos;
          break;
        }
      }

      // いずれの条件にも当てはまらない場合はループを終了
      break;
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
    throw new Error(
      `Parse error: ${(error as Error).message} at position ${pos} in: ${latex}`
    );
  }
}
