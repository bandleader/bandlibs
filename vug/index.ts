export type VugAttr = { key: string, value?: string, isExpr: boolean, isLiteral: boolean }
export type VugNode = { tag: string, attrs: VugAttr[], innerHtml?: string, children: VugNode[] }

function compile(text: string) {
  const nodes = text.split("\n").filter(x => x.trim())
    .map(t => ({ text: t.trim(), indent: t.length - t.trimStart().length }))
    .map(info => ({ ...processLine(info.text), info }))
  return childize(nodes, x => x.info.indent)
}

function splitTwo(text: string, sep: string) {
  const pos = text.indexOf(sep)
  if (pos < 0) return [text]
  return [text.substr(0, pos), text.substr(pos + sep.length)]
}

function processLine(line: string): VugNode {
  if (line.startsWith("<")) line = "-- " + line //return { tag: "html", attrs: [], innerHtml: line, children: [] }
  if (line.startsWith("-- ")) line = " " + line // so that it gets detected
  const [wordPart, innerHtml] = splitTwo(line, " -- ").map(x => x.trim())
  const [tagPart, ...words] = wordPart.split(" ") // TODO
  const [__tag, ...classesAttachedToTag] = tagPart.split(".")
  const [_tag, id] = __tag.split("#")
  const tag = _tag || ((classesAttachedToTag.length || wordPart.length) ? 'div' : 'html') // html for lines with no tag only innerHtml
  for (const x of classesAttachedToTag) { words.push("." + x) }
  if (id) words.push("id=" + id)
  const attrs: VugAttr[] = []
  for (const x of words) {
    let [key, value] = splitTwo(x, "=")
    let isExpr = false, isLiteral = false
    if (value?.[0] === '"') { value = value.slice(1, value.length - 1); isLiteral = true }
    else if (value?.[0] === '{') { value = value.slice(1, value.length - 1); isExpr = true }
    attrs.push({ key, value: x.includes("=") ? value : undefined, isLiteral, isExpr })
  }
  return { tag, attrs, innerHtml: innerHtml || undefined, children: [] }
}
export function load(text: string) {
  const nodes = compile(text)
  const toVueTemplate = () => nodes.map(x => nodeToVue(x)).join("\n")
  return { nodes, toVueTemplate }
}
function partition<T>(arr: T[], fn: (i: T) => boolean | number) {
  const ret: T[][] = [[], []]
  for (const i of arr) {
    const k = fn(i)
    const ind = typeof k === 'number' ? k : !!k ? 0 : 1
    while (ret.length < (ind + 1)) ret.push([])
    ret[ind].push(i)
  }
  return ret
}
function nodeToVue(node: VugNode) {
  const out: string[] = []
  if (node.tag === 'html') {
    out.push(node.innerHtml || "")
  } else {
    out.push('<', node.tag)
    const attrs2 = node.attrs.map(x => {
      let kind: 'attr' | 'style' | 'class' = 'attr', key = x.key
      if (x.key[0] === '*') { kind = 'style'; key = key.slice(1) }
      if (x.key[0] === '.') { kind = 'class'; key = key.slice(1) }
      const isExprFinal = x.isExpr || (!x.isLiteral && x.value !== undefined && kind === 'class') // classes are implicitly expressions, others are implicitly literal
      return { kind, key, isExprFinal, value: x.value }
    })
    const htmlAttrEnc = (x: string, usingApos = false) => x.replace(/&/g, '&amp;').replace(usingApos ? /'/g : /"/g, usingApos ? '&#x27;' : '&quot;').replace(/>/g, '&gt;')
    const block = function <T>(items: T[], funcs: { start?: Function, end?: Function, between?: Function, each: (x: T, i: number) => void }) { if (!items.length) return; funcs.start?.(); items.forEach((x, i) => { if (i) funcs.between?.(); funcs.each(x, i) }); funcs.end?.() }
    const [klass, style, attr] = ['class', 'style', 'attr'].map(x => attrs2.filter(y => y.kind === x))
    const [classExpr, classStatic] = partition(klass, x => x.isExprFinal)
    block(classStatic, {
      start: () => out.push(' class="'),
      each: x => { out.push(x.key); if (x.value !== undefined) throw "CSS-Class attributes cannot have a static value. For a condition, use curly braces or simply no quotes. -- : " + x.key },
      between: () => out.push(" "),
      end: () => out.push('"')
    })
    block(classExpr, {
      start: () => out.push(" :class='{"),
      each: x => {
        const expr = x.value === undefined ? 'true' : !x.isExprFinal ? JSON.stringify(x.value) : x.value
        out.push(JSON.stringify(x.key), ': ', htmlAttrEnc(expr, true))
      },
      between: () => out.push(", "),
      end: () => out.push("}'")
    })
    const [styleExpr, styleStatic] = partition(style, x => x.isExprFinal)
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
        const expr = !x.isExprFinal ? JSON.stringify(x.value) : x.value
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
          out.push(" ", x.isExprFinal ? ":" : "", x.key)
          out.push('="', htmlAttrEnc(x.value), '"')
        }
      }
    })
    out.push(">")
    if (node.innerHtml) out.push(node.innerHtml)
  }
  for (const c of node.children) {
    const lines = nodeToVue(c).split("\n")
    out.push(...lines.map(l => `\n  ${l}`))
  }
  if (node.children.length) out.push("\n")
  if (!["html", "img", "link", "br", "hr", "input"].includes(node.tag.toLowerCase())) out.push(`</${node.tag}>`)
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