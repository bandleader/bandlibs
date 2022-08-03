import * as Macros from "./macros"
import * as Emit from "./emit"

export class VugNode {
    constructor(public tag: string, public words: VugWord[] = [], public children: VugNode[] = []) {}
    getWord(key: string) { return this.words.find(x => x.key === key)?.value }
    getWordErrIfCalc(key: string) { 
        const find = this.words.find(x => x.key === key) 
        if (!find) return ""
        if (find.isExpr) throw `Attribute '${find.key}' cannot be an expression.`
        return find.value
    }    
}
export class VugWord {
    constructor(public key: string, public value: string, public isExpr: boolean) {}
}

export function compile(text: string){
    const ast = parseDoc(text)
    return { 
        ast, 
        toAstJson: () => JSON.stringify(ast, undefined, 2), 
        toVueTemplate: () => ast.map(x => Emit.emitVueTemplate(x, true)).join("\n") 
    }
}

function splitTwo(text: string, sep: string) {
    const pos = text.indexOf(sep)
    if (pos < 0) return [text]
    return [text.substr(0, pos), text.substr(pos + sep.length)]
}
const htmlNode = (html: string) => new VugNode("_html", [new VugWord("_contents", html, false)])
function parseLine(line: string) {
    line = splitTwo(line, "// ")[0] // ignore comments
    if (line.startsWith("<")) line = "-- " + line // allow HTML tags
    if (line.startsWith("-- ")) line = " " + line // so that it gets detected, as we've trimmed
    let [_wordPart, innerHtml] = splitTwo(line, " -- ")
    if (!_wordPart) return htmlNode(innerHtml)
    const [tag, ...words] = _wordPart.trim().match(/(?=\S)[^"\s]*(?:"[^\\"]*(?:\\[\s\S][^\\"]*)*"[^"\s]*)*/g) || [''] // Not 100% sufficient. From https://stackoverflow.com/questions/4031900/split-a-string-by-whitespace-keeping-quoted-segments-allowing-escaped-quotes
    const words2 = words.map(w => {
        let [key, value] = splitTwo(w, "=")
        const isExpr = key[0] === ':'
        if (isExpr) key = key.slice(1)
        return new VugWord(key, value, isExpr)
    })
    const children = innerHtml ? [htmlNode(innerHtml)] : []
    return new VugNode(tag, words2, children)
}
export function parseDoc(html: string) {
    const lines = html.split("\n").map(ln => {
        const trimmed = ln.trimStart()
        const indent = ln.length - trimmed.length
        const node = parseLine(trimmed)
        return { node, indent }
    }).filter(x => x.node.tag !== "_html" || (x.node.getWord("_contents") || '').trim()) // Remove empty or comment-only lines. They would be _html elements with blank _contents. (We could remove them before parsing, but the comment logic is in the parser)
    // Now make a tree
    let stack: {node: VugNode, indent: number}[] = []
    const out: VugNode[] = []
    for (const ln of lines) {
        stack = stack.filter(x => x.indent < ln.indent) // Remove items from the stack unless they're LESS indented than me
        if (stack.length) stack.slice(-1)[0].node.children.push(ln.node) // Add us into the last stack item
        else out.push(ln.node) // Or as a top-level node, if the stack is empty
        stack.push(ln) // Push ourselves onto the stack, in case we have children
    }
    // Run macros
    return out.map(x => Macros.runAll(x))
}
