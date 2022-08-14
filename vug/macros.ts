/* TODO
- input:checkbox etc. But if we're going to parse that as an arg, maybe it conflicts with namespaces.
     - Can use input::checkbox, or a different char like input%checkbox, input+checkbox, input~checkbox, input^checkbox, input$checkbox
- Same for flex:!|c.c etc (note period will need to be renamed to dash)
*/

import { splitThree, VugNode, VugWord } from "./parsing"
import * as Styling from "./styling"

export let v1compat = true

export function clone(node: VugNode, changes: Record<string, string>) {
    // TODO: throw if overwriting an isExpr word, I think
    const ks = Object.keys(changes).filter(x => x !== "tag")
    return new VugNode(changes.tag || node.tag, [...node.words.filter(w => changes[w.key] === undefined /*whereas null will blank it*/), ...ks.filter(k => changes[k] !== null).map(k => new VugWord(k, changes[k], false))], node.children)
}
export function wordTransformer(fn: (w: VugWord) => VugWord) {
    // TODO-OPTIMIZE Can check whether any of the nodes were replaced and if not return the original node... or even only copy the array once something was switched.
    // TODO-OPTIMIZE We can also run all the word transformers in one step, as long as order doesn't matter
    return (n: VugNode) => new VugNode(n.tag, n.words.map(w => fn(w)), n.children)
}
// TODO arg is just right after the first part. foo:<arg>.<mod:inclthis>
// function parseArgsAndModifiers(key: string, chars=".:") {
//     // TODO can use this for tagNameParser too
//     const ret: {prefix: string, text: string}[] = [{prefix: '', text: ''}]
//     for (const ch of key) {
//         const last = ret.slice(-1)[0]
//         if (!chars.includes(ch)) last.text += ch
//         else if (!last.text) last.prefix += ch
//         else ret.push({ prefix: ch, text: '' })
//     }
//     return { key: ret[0].text, args: ret.filter((x,i) => i && x.text) }
// }




// TODO all these can be combined into one pass which also parses the args and modifiers using parseArgsAndModifiers
const styleSheetCssAttrs = (n: VugNode) => {
    /*  Handles css attributes that are to be converted into stylesheet rules (i.e. `css` custom tag, handled later in the pipeline).
            div *bg=green *bg:hover=green
        - TODO maybe don't require the star, do it wherever it has a colon, and for things without colons, do bg:all, bg:css, bg:*, etc.
            - OR if there is anything conditional, put styles on that element in a stylesheet by default, UNLESS overridden by a star, or style-, etc.
            - OR maybe ALWAYS put things in a stylesheet by default, why not? 
    */
    const newCssTags: VugNode[] = []
    const ourWords = n.words.flatMap(w => {
        if (w.key[0] !== '*') return [w]
        if (w.isExpr) throw `Stylesheet CSS attribute '${w.key}' must be a literal, not an expression like '${w.value}'`
        let newTagKey = "css"
        if (w.key.includes(":")) newTagKey += ":" + w.key.split(":").slice(1).join(":")
        newCssTags.push(new VugNode(newTagKey, [new VugWord(w.key.slice(1).split(":")[0], w.value, false)]))
        return [] // skip the word, we've added it to newCssTags
    })
    if (!newCssTags.length) return n
    return new VugNode(n.tag, ourWords, [...newCssTags, ...n.children])
}

