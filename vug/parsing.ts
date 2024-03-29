import * as Macros from "./macros"
import * as Emit from "./emit"
import * as MarkdownSupport from './markdown-support'
import * as EmitRenderFunc from "./emit-renderFunc"

export class VugNode {
    constructor(public tag: string, public words: VugWord[] = [], public children: VugNode[] = []) {}
    getWord(key: string): string|void { return this.words.find(x => x.key === key)?.value }
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
        toVueTemplate: () => ast.map(x => Emit.emitVueTemplate(x, true)).join("\n") ,
        toRenderFunc: (renderFuncOpts?: EmitRenderFunc.RenderFuncOpts) => EmitRenderFunc.renderAst(ast, renderFuncOpts),
    }
}

export function splitThree(what: string, sepChar = " ") {
    // Splits on a char EXCEPT when that char occurs within quotes, parens, braces, curlies
    // MAYBE allow sepChar to be >1 char long?
    // MAYBE allow for multiple possibilities of sepChar, and tack it on? Can use this for parsing classes&ids&args... nah won't help, we don't want quotes in there anyway
    // MAYBE customize the list of things that can quote? and the escape char?
    const ret: string[] = ['']
    const stack: string[] = []
    let escaping = false
  
    for (const ch of what.split('')) {
      const starter = `'"({[\``.indexOf(ch)
      if (escaping) {
        ret[ret.length - 1] += ch // Add to current item
        escaping = false
        continue
      } else if (ch === '\\') {
        escaping = true
        continue
      }
      if (ch === stack.slice(-1)[0]) {
        stack.pop()
      } else if (starter >= 0) {
        stack.push(`'")}]\``[starter]) // Add the expected closing char to the stack
      } 
      if (ch === sepChar && !stack.length) {
        ret.push('') // Start a new item
      } else {
        ret[ret.length - 1] += ch // Add to current item
      }
    }
    // if (stack.length) throw "Unterminated " + stack.slice(-1)[0]
    return ret
  }



function parseValue(value: string): [boolean, string] { // returns [isExpr, value]
    /* Supports:
        foo             (literal)
        "foo"           (literal)
        'foo'           (literal)
        `foo ${}`       (expr)
        (1 + 2)         (expr)
        {obj: 'foo'}    (expr)
        345.2           (expr)
    */
    if (!value.length) return [false, ''] // If there is no value, it's not an expr.
    const first = value[0], last = value[value.length - 1], same = first === last && value.length > 1
    if (same && (first === '"' || first === "'")) return [false, value.slice(1, value.length - 1)] // Quoted values
    const opener = "({`".indexOf(first), closer = ")}`".indexOf(last)
    if (opener >= 0 && opener === closer && value.length > 1) return [true, (first === '(') ? value.slice(1, value.length - 1) : value] // parens, objects, template strings. Cut off parens
    if (!isNaN(Number(value))) return [true, value] // numbers
    // Removed because it throws for things like `vg-let:foo="a b".split(' ')` which is perfectly legal. // if ("\"'`".indexOf(first) >= 0) throw `Unterminated string quote in value: ${value}`
    return [false, value]
}  
function splitTwo(text: string, sep: string) {
    const pos = text.indexOf(sep)
    if (pos < 0) return [text, '']
    return [text.substr(0, pos), text.substr(pos + sep.length)]
}
const htmlNode = (html: string, raw = false) => new VugNode("_html", [new VugWord("_contents", raw ? html : MarkdownSupport.convertSingleLineOfText(html), false)])
function splitByContentSeparator(line: string) {
  // Returns the elementPart trimmed, BTW. And the contentPart not, because that's not desired sometimes.
  const findContentSep = line.match(/(?<![^ ])--(raw--)? /) // That's negative lookbehind, to not match the `--` if it's preceded by anything but a space.
  if (!findContentSep) return { elementPart: line.trim(), contentPart: "", contentIsRaw: false }
  const optionalRaw = findContentSep[1]
  return { elementPart: line.slice(0, findContentSep.index!).trim(), contentPart: line.slice(findContentSep.index! + 2 /*--*/ + (optionalRaw?.length || 0) + 1 /*space*/), contentIsRaw: !!optionalRaw }
}
function parseLine(line: string) {
    line = splitTwo(line, "// ")[0] // ignore comments
    if (line.startsWith("<")) line = `--raw-- ${line}` // allow HTML tags
    line = MarkdownSupport.lineTransformBasedOnPrefixes(line)
    const splitC = splitByContentSeparator(line)
    if (!splitC.elementPart) return htmlNode(splitC.contentPart, splitC.contentIsRaw)
    const [tag, ...words] = splitThree(splitC.elementPart, " ")
    if (MarkdownSupport.aggressiveMarkdownParagraphDetection(tag, words)) return parseLine("| " + line)
    const words2 = words.map(w => {
        let [key, value] = splitTwo(w, "=")
        let [isExpr, parsedValue] = parseValue(value)
        if (key[0] === ':') { key = key.slice(1); isExpr = true } // allow Vue-style :attr=expr
        if ((key[0] === '.' || key.startsWith("v-") || key.startsWith("x-")) && value) isExpr = true // .foo, v- and x- are always expressions (as long as they have a value)
        return new VugWord(key, parsedValue, isExpr)
    })
    const children = splitC.contentPart ? [htmlNode(splitC.contentPart, splitC.contentIsRaw)] : []
    return new VugNode(tag, words2, children)
}
export function parseDoc(html: string) {
    const lines = html.replace(/\t/g, "        ") // Convert tabs to 8 spaces, like Python 2. People shouldn't mix tabs and spaces anyway
        .split("\n").map(ln => {
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
    // Run macros. Let's run it on a fake top-level element, so that macros can access the children of it
    // Formerly simply: return out.map(x => Macros.runAll(x))
    const doc = new VugNode("_doc", undefined, out)
    const nodes = Macros.runAll(doc).children
    return nodes
}
