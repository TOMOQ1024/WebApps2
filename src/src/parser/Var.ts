export enum VarName {
  NIL = '',
  PI = 'pi',
  E = 'e',
}

export function isVarName(input: any){
  let s = String(input);
  return 0<=Object.values(VarName).map(t=>String(t)).indexOf(s);
}