/*
// - First while we have the order, do the > operator. Wherever you find it, split off words into a new child node, the first word is the tag name, and then put all our children into the child node.
// - Handle Vue syntax of calculated words for now -- :foo
//- Parse .classes and #ids out of the tag name
//    - Later we can have a single argument using div:arg, might be useful for flexes. Can also do tag@arg, etc. Might be useful for position.
// - Recognize CSS shorthand, convert to real property names, beginning with "style_"
// - Recognize CSS properties, add "style_"
// - Additional macros: mx/my/px/py/sz/circ
// - Flex 'fx' macro: fx=<optional ! to reverse direction><optional pipe or hyphen to set direction><optional justify-content><optional period followed by align-items><optional period followed by align-content>
// - Custom tag types: d/s/f/ib
// - For compatibility reasons, recognize fr/fc for column/row flex
// - Custom values for 'display'
// - Custom values for numeric units ending in 'q'
// Recognize ".foo.bar" and convert to separate words
- 
*/

import { VugNode, VugWord } from "./parsing"

let v1compat = true

function clone(node: VugNode, changes: Record<string, string>) {
    // TODO: throw if overwriting an isExpr word, I think
    const ks = Object.keys(changes).filter(x => x !== "tag")
    return new VugNode(changes.tag || node.tag, [...node.words.filter(w => changes[w.key] === undefined /*whereas null will blank it*/), ...ks.filter(k => changes[k] !== null).map(k => new VugWord(k, changes[k], false))])
}
function wordTransformer(fn: (w: VugWord) => VugWord) {
    return (n: VugNode) => new VugNode(n.tag, n.words.map(w => fn(w)), n.children)
}
export function runAll(node: VugNode): VugNode {
    node = directChild(node)
    node = tagNameParser(node)
    node = customTagTypes(node)
    node = basicCssMacros(node)
    node = flexMacroFx(node)
    node = cssShorthand(node)
    node = cssRecognize(node)
    node = quickUnits(node)
    return new VugNode(node.tag, node.words, node.children.map(c => runAll(c)))
}

const imbaDict: Record<string, string> = { ac: "align-content", ai: "align-items", as: "align-self", b: "bottom", bc: "border-color", bcb: "border-bottom-color", bcl: "border-left-color", bcr: "border-right-color", bct: "border-top-color", bd: "border", bdb: "border-bottom", bdl: "border-left", bdr: "border-right", bdt: "border-top", bg: "background", bga: "background-attachment", bgc: "background-color", bgclip: "background-clip", bcgi: "background-image", bgo: "background-origin", bgp: "background-position", bgr: "background-repeat", bgs: "background-size", bs: "border-style", bsb: "border-bottom-style", bsl: "border-left-style", bsr: "border-right-style", bst: "border-top-style", bw: "border-width", bwb: "border-bottom-width", bwl: "border-left-width", bwr: "border-right-width", bwt: "border-top-width", c: "color", cg: "column-gap", d: "display", e: "ease", ec: "ease-colors", eo: "ease-opacity", et: "ease-transform", ff: "font-family", fl: "flex", flb: "flex-basis", fld: "flex-direction", flf: "flex-flow", flg: "flex-grow", fls: "flex-shrink", flw: "flex-wrap", fs: "font-size", fw: "font-weight", g: "gap", ga: "grid-area", gac: "grid-auto-columns", gaf: "grid-auto-flow", gar: "grid-auto-rows", gc: "grid-column", gce: "grid-column-end", gcg: "grid-column-gap", gcs: "grid-column-start", gr: "grid-row", gre: "grid-row-end", grg: "grid-row-gap", grs: "grid-row-start", gt: "grid-template", gta: "grid-template-areas", gtc: "grid-template-columns", gtr: "grid-template-rows", h: "height", jac: "place-content", jai: "place-items", jas: "place-self", jc: "justify-content", ji: "justify-items", js: "justify-self", l: "left", lh: "line-height", ls: "letter-spacing", m: "margin", mb: "margin-bottom", ml: "margin-left", mr: "margin-right", mt: "margin-top", o: "opacity", of: "overflow", ofa: "overflow-anchor", ofx: "overflow-x", ofy: "overflow-y", origin: "transform-origin", p: "padding", pb: "padding-bottom", pe: "pointer-events", pl: "padding-left", pos: "position", pr: "padding-right", pt: "padding-top", r: "right", rd: "border-radius", rdbl: "border-bottom-left-radius", rdbr: "border-bottom-right-radius", rdtl: "border-top-left-radius", rdtr: "border-top-right-radius", rg: "row-gap", shadow: "box-shadow", t: "top", ta: "text-align", td: "text-decoration", tdc: "text-decoration-color", tdl: "text-decoration-line", tds: "text-decoration-style", tdsi: "text-decoration-skip-ink", tdt: "text-decoration-thickness", te: "text-emphasis", tec: "text-emphasis-color", tep: "text-emphasis-position", tes: "text-emphasis-style", ts: "text-shadow", tt: "text-transform", tween: "transition", us: "user-select", va: "vertical-align", w: "width", ws: "white-space", zi: "z-index" }
const cssShorthand = wordTransformer(w => imbaDict[w.key] ? new VugWord(`style_${imbaDict[w.key]}`, w.value, w.isExpr) : w)

