import { ExprType, NullParseResult, ParseResult } from "./Def";
import { CStack } from "./CStack";
import { BNode } from "./Node";
import Parser from "./Parser";

export function Parse(input: string, dvn: string[]): ParseResult {
  let parser = new Parser();
  let n: number;
  let result: (BNode|null);
  let cst: (CStack|undefined);

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
    cst = new CStack(result, eType);
    console.log(cst.togl(cst.root));
  } catch (e) {
    console.error(e);
    return NullParseResult;
  } finally {
    if(cst === undefined){
      return NullParseResult;
    }
    return ({
      status: true,
      type: input.match(/=/) ? 'defi' : 'ineq',
      cstack: cst
    });
  }
  
}