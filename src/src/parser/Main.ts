import { ExprType, NullParseResult, ParseResult } from "./Def";
import { BNode } from "./Node";
import Parser from "./Parser";

export function Parse(input: string, dvn: string[]): ParseResult {
  let parser = new Parser();
  let n: number;
  let result: (BNode|null) = null;

  let eType: ExprType;

  if(!input.match(/[<>=]/)){
    eType = 'expr';
  } else if(input.match(/[><]/)){
    eType = 'ineq';
  } else {
    eType = 'defi';
  }

  console.clear();
  console.log(`input: "${input}"`);
  try {
    n = performance.now();
    result = parser.parse(input, eType, dvn);
    if(!result)return NullParseResult;
    console.log(result.toStr());
    console.log(`parse end in ${performance.now()-n}ms`);
    console.log(result.tocdgl());
  } catch (e) {
    console.error(e);
    return NullParseResult;
  } finally {
    return ({
      status: true,
      type: input.match(/=/) ? 'defi' : 'ineq',
      root: result
    });
  }
  
}