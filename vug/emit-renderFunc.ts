import { partition } from "../utils"
import { VugNode } from "./parsing"

export function renderAst(nodes: VugNode[]) {
  return nodes.length === 1 ? renderNode(nodes[0]) : renderNode(new VugNode("", undefined, nodes))
}
function renderNode(node: VugNode, opts = {ce: "/*#__PURE__*/React.createElement", className: "className"}) {
  if (node.tag==="_html") return JSON.stringify(node.getWordErrIfCalc("_contents") || "")
  const attrExprText = new Map<string, string>()
  const styleExprText = new Map<string, string>()
  const classExprText = new Map<string, string>()
  const mapToObj = (m: Map<string,string>) => ' { ' + Array.from(m.entries()).map(([k,v]) => `${JSON.stringify(k)}: ${v}`).join(", ") + ' } '
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
  out.push(`${opts.ce}(${JSON.stringify(node.tag)}, `)
  if (attrExprText.size) out.push(mapToObj(attrExprText))
  else out.push("null")
  // Children
  for (const x of node.children) {
    out.push(",\n" + renderNode(x, opts).split("\n").map(x => `  ${x}`).join("\n"))
  }
  out.push(")")
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