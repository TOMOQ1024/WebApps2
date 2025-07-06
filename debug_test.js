const { parseLatex } = require("./src/src/Parser/parseLatex");
const { simplifyAST } = require("./src/src/Parser/simplify/simplifyAST");
const { ASTToLatex } = require("./src/src/Parser/ASTToLatex");
const {
  flattenAddition,
} = require("./src/src/Parser/simplify/flattenAddition");
const { groupLikeTerms } = require("./src/src/Parser/simplify/groupLikeTerms");
const {
  extractCoefficient,
} = require("./src/src/Parser/simplify/extractCoefficient");

// テストケース: 9(π^x + sin x) + π^x + sin x
const latex = "9\\left(\\pi^{x}+\\sin x\\right)+\\pi^{x}+\\sin x";
console.log("Input:", latex);

const ast = parseLatex(latex);
console.log("AST:", JSON.stringify(ast, null, 2));

// 加算項を平坦化
const terms = flattenAddition(ast.left, ast.right);
console.log(
  "Terms:",
  terms.map((t) => JSON.stringify(t))
);

// 各項の係数と基底を抽出
console.log("\nCoefficient extraction:");
terms.forEach((term, i) => {
  const { coefficient, base } = extractCoefficient(term);
  console.log(`Term ${i}:`, JSON.stringify(term));
  console.log(`  Coefficient: ${coefficient}`);
  console.log(`  Base: ${JSON.stringify(base)}`);
});

// 同類項をグループ化
const groups = groupLikeTerms(terms);
console.log("\nGroups:");
for (const [key, value] of groups) {
  console.log(`Key: ${key}`);
  console.log(`  Coefficient: ${value.coefficient}`);
  console.log(`  Base: ${JSON.stringify(value.base)}`);
}