const cssProperties = "--*|-webkit-line-clamp|accent-color|align-content|align-items|align-self|alignment-baseline|all|animation|animation-delay|animation-direction|animation-duration|animation-fill-mode|animation-iteration-count|animation-name|animation-play-state|animation-timing-function|appearance|aspect-ratio|azimuth|backface-visibility|background|background-attachment|background-blend-mode|background-clip|background-color|background-image|background-origin|background-position|background-repeat|background-size|baseline-shift|baseline-source|block-ellipsis|block-size|block-step|block-step-align|block-step-insert|block-step-round|block-step-size|bookmark-label|bookmark-level|bookmark-state|border|border-block|border-block-color|border-block-end|border-block-end-color|border-block-end-style|border-block-end-width|border-block-start|border-block-start-color|border-block-start-style|border-block-start-width|border-block-style|border-block-width|border-bottom|border-bottom-color|border-bottom-left-radius|border-bottom-right-radius|border-bottom-style|border-bottom-width|border-boundary|border-collapse|border-color|border-end-end-radius|border-end-start-radius|border-image|border-image-outset|border-image-repeat|border-image-slice|border-image-source|border-image-width|border-inline|border-inline-color|border-inline-end|border-inline-end-color|border-inline-end-style|border-inline-end-width|border-inline-start|border-inline-start-color|border-inline-start-style|border-inline-start-width|border-inline-style|border-inline-width|border-left|border-left-color|border-left-style|border-left-width|border-radius|border-right|border-right-color|border-right-style|border-right-width|border-spacing|border-start-end-radius|border-start-start-radius|border-style|border-top|border-top-color|border-top-left-radius|border-top-right-radius|border-top-style|border-top-width|border-width|bottom|box-decoration-break|box-shadow|box-sizing|box-snap|break-after|break-before|break-inside|caption-side|caret|caret-color|caret-shape|chains|clear|clip|clip-path|clip-rule|color|color-adjust|color-interpolation-filters|color-scheme|column-count|column-fill|column-gap|column-rule|column-rule-color|column-rule-style|column-rule-width|column-span|column-width|columns|contain|contain-intrinsic-block-size|contain-intrinsic-height|contain-intrinsic-inline-size|contain-intrinsic-size|contain-intrinsic-width|container|container-name|container-type|content|content-visibility|continue|counter-increment|counter-reset|counter-set|cue|cue-after|cue-before|cursor|direction|display|dominant-baseline|elevation|empty-cells|fill|fill-break|fill-color|fill-image|fill-opacity|fill-origin|fill-position|fill-repeat|fill-rule|fill-size|filter|flex|flex-basis|flex-direction|flex-flow|flex-grow|flex-shrink|flex-wrap|float|float-defer|float-offset|float-reference|flood-color|flood-opacity|flow|flow-from|flow-into|font|font-family|font-feature-settings|font-kerning|font-language-override|font-optical-sizing|font-palette|font-size|font-size-adjust|font-stretch|font-style|font-synthesis|font-synthesis-small-caps|font-synthesis-style|font-synthesis-weight|font-variant|font-variant-alternates|font-variant-caps|font-variant-east-asian|font-variant-emoji|font-variant-ligatures|font-variant-numeric|font-variant-position|font-variation-settings|font-weight|footnote-display|footnote-policy|forced-color-adjust|gap|glyph-orientation-vertical|grid|grid-area|grid-auto-columns|grid-auto-flow|grid-auto-rows|grid-column|grid-column-end|grid-column-start|grid-row|grid-row-end|grid-row-start|grid-template|grid-template-areas|grid-template-columns|grid-template-rows|hanging-punctuation|height|hyphenate-character|hyphenate-limit-chars|hyphenate-limit-last|hyphenate-limit-lines|hyphenate-limit-zone|hyphens|image-orientation|image-rendering|image-resolution|initial-letter|initial-letter-align|initial-letter-wrap|inline-size|inline-sizing|input-security|inset|inset-block|inset-block-end|inset-block-start|inset-inline|inset-inline-end|inset-inline-start|isolation|justify-content|justify-items|justify-self|leading-trim|left|letter-spacing|lighting-color|line-break|line-clamp|line-grid|line-height|line-height-step|line-padding|line-snap|list-style|list-style-image|list-style-position|list-style-type|margin|margin-block|margin-block-end|margin-block-start|margin-bottom|margin-break|margin-inline|margin-inline-end|margin-inline-start|margin-left|margin-right|margin-top|margin-trim|marker|marker-end|marker-knockout-left|marker-knockout-right|marker-mid|marker-pattern|marker-segment|marker-side|marker-start|mask|mask-border|mask-border-mode|mask-border-outset|mask-border-repeat|mask-border-slice|mask-border-source|mask-border-width|mask-clip|mask-composite|mask-image|mask-mode|mask-origin|mask-position|mask-repeat|mask-size|mask-type|max-block-size|max-height|max-inline-size|max-lines|max-width|min-block-size|min-height|min-inline-size|min-intrinsic-sizing|min-width|mix-blend-mode|nav-down|nav-left|nav-right|nav-up|object-fit|object-position|offset|offset-anchor|offset-distance|offset-path|offset-position|offset-rotate|opacity|order|orphans|outline|outline-color|outline-offset|outline-style|outline-width|overflow|overflow-anchor|overflow-block|overflow-clip-margin|overflow-inline|overflow-wrap|overflow-x|overflow-y|overscroll-behavior|overscroll-behavior-block|overscroll-behavior-inline|overscroll-behavior-x|overscroll-behavior-y|padding|padding-block|padding-block-end|padding-block-start|padding-bottom|padding-inline|padding-inline-end|padding-inline-start|padding-left|padding-right|padding-top|page|page-break-after|page-break-before|page-break-inside|pause|pause-after|pause-before|perspective|perspective-origin|pitch|pitch-range|place-content|place-items|place-self|play-during|pointer-events|position|print-color-adjust|property-name|quotes|region-fragment|resize|rest|rest-after|rest-before|richness|right|rotate|row-gap|ruby-align|ruby-merge|ruby-overhang|ruby-position|running|scale|scroll-behavior|scroll-margin|scroll-margin-block|scroll-margin-block-end|scroll-margin-block-start|scroll-margin-bottom|scroll-margin-inline|scroll-margin-inline-end|scroll-margin-inline-start|scroll-margin-left|scroll-margin-right|scroll-margin-top|scroll-padding|scroll-padding-block|scroll-padding-block-end|scroll-padding-block-start|scroll-padding-bottom|scroll-padding-inline|scroll-padding-inline-end|scroll-padding-inline-start|scroll-padding-left|scroll-padding-right|scroll-padding-top|scroll-snap-align|scroll-snap-stop|scroll-snap-type|scrollbar-color|scrollbar-gutter|scrollbar-width|shape-image-threshold|shape-inside|shape-margin|shape-outside|spatial-navigation-action|spatial-navigation-contain|spatial-navigation-function|speak|speak-as|speak-header|speak-numeral|speak-punctuation|speech-rate|stress|string-set|stroke|stroke-align|stroke-alignment|stroke-break|stroke-color|stroke-dash-corner|stroke-dash-justify|stroke-dashadjust|stroke-dasharray|stroke-dashcorner|stroke-dashoffset|stroke-image|stroke-linecap|stroke-linejoin|stroke-miterlimit|stroke-opacity|stroke-origin|stroke-position|stroke-repeat|stroke-size|stroke-width|tab-size|table-layout|text-align|text-align-all|text-align-last|text-combine-upright|text-decoration|text-decoration-color|text-decoration-line|text-decoration-skip|text-decoration-skip-box|text-decoration-skip-ink|text-decoration-skip-inset|text-decoration-skip-self|text-decoration-skip-spaces|text-decoration-style|text-decoration-thickness|text-edge|text-emphasis|text-emphasis-color|text-emphasis-position|text-emphasis-skip|text-emphasis-style|text-group-align|text-indent|text-justify|text-orientation|text-overflow|text-shadow|text-space-collapse|text-space-trim|text-spacing|text-transform|text-underline-offset|text-underline-position|text-wrap|top|transform|transform-box|transform-origin|transform-style|transition|transition-delay|transition-duration|transition-property|transition-timing-function|translate|unicode-bidi|user-select|vertical-align|visibility|voice-balance|voice-duration|voice-family|voice-pitch|voice-range|voice-rate|voice-stress|voice-volume|volume|white-space|widows|width|will-change|word-boundary-detection|word-boundary-expansion|word-break|word-spacing|word-wrap|wrap-after|wrap-before|wrap-flow|wrap-inside|wrap-through|writing-mode|z-index".split("|")
const cssRecognize = wordTransformer(w => cssProperties.includes(w.key) ? new VugWord(`style_${w.key}`, w.value, w.isExpr) : w)

