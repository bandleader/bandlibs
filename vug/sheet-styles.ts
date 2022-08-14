import * as Parsing from "./parsing"
import * as Styling from "./styling"
import * as Macros from "./macros";
import { VugNode, VugWord } from "./parsing"

export function sheetStyles(n: VugNode) {
    /*  
    Handles css attributes that are to be converted into stylesheet rules
    (i.e. `css` custom tag, handled later in the pipeline).
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

export function cssCustomTag(n: VugNode): VugNode {
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


export function compileVgCss(n: VugNode): VugNode {
    /* Allows directive on any element: vg-css="& { background: green } &:hover { background: red }"
    TODO:
    - Later can put this directly in the <style> tag or a new one
    - We don't need the ad-hoc class if the selector doesn't contain &...
    - Right now this is only used through CSS custom tags which compiles to this, and *stylesheet attrs which compile to custom tags. But if we want to use this directly, we will probably want:
        - Support multiple words
        - Support not using braces, and taking an optional arg for the selector here? So far we're not really using this directly, rather CSS custom tags or stylesheet rules
    - The encoding should be done by the emitter, not here
    - Replacing on every render might be wasteful; should we check if it was modified before replacing innerText? Not sure what is better
    
    NOTE
    - We're not using vg-do because it only runs once, whereas here we want HMR. However vg-do can maybe have a .everyrender modifier
    - The $el.el line is because the ref can resolve to a component. (Might want to handle this in vg-do)
    */
    const contents = n.getWord("vg-css") 
    if (!contents) return n
    const script = `
        if ($el.$el) $el = $el.el;
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
    return Macros.clone(n, { "vg-css": null, ":ref": `$el => { ${script} }` })
}

function parseStyleVariants(key: string, start = ".foo", attrs = "%%%") {
    // Returns ".foo:extraThings { %%% }"
    // `key` is in the format `ignored:someVariant:otherVariant:!negatedVariant:@variant:[& .customTarget]`
    const parts = Parsing.splitThree(key, ":").slice(1)
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
            const done = parseStyleVariants("$" + x.slice(1), plchldr, '%%%').split('{')[0].trim()
            const whatAdded = done.slice(done.indexOf(plchldr) + plchldr.length)
            sel = `${sel}:not(${whatAdded})`
        }
        else if (x[0] === '[' && x[x.length - 1] === ']')
            sel = x.slice(1, x.length - 1).replace(/\&/g, sel)
        else if (x[0] === '@')
            blocks.unshift(x)
        else if (x[0] === "<" && respBrkpts[x.slice(1)])
            blocks.unshift(`@media (max-width: ${respBrkpts[x.slice(1)] - 1}px)`)
        else if (respBrkpts[x])
            blocks.unshift(`@media (min-width: ${respBrkpts[x]}px)`)
        else if (x === "motion-safe")
            blocks.unshift(`@media (prefers-reduced-motion: no-preference)`)
        else if (x === "motion-reduce")
            blocks.unshift(`@media (prefers-reduced-motion: reduce)`)
        else if (!x) { } // it's just to ensure it's a rule

        else
            throw `Unknown style variant: '${x}'`
    }
    let ret = `${sel} { ${attrs} }`
    for (const b of blocks)
        ret = `${b} {\n` + ret.split("\n").map(x => `  ${x}`).join("\n") + "\n}"
    return ret
}