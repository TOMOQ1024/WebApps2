import { ExprType, NullParseResult, ParseResult } from "./Def";
import { BNode } from "./Node";
import Parser from "./Parser";

export function Parse(input: string, dvn: string[], eType: ExprType='null'): ParseResult {
  let parser = new Parser();
  let n: number;
  let result: (BNode|null) = null;

  if (eType === 'null') {
    if(!input.match(/[<>=]/)){
      eType = 'expr';
    } else if(input.match(/[><]/)){
      eType = 'ineq';
    } else {
      eType = 'defi';
    }
  }

  console.clear();
  console.log(`input: "${input}"`);
  try {
    n = performance.now();
    result = parser.parse(input, eType, dvn);
    if(!result)return NullParseResult;
    console.log(parser.currentLine.length, parser.currentPointer);
    if (parser.currentPointer < parser.currentLine.length) {
      throw new Error(`不正な文字列です．解析できなかった文字列：${parser.currentLine}`);
    }
    console.log(result.toStr());
    console.log(`parse end in ${performance.now()-n}ms`);
    // console.log(result.tocdgl());
    return ({
      status: true,
      type: input.match(/=/) ? 'defi' : 'ineq',
      root: result
    });
  } catch (e) {
    const E = e as Error;
    console.error(E.message);
    return NullParseResult;
  } finally {
    // console.log(`result: ${result}`);
  }
  
}