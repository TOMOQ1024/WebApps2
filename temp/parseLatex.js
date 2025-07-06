"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseLatex = parseLatex;
function parseLatex(latex, knownFuncs) {
    let pos = 0;
    function peek() {
        return latex[pos] || "";
    }
    function advance() {
        return latex[pos++] || "";
    }
    function skipWhitespace() {
        while (peek().match(/\s/))
            advance();
        // '\ ' も空白としてスキップ
        while (peek() === "\\" && latex[pos + 1] === " ") {
            advance(); // '\'
            advance(); // ' '
            while (peek().match(/\s/))
                advance();
        }
    }
    function parseCommand() {
        let cmd = "";
        advance(); // '\'
        while (peek().match(/[a-zA-Z]/)) {
            cmd += advance();
        }
        return cmd;
    }
    function parseNumber() {
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
    function parseSymbol() {
        // 1文字だけsymbolノードとして返す
        if (!peek().match(/[a-zA-Z]/))
            throw new Error("Expected symbol");
        return { type: "symbol", name: advance() };
    }
    function parseFunction(cmdFromFactor) {
        let name = "";
        if (cmdFromFactor) {
            let cmd = cmdFromFactor;
            if (knownFuncs.includes(cmd)) {
                name = cmd;
            }
            else {
                throw new Error(`Unknown function: ${cmd}`);
            }
            skipWhitespace();
            // 括弧の処理
            let hasLeft = false;
            let hasParens = false;
            if (peek() === "\\") {
                let cmdStart = pos;
                const afterFunc = parseCommand();
                if (afterFunc === "left") {
                    hasLeft = true;
                    skipWhitespace();
                    if (peek() !== "(") {
                        throw new Error("Expected ( after \\left");
                    }
                    advance(); // '('
                    hasParens = true;
                }
                else {
                    // left以外が来た場合は位置を戻してそのまま引数パースへ
                    pos = cmdStart;
                }
            }
            else if (peek() === "(") {
                advance(); // '('
                hasParens = true;
            }
            skipWhitespace();
            // 引数のパース
            const args = [];
            if (peek() !== ")" && peek() !== "") {
                if (hasLeft || hasParens) {
                    const exprArg = parseExpression();
                    if (exprArg != null &&
                        !(exprArg.type === "number" &&
                            exprArg.value === 0 &&
                            (peek() === ")" || peek() === ""))) {
                        args.push(exprArg);
                    }
                    skipWhitespace();
                }
                else {
                    // 括弧がない場合は、シンボルまたは数値のみを許可
                    if (peek().match(/[a-zA-Z]/)) {
                        args.push(parseSymbol());
                    }
                    else if (peek().match(/[0-9.]/)) {
                        args.push(parseNumber());
                    }
                    else if (peek() === "\\") {
                        // \piのような記号の場合
                        let cmdStart = pos;
                        let cmd = parseCommand();
                        if (cmd === "pi") {
                            args.push({ type: "symbol", name: "pi" });
                        }
                        else {
                            pos = cmdStart; // 位置を戻す
                        }
                    }
                }
            }
            if (hasLeft) {
                if (peek() === "\\") {
                    const rightCmd = parseCommand();
                    if (rightCmd === "right") {
                        skipWhitespace();
                        if (peek() === ")") {
                            advance(); // ')'
                        }
                    }
                    else {
                        throw new Error(`Expected \\right, got \\${rightCmd}`);
                    }
                }
                else if (peek() === ")") {
                    advance();
                }
            }
            else if (hasParens && peek() === ")") {
                advance();
            }
            // 関数ノードを返す（引数がなくても）
            return { type: "function", name, args };
        }
        throw new Error("Invalid function parse");
    }
    function parseFactor() {
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
                right: expr || { type: "number", value: 0 },
            };
        }
        let node = null;
        if (char.match(/[0-9.]/)) {
            node = parseNumber();
        }
        else if (char === "\\") {
            let cmdStart = pos;
            let tempCmd = parseCommand();
            pos = cmdStart; // 位置を戻す
            if (knownFuncs.includes(tempCmd)) {
                node = parseFunction(tempCmd);
                if (node == null)
                    return null;
            }
            else {
                // 定数やfrac, left等の処理
                const constCmd = parseCommand();
                if (constCmd === "pi") {
                    node = { type: "symbol", name: constCmd };
                }
                else if (constCmd === "frac") {
                    skipWhitespace();
                    if (peek() !== "{")
                        throw new Error("Expected { after \\frac");
                    advance(); // '{'
                    const numerator = parseExpression();
                    skipWhitespace();
                    if (peek() !== "}")
                        throw new Error("Expected } after numerator");
                    advance(); // '}'
                    skipWhitespace();
                    if (peek() !== "{")
                        throw new Error("Expected { before denominator");
                    advance(); // '{'
                    const denominator = parseExpression();
                    skipWhitespace();
                    if (peek() !== "}")
                        throw new Error("Expected } after denominator");
                    advance(); // '}'
                    node = {
                        type: "operator",
                        op: "/",
                        left: numerator,
                        right: denominator,
                    };
                }
                else if (constCmd === "operatorname") {
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
                        if (peek() === "(" ||
                            (peek() === "\\" && latex.slice(pos + 1, pos + 5) === "left")) {
                            node = parseFunction(operatorName);
                        }
                        else {
                            // 括弧がない場合の引数処理（無限再帰を避ける）
                            const args = [];
                            if (peek().match(/[a-zA-Z]/)) {
                                args.push(parseSymbol());
                            }
                            else if (peek().match(/[0-9.]/)) {
                                args.push(parseNumber());
                            }
                            node = {
                                type: "function",
                                name: operatorName,
                                args,
                            };
                        }
                    }
                    else {
                        throw new Error(`Unknown operator: ${operatorName}`);
                    }
                }
                else if (constCmd === "overline") {
                    skipWhitespace();
                    if (peek() !== "{")
                        throw new Error("Expected { after \\overline");
                    advance(); // '{'
                    const expr = parseExpression();
                    skipWhitespace();
                    if (peek() !== "}")
                        throw new Error("Expected } after overline argument");
                    advance(); // '}'
                    // overlineを複素共役として処理
                    node = { type: "function", name: "conj", args: [expr] };
                }
                else if (constCmd === "left") {
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
                                }
                                else {
                                    throw new Error("Expected | after \\right");
                                }
                            }
                            else {
                                throw new Error(`Expected \\right, got \\${rightCmd}`);
                            }
                        }
                        else {
                            throw new Error("Expected \\right|");
                        }
                    }
                    else if (peek() === "(") {
                        // 通常の括弧の処理
                        advance(); // '('
                        const expr = parseExpression();
                        skipWhitespace();
                        if (peek() === "\\") {
                            const rightCmd = parseCommand();
                            if (rightCmd === "right") {
                                skipWhitespace();
                                if (peek() === ")") {
                                    advance(); // ')'
                                    node = expr;
                                }
                                else {
                                    // ')' がなくてもエラーにせず括弧を閉じたものとみなす
                                    node = expr;
                                }
                            }
                            else {
                                throw new Error(`Expected \\right, got \\${rightCmd}`);
                            }
                        }
                        else if (peek() === ")") {
                            advance(); // ')'
                            node = expr;
                        }
                        else {
                            // どちらも来なかった場合もエラーにせず括弧を閉じたものとみなす
                            node = expr;
                        }
                    }
                    else {
                        throw new Error("Expected ( or | after \\left");
                    }
                }
                else if (constCmd === "right") {
                    // 単独の \right は無視して次へ
                    return parseFactor();
                }
                else if (constCmd === "cdot") {
                    // \cdot は暗黙の乗算記号として機能するが、parseFactor()レベルでは次の要素を返す
                    skipWhitespace();
                    const nextFactor = parseFactor();
                    return nextFactor || { type: "number", value: 1 };
                }
                else if (knownFuncs.includes(constCmd)) {
                    // 関数名の場合の処理
                    node = parseFunction(constCmd);
                    if (node == null)
                        return null;
                }
                else {
                    throw new Error(`Unknown command: \\${constCmd}`);
                }
            }
        }
        else if (char.match(/[a-zA-Z]/)) {
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
        }
        else if (char === "(") {
            advance();
            const expr = parseExpression();
            skipWhitespace();
            if (peek() === ")") {
                advance();
                node = expr;
            }
            else {
                throw new Error("Expected closing parenthesis");
            }
        }
        else if (char === ")") {
            advance(); // 予期しない閉じ括弧はスキップ
            return parseFactor();
        }
        else if (char === "") {
            if (node === null)
                return { type: "number", value: 0 };
            return node;
        }
        else {
            throw new Error(`Unexpected character: ${char} at position ${pos}`);
        }
        return node === null ? { type: "number", value: 0 } : node;
    }
    function parsePower() {
        let left = parseFactor();
        if (left == null)
            left = { type: "number", value: 0 };
        skipWhitespace();
        while (peek() === "^") {
            advance();
            skipWhitespace();
            let right;
            let rightHasBraces = false;
            if (peek() === "{") {
                advance(); // '{'
                right = parseExpression();
                rightHasBraces = true;
                if (right == null)
                    right = { type: "number", value: 0 };
                if (peek() !== "}") {
                    throw new Error("Expected } after exponent");
                }
                advance(); // '}'
            }
            else {
                if (peek() === "-") {
                    advance(); // '-' を消費
                    skipWhitespace();
                    let factor = parseFactor();
                    if (factor == null)
                        factor = { type: "number", value: 0 };
                    right = {
                        type: "operator",
                        op: "-",
                        left: factor,
                        right: { type: "number", value: 0 },
                    };
                }
                else {
                    const factorResult = parseFactor();
                    right = factorResult || { type: "number", value: 0 };
                }
            }
            if (right.type === "number" && right.value === 0) {
                continue; // 0ノードなら指数を無視
            }
            // rightがnumber型またはoperator型ならhasBracesを付与
            if ((right.type === "number" || right.type === "operator") &&
                rightHasBraces) {
                if (right.type === "number") {
                    right = { ...right, hasBraces: true };
                }
                else if (right.type === "operator") {
                    right = { ...right, hasBraces: true };
                }
            }
            left = { type: "operator", op: "^", left, right };
        }
        return left;
    }
    function parseTerm() {
        let left = parsePower();
        if (left == null)
            left = { type: "number", value: 0 };
        skipWhitespace();
        while (peek().match(/[*\/]/) ||
            (peek() === "\\" && latex.slice(pos + 1, pos + 5) === "cdot")) {
            let op;
            if (peek() === "*") {
                op = advance();
            }
            else if (peek() === "/") {
                op = advance();
            }
            else if (peek() === "\\" && latex.slice(pos + 1, pos + 5) === "cdot") {
                advance(); // '\'
                for (let i = 0; i < 4; i++)
                    advance(); // 'cdot'
                op = "*";
            }
            else {
                throw new Error("Unknown operator in parseTerm");
            }
            skipWhitespace();
            let right = parsePower();
            if (right == null)
                right = { type: "number", value: 0 };
            left = { type: "operator", op, left, right };
            skipWhitespace();
        }
        while (peek() !== ")" &&
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
                        while (peek().match(/[a-zA-Z]/))
                            cmd += advance();
                        pos = save;
                        return (knownFuncs.includes(cmd) ||
                            cmd === "operatorname" ||
                            cmd === "overline" ||
                            cmd === "left" ||
                            cmd === "pi" ||
                            cmd === "frac" ||
                            cmd === "cdot");
                    })()))) {
            let right = parsePower();
            if (right == null)
                right = { type: "number", value: 0 };
            if (right.type === "number" && right.value === 0) {
                break; // 0ノードなら乗算せずループ終了
            }
            left = { type: "operator", op: "*", left: left, right };
            skipWhitespace();
        }
        return left;
    }
    function parseExpression() {
        let left = parseTerm();
        if (left == null)
            left = { type: "number", value: 0 };
        skipWhitespace();
        while (peek().match(/[+-]/)) {
            const op = advance();
            skipWhitespace();
            let right = parseTerm();
            if (right == null)
                right = { type: "number", value: 0 };
            left = { type: "operator", op, left, right };
        }
        return left;
    }
    return parseExpression() || { type: "number", value: 0 };
}