function customTagTypes(n: VugNode): VugNode {
    if (n.tag === 'd') return clone(n, { tag: "div" })
    if (n.tag === 's') return clone(n, { tag: "span" })
    if (n.tag === 'f' || n.tag === 'flex') return clone(n, { tag: "div", style_display: "flex", fx: n.getWord("_mainArg"), _mainArg: null })
    if (v1compat && n.tag === 'fr') return clone(n, { tag: "div", style_display: "flex", 'style_flex-direction': 'row' })
    if (v1compat && n.tag === 'fc') return clone(n, { tag: "div", style_display: "flex", 'style_flex-direction': 'column' })
    if (n.tag === 'ib'|| n.tag === 'inline-block') return clone(n, { tag: "div", style_display: "inline-block" })
    return n
}

const quickUnits = wordTransformer(w => (w.key.startsWith("style_") && !w.isExpr && /^-?([0-9]*\.)?[0-9]+q$/.test(w.value)) ? new VugWord(w.key, parseFloat(w.value) * 0.25 + 'rem', false) : w) // Support the "q" numeric unit which is 0.25rem, similar to Bootstrap

const cssDisplayShorthand = { b: "block",  i: "inline", f: "flex", g: "grid", ib: "inline-block", if: "inline-flex", ig: "inline-grid" }
function basicCssMacros(n: VugNode) {
    const words = n.words.flatMap(w => 
        w.key === "sz" ? [new VugWord("style_width", w.value, w.isExpr), new VugWord("style_height", w.value, w.isExpr)]  :
        w.key === "px" ? [new VugWord("style_padding-left", w.value, w.isExpr), new VugWord("style_padding-right", w.value, w.isExpr)]  :
        w.key === "py" ? [new VugWord("style_padding-top", w.value, w.isExpr), new VugWord("style_padding-bottom", w.value, w.isExpr)]  :
        w.key === "mx" ? [new VugWord("style_margin-left", w.value, w.isExpr), new VugWord("style_margin-right", w.value, w.isExpr)]  :
        w.key === "my" ? [new VugWord("style_margin-top", w.value, w.isExpr), new VugWord("style_margin-bottom", w.value, w.isExpr)]  :
        (w.key === "circ" && !w.value && !w.isExpr) ? [new VugWord("style_border-radius", "100%", w.isExpr)]  :
        // TODO not sure I want this, perhaps just use tag types, except b/i/if conflict, but can use full form for those.
        // Or can use mainArg
        (v1compat && w.key === "d" && !w.isExpr) ? [new VugWord("style_display", cssDisplayShorthand[w.value] || w.value, w.isExpr)]  :
        [w]
    )
    return new VugNode(n.tag, words, n.children)
}

