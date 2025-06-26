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

  function parseFunction(cmdFromFactor?: string): ASTNode {
    let name = "";
    if (cmdFromFactor) {
      let cmd = cmdFromFactor;
      if (knownFuncs.includes(cmd)) {
        name = cmd;
      } else {
        throw new Error(`Unknown function: ${cmd}`);
      }
      skipWhitespace();
      // 括弧の処理
      let hasLeft = false;
      if (peek() === "\\") {
        const afterFunc = parseCommand();
        if (afterFunc === "left") {
          hasLeft = true;
          skipWhitespace();
          if (peek() !== "(") {
            throw new Error("Expected ( after \\left");
          }
          advance(); // '('
        } else {
          // left以外が来た場合は'('の省略とみなしてそのまま引数パースへ
          // 何もしない
        }
      } else if (peek() === "(") {
        advance(); // '('
      }
      skipWhitespace();
      // 引数のパース
      const args: ASTNode[] = [];
      if (peek() !== ")" && peek() !== "") {
        args.push(parseExpression());
      }
      if (hasLeft) {
        skipWhitespace();
        if (peek() === "\\") {
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
        } else {
          throw new Error("Expected closing parenthesis");
        }
        // ここで余計な括弧消費を防ぐ
        skipWhitespace();
        if (peek() === ")") {
          // すでに括弧を消費しているのでadvanceしない
          return { type: "function", name, args };
        }
      } else if (peek() === ")") {
        advance();
      }
      if (args.length === 0) {
        throw new Error(`Function ${name} requires an argument`);
      }
      return { type: "function", name, args };
    }
    throw new Error("Invalid function parse");
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
        left: expr,
        right: { type: "number", value: 0 },
      };
    }

    let node: ASTNode | null = null;
    if (char.match(/[0-9.]/)) {
      node = parseNumber();
    } else if (char === "\\") {
      let cmdStart = pos;
      let tempCmd = parseCommand();
      pos = cmdStart; // 位置を戻す
      if (knownFuncs.includes(tempCmd)) {
        node = parseFunction(tempCmd);
      } else {
        // 定数やfrac, left等の処理
        const constCmd = parseCommand();
        if (constCmd === "pi") {
          node = { type: "symbol", name: constCmd };
        } else if (constCmd === "frac") {
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
          node = {
            type: "operator",
            op: "/",
            left: numerator,
            right: denominator,
          };
        } else if (constCmd === "operatorname") {
          skipWhitespace();
          if (peek() !== "{")
            throw new Error("Expected { after \\operatorname");
          advance(); // '{'
          let operatorName = "";
          while (peek() !== "}") {
            if (peek() === "")
              throw new Error("Expected } after operator name");
            operatorName += advance();
          }
          advance(); // '}'
          // 関数名が既知の関数リストに含まれているか確認
          if (knownFuncs.includes(operatorName)) {
            // 引数を確認
            skipWhitespace();

            // 括弧がある場合は通常の関数として処理
            if (
              peek() === "(" ||
              (peek() === "\\" && latex.slice(pos + 1, pos + 5) === "left")
            ) {
              node = parseFunction(operatorName);
            } else {
              // 括弧がない場合でも、関数として処理し次の要素を引数とする
              skipWhitespace();
              // 次の要素をパースして引数とする
              const arg = parseFactor();
              node = { type: "function", name: operatorName, args: [arg] };
            }
          } else {
            throw new Error(`Unknown operator: ${operatorName}`);
          }
        } else if (constCmd === "overline") {
          skipWhitespace();
          if (peek() !== "{") throw new Error("Expected { after \\overline");
          advance(); // '{'
          const expr = parseExpression();
          skipWhitespace();
          if (peek() !== "}")
            throw new Error("Expected } after overline argument");
          advance(); // '}'
          // overlineを複素共役として処理
          node = { type: "function", name: "conj", args: [expr] };
        } else if (constCmd === "left") {
          skipWhitespace();
          if (peek() === "|") {
            // \left| ... \right| の絶対値記号の処理
            advance(); // '|'
            const expr = parseExpression();
            skipWhitespace();
            if (peek() === "\\") {
              const rightCmd = parseCommand();
              if (rightCmd === "right") {
                skipWhitespace();
                if (peek() === "|") {
                  advance(); // '|'
                  // abs関数のASTノードを生成
                  node = { type: "function", name: "abs", args: [expr] };
                } else {
                  throw new Error("Expected | after \\right");
                }
              } else {
                throw new Error(`Expected \\right, got \\${rightCmd}`);
              }
            } else {
              throw new Error("Expected \\right|");
            }
          } else if (peek() === "(") {
            // 通常の括弧の処理
            advance(); // '('
            const expr = parseExpression();
            skipWhitespace();
            if (peek() === "\\") {
              const rightCmd = parseCommand();
              if (rightCmd === "right") {
                advance(); // ')'
                node = expr;
              } else {
                throw new Error(`Expected \\right, got \\${rightCmd}`);
              }
            } else if (peek() === ")") {
              throw new Error("Expected \\right, got )");
            } else {
              throw new Error("Expected closing parenthesis");
            }
          } else {
            throw new Error("Expected ( or | after \\left");
          }
        } else {
          throw new Error(`Unknown command: \\${constCmd}`);
        }
      }
    } else if (char.match(/[a-zA-Z]/)) {
      // ここで関数名の先読み
      for (const func of knownFuncs) {
        if (latex.slice(pos, pos + func.length) === func) {
          pos += func.length;
          node = parseFunction(func);
          break;
        }
      }
      if (!node) {
        node = parseSymbol();
      }
    } else if (char === "(") {
      advance();
      const expr = parseExpression();
      skipWhitespace();
      if (peek() === ")") {
        advance();
        node = expr;
      } else {
        throw new Error("Expected closing parenthesis");
      }
    } else {
      throw new Error(`Unexpected character: ${char} at position ${pos}`);
    }

    return node;
  }

  function parsePower(): ASTNode {
    let left = parseFactor();
    skipWhitespace();

    while (peek() === "^") {
      advance();
      skipWhitespace();
      let right;
      if (peek() === "{") {
        advance(); // '{'
        right = parseExpression();
        if (peek() !== "}") {
          throw new Error("Expected } after exponent");
        }
        advance(); // '}'
      } else {
        // 指数部をパース
        // 単項マイナスが来た場合の特別な処理
        if (peek() === "-") {
          advance(); // '-' を消費
          skipWhitespace();
          // マイナスの後に何もない、または適切な項がない場合はエラー
          if (
            peek() === "" ||
            peek() === ")" ||
            peek() === "}" ||
            peek() === "^" ||
            peek() === "+" ||
            peek() === "-" ||
            peek() === "*" ||
            peek() === "/"
          ) {
            throw new Error(
              "Incomplete expression: expected operand after '-'"
            );
          }
          // 指数部で変数（z, c, t など）が直接来る場合もエラーとして扱う
          // 例: z^-z のケース
          if (peek().match(/[a-zA-Z]/)) {
            // 一時的に先読みして、これが単一の変数かどうかチェック
            let tempPos = pos;
            let varName = "";
            while (latex[tempPos] && latex[tempPos].match(/[a-zA-Z]/)) {
              varName += latex[tempPos];
              tempPos++;
            }
            // 既知の変数名の場合はエラー（指数部で-変数は数学的に不適切）
            const knownVars = ["z", "c", "t", "i", "e"];
            if (knownVars.includes(varName)) {
              throw new Error(
                "Incomplete expression: expected operand after '-'"
              );
            }
          }
          // 正常な場合は単項マイナスとして処理
          let factor = parseFactor();
          right = {
            type: "operator" as const,
            op: "-",
            left: factor,
            right: { type: "number" as const, value: 0 },
          };
        } else {
          right = parseFactor();
        }
      }
      left = { type: "operator", op: "^", left, right };
    }

    return left;
  }

  function parseTerm(): ASTNode {
    let left = parsePower();
    skipWhitespace();

    // 明示的な乗算・除算
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

    // 暗黙の乗算（数値・シンボル・関数が連続する場合）
    while (
      peek() !== ")" &&
      peek() !== "" &&
      peek() !== "}" &&
      peek() !== "+" &&
      peek() !== "-" &&
      peek() !== "*" &&
      peek() !== "/" &&
      peek() !== "^" &&
      (peek().match(/[0-9.]/) ||
        peek().match(/[a-zA-Z]/) ||
        (peek() === "\\" &&
          (() => {
            let save = pos;
            advance();
            let cmd = "";
            while (peek().match(/[a-zA-Z]/)) cmd += advance();
            pos = save;
            return (
              knownFuncs.includes(cmd) ||
              cmd === "operatorname" ||
              cmd === "overline" ||
              cmd === "left" ||
              cmd === "pi"
            );
          })()))
    ) {
      let right = parsePower();
      left = { type: "operator", op: "*", left: left, right };
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
