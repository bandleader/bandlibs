export type VugAttr = { key: string, value?: string, isExpr: boolean, kind: string }
export type VugNode = { tag: string, attrs: VugAttr[], innerHtml?: string, children: VugNode[] }

function compile(text: string) {
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

// function ourCssShorthand(key: string) {
//   const dict: Record<string, string> = {
//     w: "width",
//     h: "height",
//     m: "margin",
//     p: "padding",
//     l: "left",
//     r: "right",
//     b: "bottom",
//     t: "top",
//     f: "font",
//     bd: "border",
//     bg: "background",
//     pos: "position",
//     d: "display",
//     fw: "font-weight",
//     ff: "font-family",
//     fs: "font-size",
//   }
//   const result = key.split("-").map(w => dict[w] || w).join("-")
//   return cssProperties.includes(result) ? result : key
// }

function imbaCssShorthand(key: string) {
  const dict: Record<string, string> = {
    ac: "align-content",
    ai: "align-items",
    as: "align-self",
    b: "bottom",
    bc: "border-color",
    bcb: "border-bottom-color",
    bcl: "border-left-color",
    bcr: "border-right-color",
    bct: "border-top-color",
    bd: "border",
    bdb: "border-bottom",
    bdl: "border-left",
    bdr: "border-right",
    bdt: "border-top",
    bg: "background",
    bga: "background-attachment",
    bgc: "background-color",
    bgclip: "background-clip",
    bcgi: "background-image",
    bgo: "background-origin",
    bgp: "background-position",
    bgr: "background-repeat",
    bgs: "background-size",
    bs: "border-style",
    bsb: "border-bottom-style",
    bsl: "border-left-style",
    bsr: "border-right-style",
    bst: "border-top-style",
    bw: "border-width",
    bwb: "border-bottom-width",
    bwl: "border-left-width",
    bwr: "border-right-width",
    bwt: "border-top-width",
    c: "color",
    cg: "column-gap",
    d: "display",
    e: "ease",
    ec: "ease-colors",
    eo: "ease-opacity",
    et: "ease-transform",
    ff: "font-family",
    fl: "flex",
    flb: "flex-basis",
    fld: "flex-direction",
    flf: "flex-flow",
    flg: "flex-grow",
    fls: "flex-shrink",
    flw: "flex-wrap",
    fs: "font-size",
    fw: "font-weight",
    g: "gap",
    ga: "grid-area",
    gac: "grid-auto-columns",
    gaf: "grid-auto-flow",
    gar: "grid-auto-rows",
    gc: "grid-column",
    gce: "grid-column-end",
    gcg: "grid-column-gap",
    gcs: "grid-column-start",
    gr: "grid-row",
    gre: "grid-row-end",
    grg: "grid-row-gap",
    grs: "grid-row-start",
    gt: "grid-template",
    gta: "grid-template-areas",
    gtc: "grid-template-columns",
    gtr: "grid-template-rows",
    h: "height",
    jac: "place-content",
    jai: "place-items",
    jas: "place-self",
    jc: "justify-content",
    ji: "justify-items",
    js: "justify-self",
    l: "left",
    lh: "line-height",
    ls: "letter-spacing",
    m: "margin",
    mb: "margin-bottom",
    ml: "margin-left",
    mr: "margin-right",
    mt: "margin-top",
    o: "opacity",
    of: "overflow",
    ofa: "overflow-anchor",
    ofx: "overflow-x",
    ofy: "overflow-y",
    origin: "transform-origin",
    p: "padding",
    pb: "padding-bottom",
    pe: "pointer-events",
    pl: "padding-left",
    pos: "position",
    pr: "padding-right",
    pt: "padding-top",
    r: "right",
    rd: "border-radius",
    rdbl: "border-bottom-left-radius",
    rdbr: "border-bottom-right-radius",
    rdtl: "border-top-left-radius",
    rdtr: "border-top-right-radius",
    rg: "row-gap",
    shadow: "box-shadow",
    t: "top",
    ta: "text-align",
    td: "text-decoration",
    tdc: "text-decoration-color",
    tdl: "text-decoration-line",
    tds: "text-decoration-style",
    tdsi: "text-decoration-skip-ink",
    tdt: "text-decoration-thickness",
    te: "text-emphasis",
    tec: "text-emphasis-color",
    tep: "text-emphasis-position",
    tes: "text-emphasis-style",
    ts: "text-shadow",
    tt: "text-transform",
    tween: "transition",
    us: "user-select",
    va: "vertical-align",
    w: "width",
    ws: "white-space",
    zi: "z-index",
  }
  return dict[key] || key
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
export function load(text: string) {
  const nodes = compile(text)
  const toVueTemplate = (whitespace = false) => nodes.map(x => nodeToVue(x, whitespace)).join(whitespace ? "\n" : "")
  return { ast: nodes, toVueTemplate, toRenderFunc: () => toRenderFunc(nodes[0]) }
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

const cssProperties = "--*|-webkit-line-clamp|accent-color|align-content|align-items|align-self|alignment-baseline|all|animation|animation-delay|animation-direction|animation-duration|animation-fill-mode|animation-iteration-count|animation-name|animation-play-state|animation-timing-function|appearance|aspect-ratio|azimuth|backface-visibility|background|background-attachment|background-blend-mode|background-clip|background-color|background-image|background-origin|background-position|background-repeat|background-size|baseline-shift|baseline-source|block-ellipsis|block-size|block-step|block-step-align|block-step-insert|block-step-round|block-step-size|bookmark-label|bookmark-level|bookmark-state|border|border-block|border-block-color|border-block-end|border-block-end-color|border-block-end-style|border-block-end-width|border-block-start|border-block-start-color|border-block-start-style|border-block-start-width|border-block-style|border-block-width|border-bottom|border-bottom-color|border-bottom-left-radius|border-bottom-right-radius|border-bottom-style|border-bottom-width|border-boundary|border-collapse|border-color|border-end-end-radius|border-end-start-radius|border-image|border-image-outset|border-image-repeat|border-image-slice|border-image-source|border-image-width|border-inline|border-inline-color|border-inline-end|border-inline-end-color|border-inline-end-style|border-inline-end-width|border-inline-start|border-inline-start-color|border-inline-start-style|border-inline-start-width|border-inline-style|border-inline-width|border-left|border-left-color|border-left-style|border-left-width|border-radius|border-right|border-right-color|border-right-style|border-right-width|border-spacing|border-start-end-radius|border-start-start-radius|border-style|border-top|border-top-color|border-top-left-radius|border-top-right-radius|border-top-style|border-top-width|border-width|bottom|box-decoration-break|box-shadow|box-sizing|box-snap|break-after|break-before|break-inside|caption-side|caret|caret-color|caret-shape|chains|clear|clip|clip-path|clip-rule|color|color-adjust|color-interpolation-filters|color-scheme|column-count|column-fill|column-gap|column-rule|column-rule-color|column-rule-style|column-rule-width|column-span|column-width|columns|contain|contain-intrinsic-block-size|contain-intrinsic-height|contain-intrinsic-inline-size|contain-intrinsic-size|contain-intrinsic-width|container|container-name|container-type|content|content-visibility|continue|counter-increment|counter-reset|counter-set|cue|cue-after|cue-before|cursor|direction|display|dominant-baseline|elevation|empty-cells|fill|fill-break|fill-color|fill-image|fill-opacity|fill-origin|fill-position|fill-repeat|fill-rule|fill-size|filter|flex|flex-basis|flex-direction|flex-flow|flex-grow|flex-shrink|flex-wrap|float|float-defer|float-offset|float-reference|flood-color|flood-opacity|flow|flow-from|flow-into|font|font-family|font-feature-settings|font-kerning|font-language-override|font-optical-sizing|font-palette|font-size|font-size-adjust|font-stretch|font-style|font-synthesis|font-synthesis-small-caps|font-synthesis-style|font-synthesis-weight|font-variant|font-variant-alternates|font-variant-caps|font-variant-east-asian|font-variant-emoji|font-variant-ligatures|font-variant-numeric|font-variant-position|font-variation-settings|font-weight|footnote-display|footnote-policy|forced-color-adjust|gap|glyph-orientation-vertical|grid|grid-area|grid-auto-columns|grid-auto-flow|grid-auto-rows|grid-column|grid-column-end|grid-column-start|grid-row|grid-row-end|grid-row-start|grid-template|grid-template-areas|grid-template-columns|grid-template-rows|hanging-punctuation|height|hyphenate-character|hyphenate-limit-chars|hyphenate-limit-last|hyphenate-limit-lines|hyphenate-limit-zone|hyphens|image-orientation|image-rendering|image-resolution|initial-letter|initial-letter-align|initial-letter-wrap|inline-size|inline-sizing|input-security|inset|inset-block|inset-block-end|inset-block-start|inset-inline|inset-inline-end|inset-inline-start|isolation|justify-content|justify-items|justify-self|leading-trim|left|letter-spacing|lighting-color|line-break|line-clamp|line-grid|line-height|line-height-step|line-padding|line-snap|list-style|list-style-image|list-style-position|list-style-type|margin|margin-block|margin-block-end|margin-block-start|margin-bottom|margin-break|margin-inline|margin-inline-end|margin-inline-start|margin-left|margin-right|margin-top|margin-trim|marker|marker-end|marker-knockout-left|marker-knockout-right|marker-mid|marker-pattern|marker-segment|marker-side|marker-start|mask|mask-border|mask-border-mode|mask-border-outset|mask-border-repeat|mask-border-slice|mask-border-source|mask-border-width|mask-clip|mask-composite|mask-image|mask-mode|mask-origin|mask-position|mask-repeat|mask-size|mask-type|max-block-size|max-height|max-inline-size|max-lines|max-width|min-block-size|min-height|min-inline-size|min-intrinsic-sizing|min-width|mix-blend-mode|nav-down|nav-left|nav-right|nav-up|object-fit|object-position|offset|offset-anchor|offset-distance|offset-path|offset-position|offset-rotate|opacity|order|orphans|outline|outline-color|outline-offset|outline-style|outline-width|overflow|overflow-anchor|overflow-block|overflow-clip-margin|overflow-inline|overflow-wrap|overflow-x|overflow-y|overscroll-behavior|overscroll-behavior-block|overscroll-behavior-inline|overscroll-behavior-x|overscroll-behavior-y|padding|padding-block|padding-block-end|padding-block-start|padding-bottom|padding-inline|padding-inline-end|padding-inline-start|padding-left|padding-right|padding-top|page|page-break-after|page-break-before|page-break-inside|pause|pause-after|pause-before|perspective|perspective-origin|pitch|pitch-range|place-content|place-items|place-self|play-during|pointer-events|position|print-color-adjust|property-name|quotes|region-fragment|resize|rest|rest-after|rest-before|richness|right|rotate|row-gap|ruby-align|ruby-merge|ruby-overhang|ruby-position|running|scale|scroll-behavior|scroll-margin|scroll-margin-block|scroll-margin-block-end|scroll-margin-block-start|scroll-margin-bottom|scroll-margin-inline|scroll-margin-inline-end|scroll-margin-inline-start|scroll-margin-left|scroll-margin-right|scroll-margin-top|scroll-padding|scroll-padding-block|scroll-padding-block-end|scroll-padding-block-start|scroll-padding-bottom|scroll-padding-inline|scroll-padding-inline-end|scroll-padding-inline-start|scroll-padding-left|scroll-padding-right|scroll-padding-top|scroll-snap-align|scroll-snap-stop|scroll-snap-type|scrollbar-color|scrollbar-gutter|scrollbar-width|shape-image-threshold|shape-inside|shape-margin|shape-outside|spatial-navigation-action|spatial-navigation-contain|spatial-navigation-function|speak|speak-as|speak-header|speak-numeral|speak-punctuation|speech-rate|stress|string-set|stroke|stroke-align|stroke-alignment|stroke-break|stroke-color|stroke-dash-corner|stroke-dash-justify|stroke-dashadjust|stroke-dasharray|stroke-dashcorner|stroke-dashoffset|stroke-image|stroke-linecap|stroke-linejoin|stroke-miterlimit|stroke-opacity|stroke-origin|stroke-position|stroke-repeat|stroke-size|stroke-width|tab-size|table-layout|text-align|text-align-all|text-align-last|text-combine-upright|text-decoration|text-decoration-color|text-decoration-line|text-decoration-skip|text-decoration-skip-box|text-decoration-skip-ink|text-decoration-skip-inset|text-decoration-skip-self|text-decoration-skip-spaces|text-decoration-style|text-decoration-thickness|text-edge|text-emphasis|text-emphasis-color|text-emphasis-position|text-emphasis-skip|text-emphasis-style|text-group-align|text-indent|text-justify|text-orientation|text-overflow|text-shadow|text-space-collapse|text-space-trim|text-spacing|text-transform|text-underline-offset|text-underline-position|text-wrap|top|transform|transform-box|transform-origin|transform-style|transition|transition-delay|transition-duration|transition-property|transition-timing-function|translate|unicode-bidi|user-select|vertical-align|visibility|voice-balance|voice-duration|voice-family|voice-pitch|voice-range|voice-rate|voice-stress|voice-volume|volume|white-space|widows|width|will-change|word-boundary-detection|word-boundary-expansion|word-break|word-spacing|word-wrap|wrap-after|wrap-before|wrap-flow|wrap-inside|wrap-through|writing-mode|z-index".split("|")


/*
To get Vug support in Vue templates, there are a few options.
1) Use `ViteTransformPlugin`. In your vite.config.ts, import Vug and then in `plugins`, add Vug.ViteTransformPlugin() to the list.
    It transforms the file before Vite even sends it to the template compiler, so it works well.
    Just add it BEFORE the Vue() plugin -- otherwise Vue will already complain that it doesn't know how to process Vug. (Even though I specified `enforce: "pre"`).
    (Before I figured this out, I used <template vug> instead of <template lang="vug">, and that actually worked quite well.
    THIS IS THE RECOMMENDED OPTION.
    IT IS SIMPLEST.
    It also opens the door to doing fancy stuff later with styles etc.
2) Use `VueConsolidatePlugin` to add Vug as a supported preprocessor. So you can do <template lang="vug">.
    To get vite to use us, however, you have to override the requirer. Change the vue plugin init as follows:
        vue({
          template: {
            preprocessCustomRequire: (lang: string): lang === "vug" ? Vug.VueConsolidatePlugin() : undefined
          }
        }) 
    (See https://github.com/vuejs/core/blob/471f66a1f6cd182f3e106184b2e06f7753382996/packages/compiler-sfc/src/compileTemplate.ts#L124)
    The downside is that this disables all other preprocessors, which is usually fine.
    If you do want to use other ones, you'll have to install consolidate and delegate to it:
        import consolidate from '@vue/consolidate' // requires npm install @vue/consolidate
        preprocessCustomRequire: (lang: string): lang === "vug" ? Vug.VueConsolidatePlugin() : consolidate[lang]
    It would be nice to patch `consolidate` right there in the file, however that didn't work -- @vue/compiler-sfc (which is used by the vue plugin) includes its own copy.
        import consolidate from '@vue/consolidate'
        consolidate['vug'] = Vug.viteRenderer() // no effect :-(
3) You can however simply patch that copy to add support, but that's messy, and won't work on your build server, and will break when you update vite, etc.
    In your `vite.config.ts`:
        globalThis.Vug = Vug
    In `node_modules/@vue/compiler-sfc/dist/compiler-sfc.cjs.js`:
    Look for `exports.pug =` or (any other language), and add this alongside it:
        exports.vug = { render(...args) { globalThis.Vug.VueConsolidatePlugin().render(...args) } }
    (You can't do just `exports.vug = globalThis.Vug.VueConsolidatePlugin()` I think because it runs before you do)
4) You could maybe fake one of the existing packages?
    In your `vite.config.ts`, as before:
        globalThis.Vug = Vug
    In your node_modules create a `plates/index.js` as follows:
        module.exports = { bind: text => globalThis.Vug.load(text).toVueTemplate() }
    That way, when consolidate tries `require('plates')` it'll get your package, and you're following the plates interface. 
    You would still need to make sure that node_modules/plates ends up on your build server too. You could commit it to the repo. You could make a script that writes it on the spot.
*/

export function ViteTransformPlugin() {
  return {
    name: 'vite-plugin-vue-vug',
    enforce: "pre" as const,
    transform(code: string, id: string) {
      if (!id.endsWith(".vue")) return;
      const findTemplateTag = /<template lang=['"]?vug['" >]/g.exec(code)
      if (!findTemplateTag) return;
      const startOfTemplateTag = findTemplateTag.index
      const startOfCode = code.indexOf(">", startOfTemplateTag) + 1
      const endOfCode = code.lastIndexOf("</template>")
      const vugCode = code.substring(startOfCode, endOfCode)
      const output = load(vugCode).toVueTemplate()
      return code.substring(0, startOfTemplateTag) + "<template>" + output + code.substring(endOfCode) // We have to replace the template tag so the SFC compiler doesn't error because it doesn't know how to process Vue
    }
  }
}
export function transformVugReact(code: string) {
  while (true) {
    const ind = code.indexOf("vugReact`")
    if (ind<0) break;
    const end = code.indexOf("`", ind+10)
    let contents = code.substring(ind+9, end)
    
    contents = contents.replace(/@click/g, ':onClick') // temp to support Vue syntax
    let converted = load(contents).toRenderFunc()
    converted = converted.replace(/\{\{/g, '" + ') // temp to support Vue syntax
    converted = converted.replace(/\}\}/g, ' + "') // temp to support Vue syntax

    code = code.slice(0, ind) + converted + code.slice(end+1)
    console.log(code)
  }
  return code
}
export function ViteReactPlugin() {
  return {
    name: 'vite-plugin-react-vug',
    enforce: "pre" as const,
    transform(code: string, id: string) {
      if (!/\.m?(j|t)sx?$/.test(id)) return;
      return transformVugReact(code)
    }
  }
}
export const VueConsolidatePlugin = () => ({
  // Implements Vite's `consolidate` interface: https://github.com/vuejs/core/blob/471f66a1f6cd182f3e106184b2e06f7753382996/packages/compiler-sfc/src/compileTemplate.ts#L89  
  render(code: string, data: object, callback: (err: any, result?: string)=>void) {
    try {
      callback(undefined, load(code).toVueTemplate())
    } catch (e) {
      callback(String(e))
    }
  }  
})
