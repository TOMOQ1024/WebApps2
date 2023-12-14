import { BNodeKind, BNode } from './Node';
import { FuncName } from "./Func";
import { Token, TokenType } from './Token'
import { VarName } from './Var';
import { ExprType } from './Def';

export default class Parser {
  eType: ExprType = 'null';
  definedVariableNames: string[] = [];
  currentLine: string = '';
  currentPointer: number = 0;
  token = new Token();

  constructor(){}

  parse(input: string, eType: ExprType, dvn: string[]): BNode {
    this.eType = eType;
    this.definedVariableNames = dvn;
    this.currentLine = input;
    this.currentPointer = 0;

    try {
      this.nextToken();
      switch(eType){
        case 'defi':
          return this.defi();
        case 'ineq':
          return this.ineq();
        case 'expr':
          return this.expr();
        case 'null':
          return new BNode();
      }
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  }

  ineq(): BNode {
    let node = this.expr();
    for(;;){
      if(this.consumeToken(TokenType.GEQ)){
        node = new BNode(BNodeKind.GEQ, node, this.expr());
      } else if(this.consumeToken(TokenType.LEQ)){
        node = new BNode(BNodeKind.LEQ, node, this.expr());
      } else if(this.consumeToken(TokenType.GET)){
        node = new BNode(BNodeKind.GET, node, this.expr());
      } else if(this.consumeToken(TokenType.LET)){
        node = new BNode(BNodeKind.LET, node, this.expr());
      } else {
        return node;
      }
    }
  }

  defi(): BNode {
    let node = this.nwid();
    this.expectToken(TokenType.EQL);
    return new BNode(BNodeKind.EQL, node, this.expr());
  }

  expr(): BNode {
    let node: BNode;
    // this.nextToken();
    if(this.consumeToken(TokenType.SUB)){
      node = new BNode(BNodeKind.SUB, BNode.zero, this.mult());
    }
    else {
      this.consumeToken(TokenType.ADD);
      node = this.mult();
    }
    for(;;){
      if(this.consumeToken(TokenType.ADD)){
        node = new BNode(BNodeKind.ADD, node, this.mult());
      }
      else if(this.consumeToken(TokenType.SUB)){
        node = new BNode(BNodeKind.SUB, node, this.mult());
      }
      else {
        return node;
      }
    }
  }

  mult(): BNode {
    let node = this.powr();

    for(;;){
      if(this.consumeToken(TokenType.MUL)){
        node = new BNode(BNodeKind.MUL, node, this.powr());
      } else if(this.consumeToken(TokenType.MOD)){
        node = new BNode(BNodeKind.MOD, node, this.powr());
      } else if(this.consumeToken(TokenType.DIV)){
        node = new BNode(BNodeKind.DIV, node, this.powr());
      } else if(!this.checkTokens(
        TokenType.ADD, TokenType.SUB, TokenType.CMA, TokenType.RPT,
        TokenType.GEQ, TokenType.LEQ, TokenType.GET, TokenType.LET, TokenType.EQL
      ) && !this.checkToken(TokenType.EOL)){
        node = new BNode(BNodeKind.MUL, node, this.powr());
      } else {
        return node;
      }
    }
  }

  powr(): BNode {
    let node = this.prim();

    if(this.consumeToken(TokenType.POW)){
      return new BNode(BNodeKind.POW, node, this.powr());
    }

    return node;
  }

  prim(): BNode {
    let node: BNode;
    let fn: FuncName;
    let vn: VarName;
    if(this.consumeToken(TokenType.LPT)){
      node = this.expr();
      this.expectToken(TokenType.RPT);
      return node;
    }
    else if(fn = this.consumeFunc()){
      return this.func(fn);
    }
    else if(vn = this.consumeVar()){
      return this.vari(vn);
    }
    else if(this.checkToken(TokenType.DFD)){
      return this.dfnd();
    }
    return this.nmbr(this.expectNumber());
  }
/*
Node* func(int id)
{
	Node* node;


	if (consume("(")) {
		node = expr();
		while (consume(",")) {
			node = new_node_func(id, node, expr());
		}
		expect(")");
		return node->kind == ND_FNC ? node : new_node_func(id, node, NULL);
	}
	return new_node_func(id, mult(), NULL);
}
*/
  func(fn: FuncName): BNode {
    let node : BNode;

    if(this.consumeToken(TokenType.LPT)){
      node = this.expr();
      while(this.consumeToken(TokenType.CMA)){
        node = new BNode(BNodeKind.FNC, node, this.expr(), FuncName.NIL);
      }
      this.expectToken(TokenType.RPT);
      if(node.kind === BNodeKind.FNC && node.val === FuncName.NIL){
        node.val = fn;
        return node;
      } else {
        return new BNode(BNodeKind.FNC, node, null, fn);
      }
    }
    return new BNode(BNodeKind.FNC, this.mult(), null, fn);
  }

  vari(vn: VarName): BNode {
    return new BNode(BNodeKind.VAR, null, null, vn);
  }

  nwid(): BNode {
    let node: BNode;
    let str = this.currentLine.split('=')[0];
    let fstr, lstr;
    if(str.match(/[^\(]+\(.*\)/)){
      fstr = str.split('(')[0];
      lstr = str.match(/\(.*\)/)?.slice(1,-1);
    } else {
      fstr = str;
      lstr = '';
    }
    if(fstr.match(/^[A-Za-z]\w*$/)){
      this.currentPointer += fstr.length-1;
      this.nextToken();
      this.consumeToken(TokenType.LPT);
      node = new BNode(BNodeKind.NID, null, null, fstr);
    }
    throw new Error(`variable/function name is incorrect: ${fstr}`);
  }

  dfnd(): BNode {
    let dvn = this.token.value as string;
    if(dvn){
      // this.currentPointer += dvn.length - 1;
      this.nextToken();
      return new BNode(BNodeKind.DFD, null, null, dvn);
    }
    throw new Error(`defined variable not found`);
  }

  nmbr(x: number): BNode {
    return new BNode(BNodeKind.NUM, null, null, x);
  }

  character(): string {
    let character = this.currentLine[this.currentPointer];
    if (/\s/.test(character)) {
      return this.nextCharacter();
    }
    return character;
  }

  nextCharacter(): string {
    let character = this.currentLine[++this.currentPointer];
    if (/\s/.test(character)) {
      return this.nextCharacter();
    }
    return character;
  }

  nextToken() {
    (async s=> await (s_=>new Promise( resolve => setTimeout(resolve, 1000*s_) ))(s))( 0.5 );
    let character = this.character();
    let str = this.currentLine.slice(this.currentPointer);
    let v: string;
    let fn: FuncName;
    let vn: VarName;
    let dvn: string;
    this.token = new Token(TokenType.UNK, 0, character);

    if (character === undefined) {
      this.token = Token.eol;
      return;
    }

    if (v = this.isNumber(str)) {
      this.token.type = TokenType.NUM;
      this.token.value = parseFloat(v);
      for(let i=0; i<v.length; i++) this.nextCharacter();
      return;
    }

    if (fn = this.isFunction(str)) {
      this.token.type = TokenType.FNC;
      this.token.value = fn;
      for(let i=0; i<fn.length; i++) this.nextCharacter();
      return;
    }

    if (vn = this.isVariable(str)) {
      this.token.type = TokenType.VAR;
      this.token.value = vn;
      for(let i=0; i<vn.length; i++) this.nextCharacter();
      return;
    }

    if (dvn = (str.match(new RegExp(`^(${this.definedVariableNames.join('|')})`))||[''])[0]){
      this.token.type = TokenType.DFD;
      this.token.value = dvn;
      for(let i=0; i<dvn.length; i++) this.nextCharacter();
      return;
    }

    switch (character) {
      case '+':
        this.token.type = TokenType.ADD;
        break;
      case '-':
        this.token.type = TokenType.SUB;
        break;
      case '*':
        this.token.type = TokenType.MUL;
        break;
      case '/':
        this.token.type = TokenType.DIV;
        break;
      case '%':
        this.token.type = TokenType.MOD;
        break;
      case '^':
        this.token.type = TokenType.POW;
        break;
      case '=':
        this.token.type = TokenType.EQL;
        break;
      case '>=':
        this.token.type = TokenType.GEQ;
        break;
      case '<=':
        this.token.type = TokenType.LEQ;
        break;
      case '>':
        this.token.type = TokenType.GET;
        break;
      case '<':
        this.token.type = TokenType.LET;
        break;
      case ',':
        this.token.type = TokenType.CMA;
        break;
      case '(':
        this.token.type = TokenType.LPT;
        break;
      case ')':
        this.token.type = TokenType.RPT;
        break;
      default:
        this.token.type = TokenType.UNK;
    }

    this.nextCharacter();
    return;
  }

  expectToken(type: TokenType) {
    if(this.token.type != type){
      throw new Error(`Unexpected token error. Expected TokenType: ${type}, but caught following token: ${this.token.type}`);
    }
    this.nextToken();
  }

  consumeToken(type: TokenType) {
    if(this.token && this.token.type != type){
      return false;
    }
    this.nextToken();
    return true;
  }

  checkToken(type: TokenType) {
    if(this.token && this.token.type != type){
      return false;
    }
    return true;
  }

  checkTokens(...types: TokenType[]) {
    if(this.token && 0 > types.indexOf(this.token.type)){
      return false;
    }
    return true;
  }

  consumeFunc(): FuncName {
    if(this.token.type != TokenType.FNC)return FuncName.NIL;
    let fn = this.token.value as FuncName;
    this.nextToken();
    return fn;
  }

  consumeVar(): VarName {
    if(this.token.type != TokenType.VAR)return VarName.NIL;
    let vn = this.token.value as VarName;
    this.nextToken();
    return vn;
  }

  expectNumber(): number {
    if(this.token.type != TokenType.NUM){
      throw new Error(`Unexpected token error. Expected TokenType: NUM, but caught following token: ${this.token.type}`);
    }
    let val = this.token.value;
    this.nextToken();
    return val as number;
  }

  isNumber(text: string): string {
    let m = text.match(/(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/);
    // console.log(text, m);
    if(m !== null && m.index === 0){
      return m[0];
    }
    return '';
  }

  isVariable(text: string): VarName {
    let vns = Object.values(VarName);
    let vn: VarName;
    for(let i=0; i<vns.length; i++){
      vn = vns[i];
      if(vn && (new RegExp(`^${vn}`)).test(text)){
        return vn;
      }
    }
    return VarName.NIL;
  }

  isFunction(text: string): FuncName {
    let fns = Object.values(FuncName);
    let fn: FuncName;
    for(let i=0; i<fns.length; i++){
      fn = fns[i];
      if(fn && (new RegExp(`^${fn}`)).test(text)){
        return fn;
      }
    }
    return FuncName.NIL;
  }
}