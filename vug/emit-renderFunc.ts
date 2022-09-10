import { partition } from "../utils"
import { VugNode } from "./parsing"

  // Based on: https://vuejs.org/guide/extras/render-function.html
  // See also: https://vuejs.org/guide/extras/rendering-mechanism.html
  // This is helpful: https://babeljs.io/repl

interface RenderFuncOpts {
  h: "/*#__PURE__*/React.createElement"|"h"|string
  className: "className"|string
  Fragment: "React.Fragment"|"Vue.Fragment"|string
}
const vueDefaultOpts: RenderFuncOpts = { Fragment: "Vue.Fragment", className: "className", h: "h" }

export function renderAst(nodes: VugNode[], opts: RenderFuncOpts = vueDefaultOpts) {
  return nodes.length === 1 ? renderNode(nodes[0], opts) : renderNode(new VugNode(vueDefaultOpts.Fragment, undefined, nodes), opts) // for React, should be React.Fragment I think
}

function basicVueDirectivesToJsx(v: VugNode) {
  /*
  Based on: https://vuejs.org/guide/extras/render-function.html#render-function-recipes
  TODO:
  - if any elements have v-if, v-else-if, v-else, convert them to a ternary expression. Has to be done at parent level
  - v-for -> map
  - seems v-html has to be done too, using innerHTML -- I think for React dangerouslySetInnerHTML to {html: contents}
  - and v-text, maybe innerText, or just add a text node: String(expr)
  - and v-show, using display: none/null I guess
  - v-model
    - .number etc -- how?

  - @click to onClick, but convert to a function if it has anything but alphanumeric and dots. 
    - modifiers -- concat any modifiers in Title case for passive, etc, for others, use Vue.withModifiers
  - does :is tag have to be converted?
  - Built-in components
  - custom directives
  // - slots incl passing data
  - calling slots incl passing children to slots
  */
 return new VugNode(v.tag, v.words, v.children)
}


// TODO: non-HTML tags should be done as Expr i.e. it's a component in scope

function renderNode(node: VugNode, opts: RenderFuncOpts = vueDefaultOpts) {
  node = basicVueDirectivesToJsx(node)
  if (node.tag==="_html") return JSON.stringify(node.getWordErrIfCalc("_contents") || "") // TODO not really, as this will be a text node in a render function, whereas this can contain HTML tags (and was converted from Markdown). We have to really parse it in the parser... or maybe it's legit to say you can't do this if you're gonna use the render func maker
  const attrExprText = new Map<string, string>()
  const styleExprText = new Map<string, string>()
  const classExprText = new Map<string, string>()
  const mapToObj = (m: Map<string,string>) => '{ ' + Array.from(m.entries()).map(([k,v]) => `${JSON.stringify(k)}: ${v}`).join(", ") + ' }'
  for (const x of node.words) {
    const exprText = !x.value ? 'true' : x.isExpr ? x.value : JSON.stringify(x.value)
    if (x.key.startsWith("style_")) {
      styleExprText.set(caseChange(x.key.slice(6)).toCamel(), exprText)
      attrExprText.set('style', mapToObj(styleExprText))
    } else if (x.key.startsWith(".")) {
      classExprText.set(x.key.slice(1), exprText)
      const [sStatic, sCalc] = partition([...classExprText.entries()], ([k, v]) => v === 'true')
      const stringExprs: string[] = []
      if (sStatic.length) stringExprs.push(JSON.stringify(sStatic.map(x => x[0]).join(" ")))
      sCalc.forEach(([k,v]) => stringExprs.push(`((${v}) ? ${JSON.stringify(' ' + k)} : "")`))
      attrExprText.set(opts.className, stringExprs.join(" + "))
      // attrExprText.set(opts.className, sStatic.join(" ") + sCalc.length  [...classExprText.entries()].map(([k,v],i) => exprText === 'true' ? JSON.stringify(' ' + k) : `((${v}) ? ${JSON.stringify(' ' + k)} : "")`).join(" + "))
      // attrExprText.set(opts.className, `classNames(${mapToObj(classExprText)})`)
    } else {
      attrExprText.set(x.key, exprText)
    }
  }
  const out: string[] = []
  if (node.tag === "slot") {
    const identifier = `slots.${node.getWordErrIfCalc("name")}` // TODO support calculated name
    const children = node.children.length ? `\n${indent(renderAst(node.children, opts))}\n` : 'null'
    out.push(`${identifier} ? ${identifier}(${mapToObj(attrExprText)}) : ${children}`) // TODO remove "name"
  } else {
    out.push(`${opts.h}(${JSON.stringify(node.tag)}, `)
    if (attrExprText.size) out.push(mapToObj(attrExprText))
    else out.push("null")
    // Children
    for (const x of node.children) {
      out.push(",\n" + indent(renderNode(x, opts)))
    }
    out.push(")")
  }
  return out.join("")
}

function caseChange(txt: string) {
  let words: string[] = []
  const isCapital = (ch: string) => ch === ch.toUpperCase()
  txt.split('').forEach((x,i) => {
    const xLower = x.toLowerCase(), prevWord = words[words.length - 1], prevLetter = txt[i-1]
    if (x === "-") return;
    // We add a word if there's no previous word, or if we're after a hyphen, or if we're a first capital (before us was not a capital)
    if (!prevWord || prevLetter === "-" || (isCapital(x) && !isCapital(prevLetter))) return words.push(xLower)
    // Otherwise add to previous word
    words[words.length - 1] += xLower
  })
  const PascalWord = (x: string) => x[0].toUpperCase() + x.slice(1)
  return {
    toPascal() { return words.map(PascalWord).join("") },
    toCamel() { return words.map((x,i) => i ? PascalWord(x) : x).join("") },
    toSnake() { return words.join("-") },
  }
}

function indent(text: string) { return text.split("\n").map(x => `  ${x}`).join("\n") }