function flexMacroFx(n: VugNode): VugNode {
    let value = n.getWordErrIfCalc("fx")
    if (!value) return n
    
    // Direction
    let reverse = false, row = false, column = false
    if (value[0] === "!") { reverse = true; value = value.slice(1) }
    if (value[0] === "|") { column = true; value = value.slice(1) }
    if (value[0] === "-") { row = true; value = value.slice(1) }
    if (value[0] === "!") { reverse = true; value = value.slice(1) }    
    let direction = column ? 'column' : (reverse || row) ? 'row' : '' // If reverse was specified, we have to specify row (which is the default)
    if (reverse) direction += "-reverse"
    const obj: any = { fx: null, display: 'flex' }
    if (direction) obj['style_flex-direction'] = direction
    
    // Alignment etc
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
    const [jc, ai, ac] = value.split(".").map(x => flexAlignmentShorthands[x] || x)
    if (jc) obj['style_justify-content'] = jc
    if (ai) obj['style_align-items'] = ai
    if (ac) obj['style_align-content'] = ac

    return clone(n, obj)
}

function tagNameParser(n: VugNode): VugNode {
    const [first, ...args] = n.tag.split(":")
    const parts = first.split('').reduce((list,char) => {
        if (/[A-Za-z0-9_|\-]/.test(char)) list.slice(-1)[0].text += char
        else list.push({ prefix: char, text: "" }) //TODO allow double prefixes
        return list
    }, [{ text: '', prefix: '' }]).filter(x => x.text)
    const tag = parts.filter(x => !x.prefix)[0]?.text || 'div'
    const classes = parts.filter(x => x.prefix === '.').map(x => x.text)
    const ids = parts.filter(x => x.prefix === '#').map(x => x.text)
    if (ids.length > 1) throw `Can't have more than 1 ID in tag name: '${n.tag}'`
    // TODO ensure we recognize all parts
    const words = n.words.slice()
    for (const w of classes) words.push(new VugWord("." + w, '', false))
    for (const w of ids) words.push(new VugWord("id", w, false))
    for (const w of args) words.push(new VugWord("_mainArg", w, false))
    return new VugNode(tag, words, n.children)
}
function directChild(n: VugNode): VugNode {
    const indOfArrow = n.words.findIndex(x => x.key === ">")
    if (indOfArrow < 0) return n
    const secondTagName = n.words[indOfArrow + 1].key // TODO ensure no value
    const secondTagWords = n.words.slice(indOfArrow + 2)
    const firstTagWords = n.words.slice(0, indOfArrow)
    return new VugNode(n.tag, firstTagWords, [new VugNode(secondTagName, secondTagWords, n.children.slice())])
}
