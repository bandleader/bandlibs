import { partition } from "../utils"
import { VugNode } from "./parsing"

export function emitVueTemplate(node: VugNode, whitespace = false) {
    const out: string[] = []
    if (node.tag === '_html') {
      out.push(node.getWord("_contents") || "")
    } else {
      out.push('<', node.tag)
      const htmlAttrEnc = (x: string, usingApos = false) => x.replace(usingApos ? /'/g : /"/g, usingApos ? '&#x27;' : '&quot;')//.replace(/&/g, '&amp;').replace(/>/g, '&gt;')
      const block = function <T>(items: T[], funcs: { start?: Function, end?: Function, between?: Function, each: (x: T, i: number) => void }) { if (!items.length) return; funcs.start?.(); items.forEach((x, i) => { if (i) funcs.between?.(); funcs.each(x, i) }); funcs.end?.() }
      const [style, klass, attr] = partition(node.words, x => x.key.startsWith("style_") ? 0 : x.key.startsWith(".") ? 1 : 2, 3)
      const [classExpr, classStatic] = partition(klass, x => x.isExpr)
      block(classStatic, {
        start: () => out.push(' class="'),
        each: x => { out.push(x.key.slice(1)); if (x.value) throw "CSS-Class attributes cannot have a static value. For a condition, use curly braces or simply no quotes. -- : " + x.key },
        between: () => out.push(" "),
        end: () => out.push('"')
      })
      block(classExpr, {
        start: () => out.push(" :class='{"),
        each: x => {
          const expr = x.value === undefined ? 'true' : !x.isExpr ? JSON.stringify(x.value) : x.value
          out.push(JSON.stringify(x.key.slice(1)), ': ', htmlAttrEnc(expr, true))
        },
        between: () => out.push(", "),
        end: () => out.push("}'")
      })
      const [styleExpr, styleStatic] = partition(style, x => x.isExpr)
      block(styleStatic, {
        start: () => out.push(' style="'),
        each: x => out.push(x.key.slice(6), ": ", x.value!),
        between: () => out.push("; "),
        end: () => out.push('"')
      })
      block(styleExpr, {
        start: () => out.push(" :style='{"),
        each: x => {
          if (x.value === undefined) throw "Style keys must have a value: " + x.key.slice(6)
          const expr = !x.isExpr ? JSON.stringify(x.value) : x.value
          out.push(JSON.stringify(x.key.slice(6)), ': ', htmlAttrEnc(expr, true))
        },
        between: () => out.push(", "),
        end: () => out.push("}'")
      })
      block(attr, {
        each: x => {
          if (x.value === undefined) {
            out.push(" ", x.key)
          } else {
            const needsColon = x.isExpr && !x.key.startsWith("v-") && !x.key.startsWith("x-")
            out.push(" ", needsColon ? ":" : "", x.key)
            out.push('="', htmlAttrEnc(x.value), '"')
          }
        }
      })
      out.push(">")
    }
    if (node.children.length) {
        const needsIndent = whitespace && (node.children.length > 1 || (node.children[0] && (node.children[0].tag !== "_html" || (node.children[0].getWord("_contents") || '').includes('\n'))))
        if (needsIndent) out.push("\n")
        for (const c of node.children) {
            if (needsIndent && c !== node.children[0]) out.push("\n")
            let txt = emitVueTemplate(c, whitespace)
            if (needsIndent) txt = txt.split("\n").map(l => `  ${l}`).join('\n') // Indent
            out.push(txt)
        }
        if (needsIndent) out.push("\n")
    }
    // Close tags except for 'void tags'. That includes '_html' because that's my element for raw HTML
    if (!["_html", "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"].includes(node.tag.toLowerCase())) out.push(`</${node.tag}>`)
    return out.join("")
}