const compileVgCss = (n: VugNode): VugNode => {
    /* Allows directive on any element: vg-css="& { background: green } &:hover { background: red }"
    TODO:
    - Later can put this directly in the <style> tag or a new one
    - We don't need the ad-hoc class if the selector doesn't contain &...
    - Right now this is only used through CSS custom tags which compiles to this, and *stylesheet attrs which compile to custom tags. But if we want to use this directly, we will probably want:
        - Support multiple words
        - Support not using braces, and taking an optional arg for the selector here? So far we're not really using this directly, rather CSS custom tags or stylesheet rules
    */
    const contents = n.getWord("vg-css") 
    if (!contents) return n
    const script = `
        const d = $el.ownerDocument; 
        let st = null;
        if (!$el.vgcssKey) {
            $el.vgcssKey = 'vg_' + String((Math.random()+1).toString(36).slice(7));
            st = d.head.appendChild(d.createElement('style'));
            st.dataset[$el.vgcssKey] = '';
            $el.dataset.vgcss = $el.vgcssKey;
        } else {
            st = d.querySelector('*[data-' + $el.vgcssKey + ']');
        }
        st.innerText = ${JSON.stringify(contents)}.replace(/&/g, '*[data-vgcss=' + $el.vgcssKey + ']');
    `.replace(/\n/g, '').replace(/[ \t]+/g, ' ').replace(/"/g, "&quot;").replace(/'/g, "&#39;")
    // return clone(n, { "vg-css": null, "vg-do": script })
    return clone(n, { "vg-css": null, ":ref": `$el => { ${script} }` })
}

function cssCustomTag(n: VugNode): VugNode {
    /* Handles lines like:
    div
      css -- h1 { background: red }
      css -- background: red // applies to current element using vg-css's &
      css bg=red // same
      css selector="&:hover" bg=red
      css s="&:hover" bg=red // same
      css:hover bg=red // same
    
    TODO
    - won't work for top-level CSS tags; we can make that work later once we have a way to put things in the <style> tag, see comment on vg-css. Or we can replace with a <noscript> tag with v-css...
    - consolidate css tags that have the same selector and args
    - I don't know how this is catching args, tagNameParser was supposed to take it out and put it under _mainArg
    - "opacity=0.5" errors with "Props of a CSS tag can't be expressions, since they're inserted as a stylesheet" since numbers are parsed as expressions
    */
    function cssStringForCssCustomTag(cssTag: VugNode): string {
        const selector = cssTag.getWordErrIfCalc("selector") || cssTag.getWordErrIfCalc("s") || '&'        
        let rule = cssTag.children.map(x => x.getWord("_contents")).join(" ")
        const attrs = cssTag.words.filter(x => x.key !== "selector" && x.key !== "s")
        if (rule.includes("{")) {
            if (selector !== "&") throw "Can't have a rule with braces when a selector is specified. '" + selector
            if (attrs.length) throw "Can't have attributes when a selector is specified." // TODO maybe allow as long as there's %%% etc
        } else { // no braces. Parse words
            for (const prop of attrs) {
                if (prop.isExpr) throw "Props of a CSS tag can't be expressions, since they're inserted as a stylesheet"
                const x = Styling.processCssProp(prop.key, prop.value)
                if (!x) throw "Unrecognized CSS property (of a CSS tag): " + prop.key
                for (const k in x) rule = `${k}: ${x[k]}; ${rule}` // TODO reverse really
            }
            rule = parseStyleVariants(cssTag.tag, selector, rule) // parse arg
        }
        return rule
    }
    const isCssChild = (x: VugNode) => x.tag === "css" || x.tag.startsWith("css:") // TODO use parseArgs
    const cssChildren = n.children.filter(isCssChild)
    if (!cssChildren.length) return n
    const text = cssChildren.map(cssStringForCssCustomTag).join(" ")
    return new VugNode(n.tag, [...n.words, new VugWord("vg-css", text, false)], n.children.filter(x => !isCssChild(x)))
}

function parseStyleVariants(key: string, start = ".foo", attrs = "%%%") {    
    // Returns ".foo:extraThings { %%% }"
    // `key` is in the format `ignored:someVariant:otherVariant:!negatedVariant:@variant:[& .customTarget]`
    const parts = splitThree(key, ":").slice(1)
    const respBrkpts = { sm: 640, md: 768, lg: 1024, xl: 1280, "2xl": 1536 }
    let sel = start, blocks: string[] = []
    for (const x of parts) {
      if (["hover", "focus", "active", "focus-within", "focus-visible", "disabled", "visited", "checked"].includes(x))
        sel = `${sel}:${x}`
      else if (x === "last" || x === "first")
        sel = `${sel}:${x}-child`
      else if (x === "odd" || x === "even")
        sel = `${sel}:nth-child(${x})`
      else if (x[0] === '.') 
        sel = `${sel}${x}`
      else if (x[0] === '!') { // negation -- experimental and hacky
        const plchldr = 'HREKJSBLLI'
        const done = parseStyleVariants("$"+x.slice(1), plchldr, '%%%').split('{')[0].trim()
        const whatAdded = done.slice(done.indexOf(plchldr) + plchldr.length)
        sel = `${sel}:not(${whatAdded})`
      }
      else if (x[0] === '[' && x[x.length - 1] === ']')  
        sel = x.slice(1, x.length - 1).replace(/\&/g, sel)
      else if (x[0] === '@') 
        blocks.unshift(x)
      else if (x[0] === "<" && respBrkpts[x.slice(1)]) 
        blocks.unshift(`@media (max-width: ${respBrkpts[x.slice(1)]-1}px)`)
      else if (respBrkpts[x]) 
        blocks.unshift(`@media (min-width: ${respBrkpts[x]}px)`)
      else if (x === "motion-safe")
        blocks.unshift(`@media (prefers-reduced-motion: no-preference)`)
      else if (x === "motion-reduce")
        blocks.unshift(`@media (prefers-reduced-motion: reduce)`)
      else if (!x) {} // it's just to ensure it's a rule
      else 
        throw `Unknown style variant: '${x}'`
    }
    let ret = `${sel} { ${attrs} }`
    for (const b of blocks) ret = `${b} {\n` + ret.split("\n").map(x => `  ${x}`).join("\n") + "\n}"
    return ret
  }


// TODO allow variant '.tick' which inserts $nextTick(() => x)
// TODO allow multiple, and coexisting with existing 'ref's (Vue cannot do multiple refs)
const vgDo = wordTransformer(w => w.key === "vg-do" ? new VugWord("ref", `$el => { if (!$el || $el.ranonce) return; $el.ranonce = true; ${w.value} }`, true) : w)
// TODO allow multiple, and maybe create a let in the script setup
const vgLet = wordTransformer(w => w.key.startsWith("vg-let:") ? new VugWord("v-for", `${w.key.slice(7)} in [${w.value}]`, false) : w)
// TODO maybe detect multiple levels of nesting and default the variable to it2
const vgEachSimple = wordTransformer(w => w.key === "vg-each" ? new VugWord("vg-each:it", w.value, false) : w)
const vgEach = wordTransformer(w => w.key.startsWith("vg-each:") ? new VugWord("v-for", `(${w.key.slice(8)},${w.key.slice(8)}_i) in ${w.value}`, false) : w)
const allowReferencesToGlobals = wordTransformer(w => w.value.includes("$win") ? new VugWord(w.key, w.value.replace(/\$win/g, "(Array.constructor('return window')())"), w.isExpr) : w)

export function runAll(node: VugNode): VugNode {
    node = directChild(node)
    node = tagNameParser(node)
    node = customTagTypes(node)
    node = Styling.basicCssMacros(node)
    node = Styling.flexMacroFx(node)
    node = Styling.mainTransform(node)
    node = Styling.quickUnits(node)
    node = styleSheetCssAttrs(node)
    node = cssCustomTag(node)
    node = compileVgCss(node)
    node = vgDo(node)
    node = vgLet( node)
    node = vgEachSimple(node)
    node = vgEach(node)
    node = allowReferencesToGlobals(node)
    return new VugNode(node.tag, node.words, node.children.map(c => runAll(c)))
}


function customTagTypes(n: VugNode): VugNode {
    if (n.tag === 'd') return clone(n, { tag: "div" })
    if (n.tag === 's') return clone(n, { tag: "span" })
    if (n.tag === 'f' || n.tag === 'flex') return clone(n, { tag: "div", style_display: "flex", fx: n.getWord("_mainArg") || "", _mainArg: null })
    if (v1compat && n.tag === 'fr') return clone(n, { tag: "div", style_display: "flex", 'style_flex-direction': 'row' })
    if (v1compat && n.tag === 'fc') return clone(n, { tag: "div", style_display: "flex", 'style_flex-direction': 'column' })
    if (n.tag === 'ib'|| n.tag === 'inline-block') return clone(n, { tag: "div", style_display: "inline-block" })
    return n
}

function tagNameParser(n: VugNode): VugNode {
    const [first, ...args] = n.tag.split(":")
    const parts = first.split('').reduce((list,char) => {
        if (/[A-Za-z0-9_|\-]/.test(char)) list.slice(-1)[0].text += char
        else list.push({ prefix: char, text: "" }) //TODO allow prefixes consisting of double special characters, i.e. push onto previous
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
    const secondTag = n.words[indOfArrow + 1]
    if (!secondTag) throw "Tag name expected after >"
    if (secondTag.value) throw "Tag name after > cannot have a value. It's a tag, obviously"
    const secondTagWords = n.words.slice(indOfArrow + 2)
    const firstTagWords = n.words.slice(0, indOfArrow)
    return new VugNode(n.tag, firstTagWords, [new VugNode(secondTag.key, secondTagWords, n.children.slice())])
}
