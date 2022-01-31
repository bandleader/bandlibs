import * as FP from './'

const mainTokens = {
    NumberLiteral: FP.Token.fromRegex(/^[0-9]+/, x => ({ num: parseInt(x.text) })).named("number literal"),
    KwdLet: FP.Token.fromRegex(/^let/, x => x).named("let"),
    OpEquals: FP.Token.fromRegex(/^=/, x => x).named("="),
    OpPlus: FP.Token.fromRegex(/^\+/, x => x).named("+"),
    Ident: FP.Token.fromRegex(/^[a-zA-Z_$][a-zA-Z0-9_$]*/, x => x).named("identifier"),
}
// const StmtLet = mainTokens.NumberLiteral.parserWs.then(mainTokens.NameExpr.parserWs, mainTokens.OpEquals.parserWsLb, mainTokens.NumberLiteral.parserWsLb)
const Sum = mainTokens.NumberLiteral.parserWs.list(undefined, mainTokens.OpPlus.parserWs)
const StmtLet = mainTokens.KwdLet.parserWs.then(mainTokens.Ident.parserWs, mainTokens.OpEquals.parserWs, Sum).named("let statement")
const StmtBlock = StmtLet.list(undefined, FP.Basics.LineBreak)
function test<T>(p: FP.Parser<FP.FileCursor, T>, data: string) {
    const file: FP.File = { id: "MainFile.js", data }
    let cursor = new FP.FileCursor(file, 0)
    const result = p.parse(cursor)
    if (result instanceof FP.ParseSuccess) cursor = result.after
    if (cursor.pos !== data.length) console.error("Unrecognized input at", cursor.rowAndCol().withFile)
    // if (result instanceof PB.ParseSuccess) console.log(result.output.map(x => x.token?._parser.names.join("/")))
    console.log("Cursor is at:", cursor.rowAndCol().withFile)
    return result
}

// console.log(test(mainTokens.NumberLiteral.parserWsLb, "  \n 25"))
// console.log(test(Basics.LineBreak, "\n   foo"))
console.log(test(StmtBlock, "let foo = 25 + 52 + 1181\n  let bar = 17"))
// console.log(test(StmtLet, "let foo = 25"))