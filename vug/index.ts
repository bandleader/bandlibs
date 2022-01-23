export type VugAttr = { key: string, value?: string, isExpr: boolean, isLiteral: boolean, kind: string }
export type VugNode = { tag: string, attrs: VugAttr[], innerHtml?: string, children: VugNode[] }

function compile(text: string) {
  const nodes = text.replace(/\t/g, "        ") // Convert tabs to 8 spaces, like Python 2. People shouldn't mix tabs and spaces anyway
    .split("\n").filter(x => x.trim())
    .map(t => ({ text: t.trim(), indent: t.length - t.trimStart().length }))
    .map(info => ({ ...processLine(info.text), info }))
  return childize(nodes, x => x.info.indent)
}

function splitTwo(text: string, sep: string) {
  const pos = text.indexOf(sep)
  if (pos < 0) return [text]
  return [text.substr(0, pos), text.substr(pos + sep.length)]
}

function ourCssShorthand(key: string) {
  const dict: Record<string, string> = {
    w: "width",
    h: "height",
    m: "margin",
    p: "padding",
    l: "left",
    r: "right",
    b: "bottom",
    t: "top",
    f: "font",
    bd: "border",
    bg: "background",
    pos: "position",
    d: "display",
    fw: "font-weight",
    ff: "font-family",
    fs: "font-size",
  }
  const result = key.split("-").map(w => dict[w] || w).join("-")
  return cssProperties.includes(result) ? result : key
}

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

function macros(key: string, value: string): Record<string, string> | null {
  if (key === "px") return { 'padding-left': value, 'padding-right': value }
  else if (key === "py") return { 'padding-top': value, 'padding-bottom': value }
  else if (key === "mx") return { 'margin-left': value, 'margin-right': value }
  else if (key === "my") return { 'margin-top': value, 'margin-bottom': value }
  else if (key === "size") return { 'width': value, 'height': value }

  else if (key === "display" && value === "b") return { display: "block" }
  else if (key === "display" && value === "i") return { display: "inline" }
  else if (key === "display" && value === "ib") return { display: "inline-block" }
  else if (key === "display" && value === "f") return { display: "flex" }
  else if (key === "display" && value === "if") return { display: "inline-flex" }
  
  // Commented out because this will require a further transform later to unify all the 'transform-___' attrs. Note also that some can be exprs and some not
  // const transformFuncs = "matrix|matrix3d|perspective|rotate|rotate3d|rotateX|rotateY|rotateZ|scale|scale3d|scaleX|scaleY|scaleZ|skew|skewX|skewY|translate|translate3d|translateX|translateY|translateZ|transform3d|matrix|matrix3d|perspective|rotate|rotate3d|rotateX|rotateY|rotateZ|scale|scale3d|scaleX|scaleY|scaleZ|skew|skewX|skewY|translate|translate3d|translateX|translateY|translateZ".split("|")
  // if (transformFuncs.includes(key)) return { ['transform-' + key]: value }

  return { [key]: value }
}

function processLine(line: string): VugNode {
  line = splitTwo(line, "// ")[0] // ignore comments
  if (line.startsWith("<")) line = "-- " + line //return { tag: "html", attrs: [], innerHtml: line, children: [] }
  if (line.startsWith("-- ")) line = " " + line // so that it gets detected
  const [wordPart, innerHtml] = splitTwo(line, " -- ").map(x => x.trim())
  const [tagPart, ...words] = wordPart.match(/(?=\S)[^"\s]*(?:"[^\\"]*(?:\\[\s\S][^\\"]*)*"[^"\s]*)*/g) || [''] // Not 100% sufficient. From https://stackoverflow.com/questions/4031900/split-a-string-by-whitespace-keeping-quoted-segments-allowing-escaped-quotes
  const [__tag, ...classesAttachedToTag] = tagPart.split(".")
  const [_tag, id] = __tag.split("#")
  let tag = _tag || ((classesAttachedToTag.length || wordPart.length) ? 'div' : 'html') // html for lines with no tag only innerHtml
  if (tag === "d") tag = "div"
  if (tag === "s") tag = "span"
  if (tag === "f") { tag = "div"; words.push("display=flex") } // experimental
  for (const x of classesAttachedToTag) { words.push("." + x) }
  if (id) words.push("id=" + id)
  const attrs: VugAttr[] = []
  for (const x of words) {
    let [_key, _value] = splitTwo(x, "=")
    let isExpr = false, isLiteral = false, kind = "attr"
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
      attrs.push({ key, value: value || undefined, isLiteral, isExpr, kind })
    }
  }
  return { tag, attrs, innerHtml: innerHtml || undefined, children: [] }
}
export function load(text: string) {
  const nodes = compile(text)
  const toVueTemplate = (whitespace = false) => nodes.map(x => nodeToVue(x, whitespace)).join(whitespace ? "\n" : "")
  return { ast: nodes, toVueTemplate }
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
    let lines = nodeToVue(c, whitespace)
    if (whitespace) lines = lines.split("\n").map(l => `\n  ${l}`).join("\n")
    out.push(...lines)
  }
  if (whitespace && node.children.length) out.push("\n")
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
