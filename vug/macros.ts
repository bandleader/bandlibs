/* TODO
- Debug things that aren't working properly:
    f:c.c.class1.class2 (class1 is taken as align-content, and class2 is discarded) (either use hyphens [but that conflicts with row], or go back to "al" or "fx" props)
    `d vg-let:foo="a b".split(' ')` throws `Unterminated string quote in value`
*/

import { VugNode, VugWord } from "./parsing"
import * as SheetStyles from "./sheet-styles"
import * as Styling from "./styling"
import * as MarkdownSupport from "./markdown-support"

export let v1compat = true

export function clone(node: VugNode, changes: Record<string, string>) {
    const ret = new VugNode(changes.tag || node.tag, node.words, node.children)
    for (const [k,v] of Object.entries(changes)) {
        if (k === 'tag') continue;
        else if (v === undefined) continue;
        if (ret.words.find(x => x.key === k && x.isExpr && v !== null)) throw `Clone can't overwrite attribute '${k}' that is bound to an expression`
        ret.words = ret.words.filter(x => x.key !== k)
        if (v !== null) ret.words.push(new VugWord(k, v, false))
    }
    return ret
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
    node = MarkdownSupport.fixMarkdownMacro(node)
    node = directChild(node)
    node = tagNameParser(node)
    node = splitDoubleClasses(node)
    node = customTagTypes(node)
    node = routing(node)
    node = Styling.flexMacroFx(node)
    node = Styling.mainTransform(node)
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
    if (v1compat && n.tag === 'fr') n = clone(n, { tag: "f", 'style_flex-direction': 'row' })
    if (v1compat && n.tag === 'fc') n = clone(n, { tag: "f", 'style_flex-direction': 'column' })
    if (n.tag === 'f') n = clone(n, { tag: "flex" })
    if (v1compat && n.tag === "flex" && n.getWord("al")) n = clone(n, { fx: n.getWordErrIfCalc("al"), al: null }) 
    if (n.tag === 'flex') return clone(n, { tag: "div", style_display: "flex", fx: n.getWord("type") || undefined, type: null })
    if (n.tag === 'ib'|| n.tag === 'inline-block') return clone(n, { tag: "div", style_display: "inline-block" })
    return n
}

function routing(n: VugNode): VugNode {
    if (n.tag === "a" && n.getWord('to-route')) {
        const word = n.words.find(x => x.key === 'to-route')
        const ret = clone(n, { 'to-route': null, onclick: "router.push(this.getAttribute('href')); return false" }) // getAttribute because href property returns the full URL with https://example.com!
        ret.words.push(new VugWord('href', word.value, word.isExpr)) // to allow calculated
        return ret
    }
    if (n.tag !== "route") return n
    const path = n.getWordErrIfCalc("path")
    const innerVFor = `{$route, $router} in (Array.constructor('return window')().router?.match?.(${JSON.stringify(path).replace(/"/g, "&quot;")}) || [])`
    const vIfTrue = () => new VugWord("v-if", "true", false) // for 'template' tags. Otherwise Vue renders them as the HTML tag 'template' which is invisible. I want a fragment. Note that even with this done, I couldn't make 'inner' a child of scriptAdder. It wouldn't render.
    const inner = new VugNode("template", [new VugWord("v-for", innerVFor, true)], n.children)
    const script = `function($el) {
        const win = Array.constructor('return window')();
        // win.console.log('Running!');
        if (!win.router) {
            win.router = {
                basePath: '/bandlibs', // or ''
                get pathname() { return win.location.pathname.replace(win.router.basePath, '') || '/' },
                push(url) { win.history.pushState('', '', win.router.basePath + url); win.dispatchEvent(new win.Event('popstate')) },
                match: path => win.router.pathname === path ? [{ $router: win.router, $route: { path: win.router.pathname, params: {} } }] : [],
            };
            // win.console.log("Router initialized!");
        };
        // Update our component when the route changes, as well as once now
        // This doesn't work in production. We'll go another way instead
        // if (!$el || $el.ranonce) return;
        // $el.ranonce = true;
        // win.console.log('running on', $el, this); // debug
        // const onUpd = () => $el.__vueParentComponent?.update();
        // win.addEventListener('popstate', onUpd);
        // win.setTimeout(onUpd, 10);
      }
    `.split("\n").map(x => x.split(" //")[0].trim()).join(" ").trim() // So make sure you have semicolons on each line
    const scriptAdder = new VugNode("div", [new VugWord("ref", script, true)])
    const container = new VugNode("template", [vIfTrue()], [scriptAdder, inner])
    return container
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
    for (const w of args) words.push(new VugWord(['slot','transition','transition-group','transitiongroup'].includes(tag.toLowerCase()) ? "name" : "type", w, false))
    return new VugNode(tag, words, n.children)
}
function directChild(n: VugNode): VugNode {
    const indOfArrow = n.words.findIndex(x => x.key === ">")
    if (indOfArrow < 0) return n
    const secondTag = n.words[indOfArrow + 1]
    if (!secondTag) throw "Tag name expected after >"
    if (secondTag.value) throw "Tag name after > cannot have a value (obviously, it's a tag, not an attribute!)"
    const secondTagWords = n.words.slice(indOfArrow + 2)
    const firstTagWords = n.words.slice(0, indOfArrow)
    return new VugNode(n.tag, firstTagWords, [new VugNode(secondTag.key, secondTagWords, n.children.slice())])
}
