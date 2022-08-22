/* TODO
- input:checkbox etc. But if we're going to parse that as an arg, maybe it conflicts with namespaces.
     - Can use input::checkbox, or a different char like input%checkbox, input+checkbox, input~checkbox, input^checkbox, input$checkbox
- Same for flex:!|c.c etc (note period will need to be renamed to dash [but that conflicts with row])
- Debug things that aren't working properly:
    *bg:!hover is not working, does :not()
    [done?] fr:c.c (the mainarg is only processed on f, not fr/fc)
    f:c.c.class1.class2 (class1 is taken as align-content, and class2 is discarded) (either use hyphens [but that conflicts with row], or go back to "al" or "fx" props)
    [done? was because f overwrote it] f fx=c.c (it works on fr, fc, even div, but not f!)
    f -> <div style="display: flex" fx=""></div>
    f fx:c.c <div style="display: flex; display: flex; justify-content: center; align-items: center"></div>
    f fx=c.c -- fx no effect because blanked
    f:c.c display:flex is twice
    clone to undefined to not touch an attr does not seem to be working
    in ONE line detect all flex tags, transfer the arg to fx but preserve fx otherwise, and if R or C, add to fx I guess, or just a flex-direction property
    but also fix clone, maybe first
- Just rationalize args. 
    They're a good idea, 
    but they have to be right after tagname before any dot-modifiers/classes (because dot modifiers can contain colons), 
    and can't contain dots because that ends it.
    although maybe we can do `f:c-c[this can contain more colons and dots].text-center[this contains dots].foo` using splitThree. However we want dot modifiers to have colons without that...
    maybe args can just be `f[args here].foo` and then it can be whatever we want. Nah
- And then rationalize flex
    No al, no fx, just mainarg. Commas instead of periods? f:|c,c 
    Or just fx? `f fx=|c.c` is pretty short, 9 chars `f:|c.c` is 6, do we want to save 3 chars? (Maybe YES)

*/

import { VugNode, VugWord } from "./parsing"
import * as SheetStyles from "./sheet-styles"
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
    node = splitDoubleClasses(node)
    node = customTagTypes(node)
    node = Styling.basicCssMacros(node)
    node = Styling.flexMacroFx(node)
    node = Styling.mainTransform(node)
    node = Styling.quickUnits(node)
    node = SheetStyles.sheetStyles(node)
    node = SheetStyles.cssCustomTag(node)
    node = SheetStyles.compileVgCss(node)
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

function splitDoubleClasses(n: VugNode) { // TODO optimize
    return new VugNode(n.tag, n.words.flatMap(w => {
        if (w.key[0] !== '.' || !w.key.slice(1).includes('.')) return [w]
        const classes = w.key.slice(1).split(".")
        return classes.map(x => new VugWord("." + x, w.value, w.isExpr))
    }), n.children)
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
