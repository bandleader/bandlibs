import { partition } from "../utils"
import { cssProperties, imbaDict } from "./styling"

export type VugAttr = { key: string, value?: string, isExpr: boolean, kind: string }
export type VugNode = { tag: string, attrs: VugAttr[], innerHtml?: string, children: VugNode[] }

export function compile(text: string) {
  const nodes = text.replace(/\t/g, "        ") // Convert tabs to 8 spaces, like Python 2. People shouldn't mix tabs and spaces anyway
    .split("\n")
    .filter(x => x.trim()) // Remove blank lines
    .map(t => ({ text: t.trimStart(), indent: t.length - t.trimStart().length })) // Remove indent and mark that. Don't remove spaces at the end of the line as they may be significant.
    .map(info => ({ ...processLine(info.text), info }))
  return childize(nodes, x => x.info.indent)
}

function splitTwo(text: string, sep: string) {
  const pos = text.indexOf(sep)
  if (pos < 0) return [text]
  return [text.substr(0, pos), text.substr(pos + sep.length)]
}

function imbaCssShorthand(key: string) {  
  return imbaDict[key] || key
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

const flexAlignmentShorthands = {
  c: "center",
  fs: "flex-start",
  fe: "flex-end",
  s: "start",
  e: "end",
  l: "left",
  r: "right",
  x: "stretch",                                    
}

function macros(key: string, value: string): Record<string, string> | null {
  if (key === "px") return { 'padding-left': value, 'padding-right': value }
  else if (key === "py") return { 'padding-top': value, 'padding-bottom': value }
  else if (key === "mx") return { 'margin-left': value, 'margin-right': value }
  else if (key === "my") return { 'margin-top': value, 'margin-bottom': value }
  else if (key === "sz") return { 'width': value, 'height': value } // not 'size' because it's a valid HTML prop
  else if (key === "circ") return { 'border-radius': '100%' } // not 'round' because might be used by other things
  else if (key === "al") { // set justify-content and align-items
    // syntax: al=center, al=c, al=c.c (the latter sets align-items too)
    const parts = value.split(".").map(x => flexAlignmentShorthands[x] || x)
    if (parts.length > 2) throw `Can't have >2 parts: al=${value}`
    if (parts[1]) return { 'justify-content': parts[0], 'align-items': parts[1] }
    return { 'justify-content': parts[0] }
  } else if (key === "display" && cssDisplayShortcuts[value]) return { display: cssDisplayShortcuts[value] }
  
  // Commented out because this will require a further transform later to unify all the 'transform-___' attrs. Note also that some can be exprs and some not
  // const transformFuncs = "matrix|matrix3d|perspective|rotate|rotate3d|rotateX|rotateY|rotateZ|scale|scale3d|scaleX|scaleY|scaleZ|skew|skewX|skewY|translate|translate3d|translateX|translateY|translateZ|transform3d|matrix|matrix3d|perspective|rotate|rotate3d|rotateX|rotateY|rotateZ|scale|scale3d|scaleX|scaleY|scaleZ|skew|skewX|skewY|translate|translate3d|translateX|translateY|translateZ".split("|")
  // if (transformFuncs.includes(key)) return { ['transform-' + key]: value }

  return { [key]: value }
}

const cssDisplayShortcuts = {
  b: "block", // NOTE: can't be used as a tag (because 'b' is bold), use 'div' instead
  i: "inline", // NOTE: can't be used as a tag (because 'i' is italics), use 'span' instead
  f: "flex",
  g: "grid",
  ib: "inline-block",
  if: "inline-flex",
  ig: "inline-grid",
}

function processLine(line: string): VugNode {
  line = splitTwo(line, "// ")[0] // ignore comments
  if (line.startsWith("<")) line = "-- " + line //return { tag: "html", attrs: [], innerHtml: line, children: [] }
  if (line.startsWith("-- ")) line = " " + line // so that it gets detected
  let [wordPart, innerHtml] = splitTwo(line, " -- ")
  wordPart = wordPart.trim()
  const [tagPart, ...words] = wordPart.match(/(?=\S)[^"\s]*(?:"[^\\"]*(?:\\[\s\S][^\\"]*)*"[^"\s]*)*/g) || [''] // Not 100% sufficient. From https://stackoverflow.com/questions/4031900/split-a-string-by-whitespace-keeping-quoted-segments-allowing-escaped-quotes
  const [__tag, ...classesAttachedToTag] = tagPart.split(".")
  const [_tag, id] = splitTwo(__tag, "#")
  let tag = _tag || ((classesAttachedToTag.length || wordPart.length) ? 'div' : 'html') // html for lines with no tag only innerHtml
  for (const x of classesAttachedToTag) { words.push("." + x) }
  if (id) words.push("id=" + id)

  if (tag === "d") tag = "div"
  else if (tag === "s") tag = "span"
  // else if (cssDisplayShortcuts[tag] && tag !== "b" && tag !== "i" && tag !== "if") { tag = "div"; words.push(`display=${cssDisplayShortcuts[tag]}`) } // experimental
  else if (tag === "f" || tag === "fr") { tag = "div"; words.push("display=flex") } // experimental
  else if (tag === "fc") { tag = "div"; words.push("display=flex"); words.push("flex-direction=column") } // experimental
  else if (tag === "ib") { tag = "div"; words.push("display=inline-block") } // experimental
  
  const attrs: VugAttr[] = []
  for (const x of words) {
    let [_key, _value] = splitTwo(x, "=")
    let isExpr = false, kind = "attr"
    if (_value?.[0] === '"') _value = _value.slice(1, _value.length - 1) // Remove quotes
    else if (_value?.[0] === '{') { _value = _value.slice(1, _value.length - 1); isExpr = true }
    if (_key[0] === ":") { isExpr = true; _key = _key.slice(1) } // Vue-style :attr
    if (_key[0] === ".") { kind = "class"; _key = _key.slice(1) }
    if (_key[0] === "*") { kind = "style"; _key = _key.slice(1) }
    if (kind === "class" && _value) isExpr = true // Classes with values are always boolean expressions
    // _key = ourCssShorthand(_key) // Disabled in favour of Imba's
    _key = imbaCssShorthand(_key)

    // Expand macros
    const afterMacros = macros(_key, _value)
    for (const key of Object.keys(afterMacros)) {
      let value = afterMacros[key]      
      if (cssProperties.includes(key) && kind === "attr") kind = "style"
      if (_key.startsWith("attr-")) { kind = "attr"; _key = _key.slice(5) }
      if (kind === "style" && !isExpr && value) value = value.split(" ").map(x => /^-?([0-9]*\.)?[0-9]+q$/.test(x) ? `${parseFloat(x) * 0.25}rem` : x).join(" ") // add support for the "q" unit which is 0.25rem
      attrs.push({ key, value: value || undefined, isExpr, kind })
    }
  }
  return { tag, attrs, innerHtml: innerHtml || undefined, children: [] }
}
export function v1Load(text: string) {
  const nodes = compile(text)
  const toVueTemplate = (whitespace = false) => nodes.map(x => nodeToVue(x, whitespace)).join(whitespace ? "\n" : "")
  return { ast: nodes, toVueTemplate, toRenderFunc: () => toRenderFunc(nodes[0]) }
}
function toRenderFunc(node: VugNode, opts = {ce: "/*#__PURE__*/React.createElement", className: "className"}) {
  if (node.tag==="html") return JSON.stringify(node.innerHtml || "")
  const attrExprText = new Map<string, string>()
  const styleExprText = new Map<string, string>()
  const classExprText = new Map<string, string>()
  const mapToObj = (m: Map<string,string>) => ' { ' + Array.from(m.entries()).map(([k,v]) => `${JSON.stringify(k)}: ${v}`).join(", ") + '} '
  for (const x of node.attrs) {
    const exprText = x.value === undefined ? 'true' : x.isExpr ? x.value : JSON.stringify(x.value)
    if (x.kind === "style") {
      styleExprText.set(caseChange(x.key).toCamel(), exprText)
      attrExprText.set('style', mapToObj(styleExprText))
    } else if (x.kind === "class") {
      classExprText.set(x.key, exprText)
      attrExprText.set(opts.className, `classNames(${mapToObj(classExprText)})`)
    } else {
      attrExprText.set(x.key, exprText)
    }
  }
  const out: string[] = []
  out.push(`${opts.ce}(${JSON.stringify(node.tag)}, `)
  if (attrExprText.size) out.push(mapToObj(attrExprText))
  else out.push("null")
  // Children
  if (node.innerHtml) out.push(", " + JSON.stringify(node.innerHtml)) // TODO support interpolation?
  for (const x of node.children) {
    out.push(", " + toRenderFunc(x, opts))
  }
  out.push(")")
  return out.join("")
}
function nodeToVue(node: VugNode, whitespace = false) {
  const out: string[] = []
  if (node.tag === 'html') {
    out.push(node.innerHtml || "")
  } else {
    out.push('<', node.tag)
    const htmlAttrEnc = (x: string, usingApos = false) => x.replace(/&/g, '&amp;').replace(usingApos ? /'/g : /"/g, usingApos ? '&#x27;' : '&quot;').replace(/>/g, '&gt;')
    const block = function <T>(items: T[], funcs: { start?: Function, end?: Function, between?: Function, each: (x: T, i: number) => void }) { if (!items.length) return; funcs.start?.(); items.forEach((x, i) => { if (i) funcs.between?.(); funcs.each(x, i) }); funcs.end?.() }
    const [klass, style, attr] = ['class', 'style', 'attr'].map(x => node.attrs.filter(y => y.kind === x))
    const [classExpr, classStatic] = partition(klass, x => x.isExpr)
    block(classStatic, {
      start: () => out.push(' class="'),
      each: x => { out.push(x.key); if (x.value !== undefined) throw "CSS-Class attributes cannot have a static value. For a condition, use curly braces or simply no quotes. -- : " + x.key },
      between: () => out.push(" "),
      end: () => out.push('"')
    })
    block(classExpr, {
      start: () => out.push(" :class='{"),
      each: x => {
        const expr = x.value === undefined ? 'true' : !x.isExpr ? JSON.stringify(x.value) : x.value
        out.push(JSON.stringify(x.key), ': ', htmlAttrEnc(expr, true))
      },
      between: () => out.push(", "),
      end: () => out.push("}'")
    })
    const [styleExpr, styleStatic] = partition(style, x => x.isExpr)
    block(styleStatic, {
      start: () => out.push(' style="'),
      each: x => out.push(x.key, ": ", x.value!),
      between: () => out.push("; "),
      end: () => out.push('"')
    })
    block(styleExpr, {
      start: () => out.push(" :style='{"),
      each: x => {
        if (x.value === undefined) throw "Style keys must have a value: " + x.key
        const expr = !x.isExpr ? JSON.stringify(x.value) : x.value
        out.push(JSON.stringify(x.key), ': ', htmlAttrEnc(expr, true))
      },
      between: () => out.push(", "),
      end: () => out.push("}'")
    })
    block(attr, {
      each: x => {
        if (x.value === undefined) {
          out.push(" ", x.key)
        } else {
          out.push(" ", x.isExpr ? ":" : "", x.key)
          out.push('="', htmlAttrEnc(x.value), '"')
        }
      }
    })
    out.push(">")
    if (node.innerHtml) out.push(node.innerHtml)
  }
  for (const c of node.children) {
    let txt = nodeToVue(c, whitespace)
    if (whitespace) txt = txt.split("\n").map(l => `\n  ${l}`).join("\n") // Indent
    out.push(txt)
  }
  if (whitespace) out.push("\n")
  // Close tags except for 'void tags'. That includes 'html' because that's my element for raw HTML
  if (!["html", "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"].includes(node.tag.toLowerCase())) out.push(`</${node.tag}>`)
  return out.join("")
}
type WithChildren<T> = T & { children: WithChildren<T>[] }
function childize<T>(items: T[], getIndent: (i: T) => number) {
  const out: WithChildren<T>[] = []
  let stack: WithChildren<T>[] = []
  for (const i of items) {
    const ch: WithChildren<T> = { ...i, children: [] }
    // Remove items from the stack unless they're LESS indented than me
    stack = stack.filter(x => getIndent(x) < getIndent(ch))
    // Add ourselves to the last stack element, otherwise to main
    const lastStack = stack.slice(-1)[0]
    if (lastStack) lastStack.children.push(ch)
    else out.push(ch)
    // Push ourselves onto the stack, in case we have children
    stack.push(ch)
  }
  return out
}
