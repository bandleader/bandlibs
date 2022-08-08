'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}

function partition(arr, fn, minGroups) {
    if (minGroups === void 0) { minGroups = 2; }
    // Usage: const [trueOnes, falseOnes] = partition(arr, x => trueOrFalse)
    // Or:    const [one, two, three] = partition(arr, x => num, 3) // use the last argument to create a min number of groups
    var ret = Array.from(Array(minGroups)).map(function () { return []; });
    for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
        var i = arr_1[_i];
        var k = fn(i);
        var ind = typeof k === 'number' ? k : !!k ? 0 : 1;
        while (ret.length < (ind + 1))
            ret.push([]);
        ret[ind].push(i);
    }
    return ret;
}

/*
- input:checkbox etc. But if we're going to parse that as an arg, maybe it conflicts with namespaces.
     - Can use input::checkbox, or a different char like input%checkbox, input+checkbox, input~checkbox, input^checkbox, input$checkbox
- Same for flex:!|c.c etc (note period will need to be renamed to dash)
- .foo=bar currently errors in emitter because it's expecting an expression. But in v2 expr has different meaning, it means explicitly :'d.
- It should be safe to implement cleaner expression syntax for attribute binding:
    foo=(1 + 2)
    foo={ bar: true }
    foo=`Hello ${world}`
  For directives make sure not to emit :v-if.
  To ensure consistency, so that quotes are never used for exprs, and so nameExpr always mean strings, we should probably enforce directives etc to use it:
    v-if=(shown)
    v-focus=(foo ? 'bar' : 'baz)
    .foo=(shown)
  BUT:
    Is v-for OK? v-for=(x in foo.bar) / v-for=((x, i) in foo.bar)
    It was very convenient to use v-if=shown and .foo=shown :( Isn't it clear enough?
    Also I don't want to lose backward compatibility...
  PERHAPS:
    Allow the new syntax, and make it into an expr
    Existing syntax should work too
    Can warn if a directive/class uses quotes
    Later can warn if it uses nameExpr, though I think I want that
    Problem -- foo=(1 + 2) might easily be changed to foo=someVar and that has a different meaning
  MAYBE:
    Nothing wrong with :foo=bar, v-if=bar, .foo=bar. In all cases the left side makes clear it's an expr
    We should give up on foo=(1 + 2) because indeed that doesn't translate well like we said above
    It'll still be :foo=(1 + 2), we'll just enforce that it should be parens and not quotes
    And of course {...}, `...` should work too

    

  Should we force v-if=(1 + 2)
    v-if=foo // not clear it's expression

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
function clone(node, changes) {
    // TODO: throw if overwriting an isExpr word, I think
    var ks = Object.keys(changes).filter(function (x) { return x !== "tag"; });
    return new VugNode(changes.tag || node.tag, __spreadArray(__spreadArray([], node.words.filter(function (w) { return changes[w.key] === undefined; } /*whereas null will blank it*/), true), ks.filter(function (k) { return changes[k] !== null; }).map(function (k) { return new VugWord(k, changes[k], false); }), true), node.children);
}
function wordTransformer(fn) {
    // TODO-OPTIMIZE Can check whether any of the nodes were replaced and if not return the original node... or even only copy the array once something was switched.
    // TODO-OPTIMIZE We can also run all the word transformers in one step, as long as order doesn't matter
    return function (n) { return new VugNode(n.tag, n.words.map(function (w) { return fn(w); }), n.children); };
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
var conditionalCssToVCss = function (n) {
    var contents = "";
    function splitTwo(text, sep) {
        var pos = text.indexOf(sep);
        if (pos < 0)
            return [text, ''];
        return [text.substr(0, pos), text.substr(pos + sep.length)];
    }
    var words = n.words.flatMap(function (w) {
        var _a = splitTwo(w.key, ":"), key = _a[0], slctr = _a[1];
        if (['hover', 'active', 'focus'].includes(slctr))
            slctr = "&:" + slctr; // TODO add from https://tailwindcss.com/docs/hover-focus-and-other-states#pseudo-class-reference
        if (!slctr || !slctr.includes("&"))
            return [w];
        if (imbaDict[key])
            key = imbaDict[key]; // TODO macros, units, etc?
        contents += "".concat(slctr, " { ").concat(key, ": ").concat(w.value, " } ");
        return []; // skip the word, we've added it to contents
    });
    if (!contents)
        return n;
    return new VugNode(n.tag, __spreadArray(__spreadArray([], words, true), [new VugWord('v-css', contents, false)], false), n.children);
};
var compileVCss = function (n) {
    var contents = n.getWord("v-css");
    if (!contents)
        return n;
    // TODO support args here?
    // TODO support multi words here?
    var script = "\n        const d = $el.ownerDocument, st = null;\n        if (!$el.vcssKey) {\n            $el.vcssKey = 'vg_' + String((Math.random()+1).toString(36).slice(7));\n            st = d.head.appendChild(d.createElement('style'));\n            st.dataset[$el.vcssKey] = ''\n            $el.dataset.vcss = $el.vcssKey\n        } else {\n            st = d.querySelector('*[data-' + $el.vcssKey + ']')\n        }\n        st.innerText = ".concat(JSON.stringify(contents), ".replace(/&/g, '*[data-vcss=' + $el.vcssKey + ']')\n    ").replace(/\n/g, '').replace(/[ \t]+/g, ' ').replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    return clone(n, { "v-css": null, "vg-do": script });
};
var vgCssComponent = function (n) {
    var _a;
    if (n.tag !== 'vg-css')
        return n;
    var contents = ((_a = n.children[0]) === null || _a === void 0 ? void 0 : _a.getWord("_contents")) || "";
    var arg = n.getWord("_mainArg") || "";
    if (arg) {
        if (contents.includes("{"))
            throw "vg-css: when using an arg, don't include braces in the contents";
        if (!arg.includes("&"))
            arg = "&:" + arg;
        for (var _i = 0, _b = n.words; _i < _b.length; _i++) {
            var w = _b[_i];
            if (w.key.startsWith("style_"))
                contents = "".concat(w.key.slice(6), ": ").concat(w.value, "; ").concat(contents);
        }
        contents = "".concat(arg, " { ").concat(contents, " }");
    }
    var id = "vg_" + (Math.random() + 1).toString(36).substring(7); // note this has to start with a non-digit of course since we access it as a property name
    if (contents.includes("&"))
        contents = contents.replace(/&/g, "*[data-".concat(id, "]"));
    var script = "var d = $el.ownerDocument; $el.parentElement.dataset.".concat(id, " = ''; if (!d.added_").concat(id, ") d.added_").concat(id, " = d.head.appendChild(Object.assign(d.createElement('style'), { innerText: ").concat(JSON.stringify(contents).replace(/"/g, "&quot;"), " }))");
    return new VugNode("noscript", [new VugWord("style_display", "none", false), new VugWord("vg-do", script, false)]);
};
// TODO allow variant '.tick' which inserts $nextTick(() => x)
// TODO allow multiple, and coexisting with existing 'ref's (Vue cannot do multiple refs)
var vgDo = wordTransformer(function (w) { return w.key === "vg-do" ? new VugWord("ref", "$el => { if (!$el || $el.ranonce) return; $el.ranonce = true; ".concat(w.value, " }"), true) : w; });
// TODO allow multiple, and maybe create a let in the script setup
var vgLet = wordTransformer(function (w) { return w.key.startsWith("vg-let:") ? new VugWord("v-for", "".concat(w.key.slice(7), " in [").concat(w.value, "]"), false) : w; });
// TODO maybe detect multiple levels of nesting and default the variable to it2
var vgEachSimple = wordTransformer(function (w) { return w.key === "vg-each" ? new VugWord("vg-each:it", w.value, false) : w; });
var vgEach = wordTransformer(function (w) { return w.key.startsWith("vg-each:") ? new VugWord("v-for", "(".concat(w.key.slice(8), ",").concat(w.key.slice(8), "_i) in ").concat(w.value), false) : w; });
var allowReferencesToGlobals = wordTransformer(function (w) { return w.value.includes("$win") ? new VugWord(w.key, w.value.replace(/\$win/g, "(Array.constructor('return window')())"), w.isExpr) : w; });
function runAll(node) {
    node = directChild(node);
    node = tagNameParser(node);
    node = customTagTypes(node);
    node = basicCssMacros(node);
    node = flexMacroFx(node);
    node = cssShorthand(node);
    node = cssRecognize(node);
    node = quickUnits(node);
    node = vgCssComponent(node);
    node = conditionalCssToVCss(node);
    node = compileVCss(node);
    node = vgDo(node);
    node = vgLet(node);
    node = vgEachSimple(node);
    node = vgEach(node);
    node = allowReferencesToGlobals(node);
    return new VugNode(node.tag, node.words, node.children.map(function (c) { return runAll(c); }));
}
var imbaDict = { ac: "align-content", ai: "align-items", as: "align-self", b: "bottom", bc: "border-color", bcb: "border-bottom-color", bcl: "border-left-color", bcr: "border-right-color", bct: "border-top-color", bd: "border", bdb: "border-bottom", bdl: "border-left", bdr: "border-right", bdt: "border-top", bg: "background", bga: "background-attachment", bgc: "background-color", bgclip: "background-clip", bcgi: "background-image", bgo: "background-origin", bgp: "background-position", bgr: "background-repeat", bgs: "background-size", bs: "border-style", bsb: "border-bottom-style", bsl: "border-left-style", bsr: "border-right-style", bst: "border-top-style", bw: "border-width", bwb: "border-bottom-width", bwl: "border-left-width", bwr: "border-right-width", bwt: "border-top-width", c: "color", cg: "column-gap", d: "display", e: "ease", ec: "ease-colors", eo: "ease-opacity", et: "ease-transform", ff: "font-family", fl: "flex", flb: "flex-basis", fld: "flex-direction", flf: "flex-flow", flg: "flex-grow", fls: "flex-shrink", flw: "flex-wrap", fs: "font-size", fw: "font-weight", g: "gap", ga: "grid-area", gac: "grid-auto-columns", gaf: "grid-auto-flow", gar: "grid-auto-rows", gc: "grid-column", gce: "grid-column-end", gcg: "grid-column-gap", gcs: "grid-column-start", gr: "grid-row", gre: "grid-row-end", grg: "grid-row-gap", grs: "grid-row-start", gt: "grid-template", gta: "grid-template-areas", gtc: "grid-template-columns", gtr: "grid-template-rows", h: "height", jac: "place-content", jai: "place-items", jas: "place-self", jc: "justify-content", ji: "justify-items", js: "justify-self", l: "left", lh: "line-height", ls: "letter-spacing", m: "margin", mb: "margin-bottom", ml: "margin-left", mr: "margin-right", mt: "margin-top", o: "opacity", of: "overflow", ofa: "overflow-anchor", ofx: "overflow-x", ofy: "overflow-y", origin: "transform-origin", p: "padding", pb: "padding-bottom", pe: "pointer-events", pl: "padding-left", pos: "position", pr: "padding-right", pt: "padding-top", r: "right", rd: "border-radius", rdbl: "border-bottom-left-radius", rdbr: "border-bottom-right-radius", rdtl: "border-top-left-radius", rdtr: "border-top-right-radius", rg: "row-gap", shadow: "box-shadow", t: "top", ta: "text-align", td: "text-decoration", tdc: "text-decoration-color", tdl: "text-decoration-line", tds: "text-decoration-style", tdsi: "text-decoration-skip-ink", tdt: "text-decoration-thickness", te: "text-emphasis", tec: "text-emphasis-color", tep: "text-emphasis-position", tes: "text-emphasis-style", ts: "text-shadow", tt: "text-transform", tween: "transition", us: "user-select", va: "vertical-align", w: "width", ws: "white-space", zi: "z-index" };
var cssShorthand = wordTransformer(function (w) { return imbaDict[w.key] ? new VugWord("style_".concat(imbaDict[w.key]), w.value, w.isExpr) : w; });
var cssProperties$1 = "--*|-webkit-line-clamp|accent-color|align-content|align-items|align-self|alignment-baseline|all|animation|animation-delay|animation-direction|animation-duration|animation-fill-mode|animation-iteration-count|animation-name|animation-play-state|animation-timing-function|appearance|aspect-ratio|azimuth|backface-visibility|background|background-attachment|background-blend-mode|background-clip|background-color|background-image|background-origin|background-position|background-repeat|background-size|baseline-shift|baseline-source|block-ellipsis|block-size|block-step|block-step-align|block-step-insert|block-step-round|block-step-size|bookmark-label|bookmark-level|bookmark-state|border|border-block|border-block-color|border-block-end|border-block-end-color|border-block-end-style|border-block-end-width|border-block-start|border-block-start-color|border-block-start-style|border-block-start-width|border-block-style|border-block-width|border-bottom|border-bottom-color|border-bottom-left-radius|border-bottom-right-radius|border-bottom-style|border-bottom-width|border-boundary|border-collapse|border-color|border-end-end-radius|border-end-start-radius|border-image|border-image-outset|border-image-repeat|border-image-slice|border-image-source|border-image-width|border-inline|border-inline-color|border-inline-end|border-inline-end-color|border-inline-end-style|border-inline-end-width|border-inline-start|border-inline-start-color|border-inline-start-style|border-inline-start-width|border-inline-style|border-inline-width|border-left|border-left-color|border-left-style|border-left-width|border-radius|border-right|border-right-color|border-right-style|border-right-width|border-spacing|border-start-end-radius|border-start-start-radius|border-style|border-top|border-top-color|border-top-left-radius|border-top-right-radius|border-top-style|border-top-width|border-width|bottom|box-decoration-break|box-shadow|box-sizing|box-snap|break-after|break-before|break-inside|caption-side|caret|caret-color|caret-shape|chains|clear|clip|clip-path|clip-rule|color|color-adjust|color-interpolation-filters|color-scheme|column-count|column-fill|column-gap|column-rule|column-rule-color|column-rule-style|column-rule-width|column-span|column-width|columns|contain|contain-intrinsic-block-size|contain-intrinsic-height|contain-intrinsic-inline-size|contain-intrinsic-size|contain-intrinsic-width|container|container-name|container-type|content|content-visibility|continue|counter-increment|counter-reset|counter-set|cue|cue-after|cue-before|cursor|direction|display|dominant-baseline|elevation|empty-cells|fill|fill-break|fill-color|fill-image|fill-opacity|fill-origin|fill-position|fill-repeat|fill-rule|fill-size|filter|flex|flex-basis|flex-direction|flex-flow|flex-grow|flex-shrink|flex-wrap|float|float-defer|float-offset|float-reference|flood-color|flood-opacity|flow|flow-from|flow-into|font|font-family|font-feature-settings|font-kerning|font-language-override|font-optical-sizing|font-palette|font-size|font-size-adjust|font-stretch|font-style|font-synthesis|font-synthesis-small-caps|font-synthesis-style|font-synthesis-weight|font-variant|font-variant-alternates|font-variant-caps|font-variant-east-asian|font-variant-emoji|font-variant-ligatures|font-variant-numeric|font-variant-position|font-variation-settings|font-weight|footnote-display|footnote-policy|forced-color-adjust|gap|glyph-orientation-vertical|grid|grid-area|grid-auto-columns|grid-auto-flow|grid-auto-rows|grid-column|grid-column-end|grid-column-start|grid-row|grid-row-end|grid-row-start|grid-template|grid-template-areas|grid-template-columns|grid-template-rows|hanging-punctuation|height|hyphenate-character|hyphenate-limit-chars|hyphenate-limit-last|hyphenate-limit-lines|hyphenate-limit-zone|hyphens|image-orientation|image-rendering|image-resolution|initial-letter|initial-letter-align|initial-letter-wrap|inline-size|inline-sizing|input-security|inset|inset-block|inset-block-end|inset-block-start|inset-inline|inset-inline-end|inset-inline-start|isolation|justify-content|justify-items|justify-self|leading-trim|left|letter-spacing|lighting-color|line-break|line-clamp|line-grid|line-height|line-height-step|line-padding|line-snap|list-style|list-style-image|list-style-position|list-style-type|margin|margin-block|margin-block-end|margin-block-start|margin-bottom|margin-break|margin-inline|margin-inline-end|margin-inline-start|margin-left|margin-right|margin-top|margin-trim|marker|marker-end|marker-knockout-left|marker-knockout-right|marker-mid|marker-pattern|marker-segment|marker-side|marker-start|mask|mask-border|mask-border-mode|mask-border-outset|mask-border-repeat|mask-border-slice|mask-border-source|mask-border-width|mask-clip|mask-composite|mask-image|mask-mode|mask-origin|mask-position|mask-repeat|mask-size|mask-type|max-block-size|max-height|max-inline-size|max-lines|max-width|min-block-size|min-height|min-inline-size|min-intrinsic-sizing|min-width|mix-blend-mode|nav-down|nav-left|nav-right|nav-up|object-fit|object-position|offset|offset-anchor|offset-distance|offset-path|offset-position|offset-rotate|opacity|order|orphans|outline|outline-color|outline-offset|outline-style|outline-width|overflow|overflow-anchor|overflow-block|overflow-clip-margin|overflow-inline|overflow-wrap|overflow-x|overflow-y|overscroll-behavior|overscroll-behavior-block|overscroll-behavior-inline|overscroll-behavior-x|overscroll-behavior-y|padding|padding-block|padding-block-end|padding-block-start|padding-bottom|padding-inline|padding-inline-end|padding-inline-start|padding-left|padding-right|padding-top|page|page-break-after|page-break-before|page-break-inside|pause|pause-after|pause-before|perspective|perspective-origin|pitch|pitch-range|place-content|place-items|place-self|play-during|pointer-events|position|print-color-adjust|property-name|quotes|region-fragment|resize|rest|rest-after|rest-before|richness|right|rotate|row-gap|ruby-align|ruby-merge|ruby-overhang|ruby-position|running|scale|scroll-behavior|scroll-margin|scroll-margin-block|scroll-margin-block-end|scroll-margin-block-start|scroll-margin-bottom|scroll-margin-inline|scroll-margin-inline-end|scroll-margin-inline-start|scroll-margin-left|scroll-margin-right|scroll-margin-top|scroll-padding|scroll-padding-block|scroll-padding-block-end|scroll-padding-block-start|scroll-padding-bottom|scroll-padding-inline|scroll-padding-inline-end|scroll-padding-inline-start|scroll-padding-left|scroll-padding-right|scroll-padding-top|scroll-snap-align|scroll-snap-stop|scroll-snap-type|scrollbar-color|scrollbar-gutter|scrollbar-width|shape-image-threshold|shape-inside|shape-margin|shape-outside|spatial-navigation-action|spatial-navigation-contain|spatial-navigation-function|speak|speak-as|speak-header|speak-numeral|speak-punctuation|speech-rate|stress|string-set|stroke|stroke-align|stroke-alignment|stroke-break|stroke-color|stroke-dash-corner|stroke-dash-justify|stroke-dashadjust|stroke-dasharray|stroke-dashcorner|stroke-dashoffset|stroke-image|stroke-linecap|stroke-linejoin|stroke-miterlimit|stroke-opacity|stroke-origin|stroke-position|stroke-repeat|stroke-size|stroke-width|tab-size|table-layout|text-align|text-align-all|text-align-last|text-combine-upright|text-decoration|text-decoration-color|text-decoration-line|text-decoration-skip|text-decoration-skip-box|text-decoration-skip-ink|text-decoration-skip-inset|text-decoration-skip-self|text-decoration-skip-spaces|text-decoration-style|text-decoration-thickness|text-edge|text-emphasis|text-emphasis-color|text-emphasis-position|text-emphasis-skip|text-emphasis-style|text-group-align|text-indent|text-justify|text-orientation|text-overflow|text-shadow|text-space-collapse|text-space-trim|text-spacing|text-transform|text-underline-offset|text-underline-position|text-wrap|top|transform|transform-box|transform-origin|transform-style|transition|transition-delay|transition-duration|transition-property|transition-timing-function|translate|unicode-bidi|user-select|vertical-align|visibility|voice-balance|voice-duration|voice-family|voice-pitch|voice-range|voice-rate|voice-stress|voice-volume|volume|white-space|widows|width|will-change|word-boundary-detection|word-boundary-expansion|word-break|word-spacing|word-wrap|wrap-after|wrap-before|wrap-flow|wrap-inside|wrap-through|writing-mode|z-index".split("|");
var cssRecognize = wordTransformer(function (w) { return cssProperties$1.includes(w.key) ? new VugWord("style_".concat(w.key), w.value, w.isExpr) : w; });
function customTagTypes(n) {
    if (n.tag === 'd')
        return clone(n, { tag: "div" });
    if (n.tag === 's')
        return clone(n, { tag: "span" });
    if (n.tag === 'f' || n.tag === 'flex')
        return clone(n, { tag: "div", style_display: "flex", fx: n.getWord("_mainArg") || "", _mainArg: null });
    if (n.tag === 'fr')
        return clone(n, { tag: "div", style_display: "flex", 'style_flex-direction': 'row' });
    if (n.tag === 'fc')
        return clone(n, { tag: "div", style_display: "flex", 'style_flex-direction': 'column' });
    if (n.tag === 'ib' || n.tag === 'inline-block')
        return clone(n, { tag: "div", style_display: "inline-block" });
    return n;
}
var quickUnits = wordTransformer(function (w) { return (w.key.startsWith("style_") && !w.isExpr && /^-?([0-9]*\.)?[0-9]+q$/.test(w.value)) ? new VugWord(w.key, parseFloat(w.value) * 0.25 + 'rem', false) : w; }); // Support the "q" numeric unit which is 0.25rem, similar to Bootstrap
var cssDisplayShorthand = { b: "block", i: "inline", f: "flex", g: "grid", ib: "inline-block", "if": "inline-flex", ig: "inline-grid" };
function basicCssMacros(n) {
    var words = n.words.flatMap(function (w) {
        return w.key === "sz" ? [new VugWord("style_width", w.value, w.isExpr), new VugWord("style_height", w.value, w.isExpr)] :
            w.key === "px" ? [new VugWord("style_padding-left", w.value, w.isExpr), new VugWord("style_padding-right", w.value, w.isExpr)] :
                w.key === "py" ? [new VugWord("style_padding-top", w.value, w.isExpr), new VugWord("style_padding-bottom", w.value, w.isExpr)] :
                    w.key === "mx" ? [new VugWord("style_margin-left", w.value, w.isExpr), new VugWord("style_margin-right", w.value, w.isExpr)] :
                        w.key === "my" ? [new VugWord("style_margin-top", w.value, w.isExpr), new VugWord("style_margin-bottom", w.value, w.isExpr)] :
                            (w.key === "circ" && !w.value && !w.isExpr) ? [new VugWord("style_border-radius", "100%", w.isExpr)] :
                                // TODO not sure I want this, perhaps just use tag types, except b/i/if conflict, but can use full form for those.
                                // Or can use mainArg
                                (w.key === "d" && !w.isExpr) ? [new VugWord("style_display", cssDisplayShorthand[w.value] || w.value, w.isExpr)] :
                                    [w];
    });
    return new VugNode(n.tag, words, n.children);
}
function flexMacroFx(n) {
    var value = n.getWordErrIfCalc("fx");
    if (!value)
        return n;
    // Direction
    var reverse = false, row = false, column = false;
    if (value[0] === "!") {
        reverse = true;
        value = value.slice(1);
    }
    if (value[0] === "|") {
        column = true;
        value = value.slice(1);
    }
    if (value[0] === "-") {
        row = true;
        value = value.slice(1);
    }
    if (value[0] === "!") {
        reverse = true;
        value = value.slice(1);
    }
    var direction = column ? 'column' : (reverse || row) ? 'row' : ''; // If reverse was specified, we have to specify row (which is the default)
    if (reverse)
        direction += "-reverse";
    var obj = { fx: null, display: 'flex' };
    if (direction)
        obj['style_flex-direction'] = direction;
    // Alignment etc
    var flexAlignmentShorthands = {
        c: "center",
        fs: "flex-start",
        fe: "flex-end",
        s: "start",
        e: "end",
        l: "left",
        r: "right",
        x: "stretch"
    };
    var _a = value.split(".").map(function (x) { return flexAlignmentShorthands[x] || x; }), jc = _a[0], ai = _a[1], ac = _a[2];
    if (jc)
        obj['style_justify-content'] = jc;
    if (ai)
        obj['style_align-items'] = ai;
    if (ac)
        obj['style_align-content'] = ac;
    return clone(n, obj);
}
function tagNameParser(n) {
    var _a;
    var _b = n.tag.split(":"), first = _b[0], args = _b.slice(1);
    var parts = first.split('').reduce(function (list, char) {
        if (/[A-Za-z0-9_|\-]/.test(char))
            list.slice(-1)[0].text += char;
        else
            list.push({ prefix: char, text: "" }); //TODO allow prefixes consisting of double special characters, i.e. push onto previous
        return list;
    }, [{ text: '', prefix: '' }]).filter(function (x) { return x.text; });
    var tag = ((_a = parts.filter(function (x) { return !x.prefix; })[0]) === null || _a === void 0 ? void 0 : _a.text) || 'div';
    var classes = parts.filter(function (x) { return x.prefix === '.'; }).map(function (x) { return x.text; });
    var ids = parts.filter(function (x) { return x.prefix === '#'; }).map(function (x) { return x.text; });
    if (ids.length > 1)
        throw "Can't have more than 1 ID in tag name: '".concat(n.tag, "'");
    // TODO ensure we recognize all parts
    var words = n.words.slice();
    for (var _i = 0, classes_1 = classes; _i < classes_1.length; _i++) {
        var w = classes_1[_i];
        words.push(new VugWord("." + w, '', false));
    }
    for (var _c = 0, ids_1 = ids; _c < ids_1.length; _c++) {
        var w = ids_1[_c];
        words.push(new VugWord("id", w, false));
    }
    for (var _d = 0, args_1 = args; _d < args_1.length; _d++) {
        var w = args_1[_d];
        words.push(new VugWord("_mainArg", w, false));
    }
    return new VugNode(tag, words, n.children);
}
function directChild(n) {
    var indOfArrow = n.words.findIndex(function (x) { return x.key === ">"; });
    if (indOfArrow < 0)
        return n;
    var secondTag = n.words[indOfArrow + 1];
    if (!secondTag)
        throw "Tag name expected after >";
    if (secondTag.value)
        throw "Tag name after > cannot have a value. It's a tag, obviously";
    var secondTagWords = n.words.slice(indOfArrow + 2);
    var firstTagWords = n.words.slice(0, indOfArrow);
    return new VugNode(n.tag, firstTagWords, [new VugNode(secondTag.key, secondTagWords, n.children.slice())]);
}

function emitVueTemplate(node, whitespace) {
    if (whitespace === void 0) { whitespace = false; }
    var out = [];
    if (node.tag === '_html') {
        out.push(node.getWord("_contents") || "");
    }
    else {
        out.push('<', node.tag);
        var htmlAttrEnc_1 = function (x, usingApos) {
            if (usingApos === void 0) { usingApos = false; }
            return x.replace(usingApos ? /'/g : /"/g, usingApos ? '&#x27;' : '&quot;');
        }; //.replace(/&/g, '&amp;').replace(/>/g, '&gt;')
        var block = function (items, funcs) { var _a, _b; if (!items.length)
            return; (_a = funcs.start) === null || _a === void 0 ? void 0 : _a.call(funcs); items.forEach(function (x, i) { var _a; if (i)
            (_a = funcs.between) === null || _a === void 0 ? void 0 : _a.call(funcs); funcs.each(x, i); }); (_b = funcs.end) === null || _b === void 0 ? void 0 : _b.call(funcs); };
        var _a = partition(node.words, function (x) { return x.key.startsWith("style_") ? 0 : x.key.startsWith(".") ? 1 : 2; }, 3), style = _a[0], klass = _a[1], attr = _a[2];
        var _b = partition(klass, function (x) { return x.isExpr; }), classExpr = _b[0], classStatic = _b[1];
        block(classStatic, {
            start: function () { return out.push(' class="'); },
            each: function (x) { out.push(x.key.slice(1)); if (x.value)
                throw "CSS-Class attributes cannot have a static value. For a condition, use curly braces or simply no quotes. -- : " + x.key; },
            between: function () { return out.push(" "); },
            end: function () { return out.push('"'); }
        });
        block(classExpr, {
            start: function () { return out.push(" :class='{"); },
            each: function (x) {
                var expr = x.value === undefined ? 'true' : !x.isExpr ? JSON.stringify(x.value) : x.value;
                out.push(JSON.stringify(x.key.slice(1)), ': ', htmlAttrEnc_1(expr, true));
            },
            between: function () { return out.push(", "); },
            end: function () { return out.push("}'"); }
        });
        var _c = partition(style, function (x) { return x.isExpr; }), styleExpr = _c[0], styleStatic = _c[1];
        block(styleStatic, {
            start: function () { return out.push(' style="'); },
            each: function (x) { return out.push(x.key.slice(6), ": ", x.value); },
            between: function () { return out.push("; "); },
            end: function () { return out.push('"'); }
        });
        block(styleExpr, {
            start: function () { return out.push(" :style='{"); },
            each: function (x) {
                if (x.value === undefined)
                    throw "Style keys must have a value: " + x.key.slice(6);
                var expr = !x.isExpr ? JSON.stringify(x.value) : x.value;
                out.push(JSON.stringify(x.key.slice(6)), ': ', htmlAttrEnc_1(expr, true));
            },
            between: function () { return out.push(", "); },
            end: function () { return out.push("}'"); }
        });
        block(attr, {
            each: function (x) {
                if (x.value === undefined) {
                    out.push(" ", x.key);
                }
                else {
                    out.push(" ", x.isExpr ? ":" : "", x.key);
                    out.push('="', htmlAttrEnc_1(x.value), '"');
                }
            }
        });
        out.push(">");
    }
    if (node.children.length) {
        if (whitespace)
            out.push("\n");
        for (var _i = 0, _d = node.children; _i < _d.length; _i++) {
            var c = _d[_i];
            if (whitespace && c !== node.children[0])
                out.push("\n");
            var txt = emitVueTemplate(c, whitespace);
            if (whitespace)
                txt = txt.split("\n").map(function (l) { return "  ".concat(l); }).join('\n'); // Indent
            out.push(txt);
        }
        if (whitespace)
            out.push("\n");
    }
    // Close tags except for 'void tags'. That includes '_html' because that's my element for raw HTML
    if (!["_html", "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"].includes(node.tag.toLowerCase()))
        out.push("</".concat(node.tag, ">"));
    return out.join("");
}

var VugNode = /** @class */ (function () {
    function VugNode(tag, words, children) {
        if (words === void 0) { words = []; }
        if (children === void 0) { children = []; }
        this.tag = tag;
        this.words = words;
        this.children = children;
    }
    VugNode.prototype.getWord = function (key) { var _a; return (_a = this.words.find(function (x) { return x.key === key; })) === null || _a === void 0 ? void 0 : _a.value; };
    VugNode.prototype.getWordErrIfCalc = function (key) {
        var find = this.words.find(function (x) { return x.key === key; });
        if (!find)
            return "";
        if (find.isExpr)
            throw "Attribute '".concat(find.key, "' cannot be an expression.");
        return find.value;
    };
    return VugNode;
}());
var VugWord = /** @class */ (function () {
    function VugWord(key, value, isExpr) {
        this.key = key;
        this.value = value;
        this.isExpr = isExpr;
    }
    return VugWord;
}());
function compile$1(text) {
    var ast = parseDoc(text);
    return {
        ast: ast,
        toAstJson: function () { return JSON.stringify(ast, undefined, 2); },
        toVueTemplate: function () { return ast.map(function (x) { return emitVueTemplate(x, true); }).join("\n"); }
    };
}
function splitTwo$1(text, sep) {
    var pos = text.indexOf(sep);
    if (pos < 0)
        return [text, ''];
    return [text.substr(0, pos), text.substr(pos + sep.length)];
}
var htmlNode = function (html) { return new VugNode("_html", [new VugWord("_contents", html, false)]); };
function parseLine(line) {
    line = splitTwo$1(line, "// ")[0]; // ignore comments
    if (line.startsWith("<"))
        line = "-- " + line; // allow HTML tags
    if (line.startsWith("-- "))
        line = " " + line; // so that it gets detected, as we've trimmed
    var _a = splitTwo$1(line, " -- "), _wordPart = _a[0], innerHtml = _a[1];
    if (!_wordPart)
        return htmlNode(innerHtml);
    var _b = _wordPart.trim().match(/(?=\S)[^"\s]*(?:"[^\\"]*(?:\\[\s\S][^\\"]*)*"[^"\s]*)*/g) || [''], tag = _b[0], words = _b.slice(1); // Not 100% sufficient. From https://stackoverflow.com/questions/4031900/split-a-string-by-whitespace-keeping-quoted-segments-allowing-escaped-quotes
    var words2 = words.map(function (w) {
        var _a = splitTwo$1(w, "="), key = _a[0], value = _a[1];
        if (value[0] === '"')
            value = value.slice(1, value.length - 1); // Remove quotes
        var isExpr = key[0] === ':';
        if (isExpr)
            key = key.slice(1);
        return new VugWord(key, value, isExpr);
    });
    var children = innerHtml ? [htmlNode(innerHtml)] : [];
    return new VugNode(tag, words2, children);
}
function parseDoc(html) {
    var lines = html.replace(/\t/g, "        ") // Convert tabs to 8 spaces, like Python 2. People shouldn't mix tabs and spaces anyway
        .split("\n").map(function (ln) {
        var trimmed = ln.trimStart();
        var indent = ln.length - trimmed.length;
        var node = parseLine(trimmed);
        return { node: node, indent: indent };
    }).filter(function (x) { return x.node.tag !== "_html" || (x.node.getWord("_contents") || '').trim(); }); // Remove empty or comment-only lines. They would be _html elements with blank _contents. (We could remove them before parsing, but the comment logic is in the parser)
    // Now make a tree
    var stack = [];
    var out = [];
    var _loop_1 = function (ln) {
        stack = stack.filter(function (x) { return x.indent < ln.indent; }); // Remove items from the stack unless they're LESS indented than me
        if (stack.length)
            stack.slice(-1)[0].node.children.push(ln.node); // Add us into the last stack item
        else
            out.push(ln.node); // Or as a top-level node, if the stack is empty
        stack.push(ln); // Push ourselves onto the stack, in case we have children
    };
    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
        var ln = lines_1[_i];
        _loop_1(ln);
    }
    // Run macros
    return out.map(function (x) { return runAll(x); });
}

function compile(text) {
    var nodes = text.replace(/\t/g, "        ") // Convert tabs to 8 spaces, like Python 2. People shouldn't mix tabs and spaces anyway
        .split("\n")
        .filter(function (x) { return x.trim(); }) // Remove blank lines
        .map(function (t) { return ({ text: t.trimStart(), indent: t.length - t.trimStart().length }); }) // Remove indent and mark that. Don't remove spaces at the end of the line as they may be significant.
        .map(function (info) { return (__assign(__assign({}, processLine(info.text)), { info: info })); });
    return childize(nodes, function (x) { return x.info.indent; });
}
function splitTwo(text, sep) {
    var pos = text.indexOf(sep);
    if (pos < 0)
        return [text];
    return [text.substr(0, pos), text.substr(pos + sep.length)];
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
function imbaCssShorthand(key) {
    var dict = {
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
        zi: "z-index"
    };
    return dict[key] || key;
}
function caseChange(txt) {
    var words = [];
    var isCapital = function (ch) { return ch === ch.toUpperCase(); };
    txt.split('').forEach(function (x, i) {
        var xLower = x.toLowerCase(), prevWord = words[words.length - 1], prevLetter = txt[i - 1];
        if (x === "-")
            return;
        // We add a word if there's no previous word, or if we're after a hyphen, or if we're a first capital (before us was not a capital)
        if (!prevWord || prevLetter === "-" || (isCapital(x) && !isCapital(prevLetter)))
            return words.push(xLower);
        // Otherwise add to previous word
        words[words.length - 1] += xLower;
    });
    var PascalWord = function (x) { return x[0].toUpperCase() + x.slice(1); };
    return {
        toPascal: function () { return words.map(PascalWord).join(""); },
        toCamel: function () { return words.map(function (x, i) { return i ? PascalWord(x) : x; }).join(""); },
        toSnake: function () { return words.join("-"); }
    };
}
var flexAlignmentShorthands = {
    c: "center",
    fs: "flex-start",
    fe: "flex-end",
    s: "start",
    e: "end",
    l: "left",
    r: "right",
    x: "stretch"
};
function macros(key, value) {
    var _a;
    if (key === "px")
        return { 'padding-left': value, 'padding-right': value };
    else if (key === "py")
        return { 'padding-top': value, 'padding-bottom': value };
    else if (key === "mx")
        return { 'margin-left': value, 'margin-right': value };
    else if (key === "my")
        return { 'margin-top': value, 'margin-bottom': value };
    else if (key === "sz")
        return { 'width': value, 'height': value }; // not 'size' because it's a valid HTML prop
    else if (key === "circ")
        return { 'border-radius': '100%' }; // not 'round' because might be used by other things
    else if (key === "al") { // set justify-content and align-items
        // syntax: al=center, al=c, al=c.c (the latter sets align-items too)
        var parts = value.split(".").map(function (x) { return flexAlignmentShorthands[x] || x; });
        if (parts.length > 2)
            throw "Can't have >2 parts: al=".concat(value);
        if (parts[1])
            return { 'justify-content': parts[0], 'align-items': parts[1] };
        return { 'justify-content': parts[0] };
    }
    else if (key === "display" && cssDisplayShortcuts[value])
        return { display: cssDisplayShortcuts[value] };
    // Commented out because this will require a further transform later to unify all the 'transform-___' attrs. Note also that some can be exprs and some not
    // const transformFuncs = "matrix|matrix3d|perspective|rotate|rotate3d|rotateX|rotateY|rotateZ|scale|scale3d|scaleX|scaleY|scaleZ|skew|skewX|skewY|translate|translate3d|translateX|translateY|translateZ|transform3d|matrix|matrix3d|perspective|rotate|rotate3d|rotateX|rotateY|rotateZ|scale|scale3d|scaleX|scaleY|scaleZ|skew|skewX|skewY|translate|translate3d|translateX|translateY|translateZ".split("|")
    // if (transformFuncs.includes(key)) return { ['transform-' + key]: value }
    return _a = {}, _a[key] = value, _a;
}
var cssDisplayShortcuts = {
    b: "block",
    i: "inline",
    f: "flex",
    g: "grid",
    ib: "inline-block",
    "if": "inline-flex",
    ig: "inline-grid"
};
function processLine(line) {
    line = splitTwo(line, "// ")[0]; // ignore comments
    if (line.startsWith("<"))
        line = "-- " + line; //return { tag: "html", attrs: [], innerHtml: line, children: [] }
    if (line.startsWith("-- "))
        line = " " + line; // so that it gets detected
    var _a = splitTwo(line, " -- "), wordPart = _a[0], innerHtml = _a[1];
    wordPart = wordPart.trim();
    var _b = wordPart.match(/(?=\S)[^"\s]*(?:"[^\\"]*(?:\\[\s\S][^\\"]*)*"[^"\s]*)*/g) || [''], tagPart = _b[0], words = _b.slice(1); // Not 100% sufficient. From https://stackoverflow.com/questions/4031900/split-a-string-by-whitespace-keeping-quoted-segments-allowing-escaped-quotes
    var _c = tagPart.split("."), __tag = _c[0], classesAttachedToTag = _c.slice(1);
    var _d = splitTwo(__tag, "#"), _tag = _d[0], id = _d[1];
    var tag = _tag || ((classesAttachedToTag.length || wordPart.length) ? 'div' : 'html'); // html for lines with no tag only innerHtml
    for (var _i = 0, classesAttachedToTag_1 = classesAttachedToTag; _i < classesAttachedToTag_1.length; _i++) {
        var x = classesAttachedToTag_1[_i];
        words.push("." + x);
    }
    if (id)
        words.push("id=" + id);
    if (tag === "d")
        tag = "div";
    else if (tag === "s")
        tag = "span";
    // else if (cssDisplayShortcuts[tag] && tag !== "b" && tag !== "i" && tag !== "if") { tag = "div"; words.push(`display=${cssDisplayShortcuts[tag]}`) } // experimental
    else if (tag === "f" || tag === "fr") {
        tag = "div";
        words.push("display=flex");
    } // experimental
    else if (tag === "fc") {
        tag = "div";
        words.push("display=flex");
        words.push("flex-direction=column");
    } // experimental
    else if (tag === "ib") {
        tag = "div";
        words.push("display=inline-block");
    } // experimental
    var attrs = [];
    for (var _e = 0, words_1 = words; _e < words_1.length; _e++) {
        var x = words_1[_e];
        var _f = splitTwo(x, "="), _key = _f[0], _value = _f[1];
        var isExpr = false, kind = "attr";
        if ((_value === null || _value === void 0 ? void 0 : _value[0]) === '"')
            _value = _value.slice(1, _value.length - 1); // Remove quotes
        else if ((_value === null || _value === void 0 ? void 0 : _value[0]) === '{') {
            _value = _value.slice(1, _value.length - 1);
            isExpr = true;
        }
        if (_key[0] === ":") {
            isExpr = true;
            _key = _key.slice(1);
        } // Vue-style :attr
        if (_key[0] === ".") {
            kind = "class";
            _key = _key.slice(1);
        }
        if (_key[0] === "*") {
            kind = "style";
            _key = _key.slice(1);
        }
        if (kind === "class" && _value)
            isExpr = true; // Classes with values are always boolean expressions
        // _key = ourCssShorthand(_key) // Disabled in favour of Imba's
        _key = imbaCssShorthand(_key);
        // Expand macros
        var afterMacros = macros(_key, _value);
        for (var _g = 0, _h = Object.keys(afterMacros); _g < _h.length; _g++) {
            var key = _h[_g];
            var value = afterMacros[key];
            if (cssProperties.includes(key) && kind === "attr")
                kind = "style";
            if (_key.startsWith("attr-")) {
                kind = "attr";
                _key = _key.slice(5);
            }
            if (kind === "style" && !isExpr && value)
                value = value.split(" ").map(function (x) { return /^-?([0-9]*\.)?[0-9]+q$/.test(x) ? "".concat(parseFloat(x) * 0.25, "rem") : x; }).join(" "); // add support for the "q" unit which is 0.25rem
            attrs.push({ key: key, value: value || undefined, isExpr: isExpr, kind: kind });
        }
    }
    return { tag: tag, attrs: attrs, innerHtml: innerHtml || undefined, children: [] };
}
function load(text) {
    var nodes = compile(text);
    var toVueTemplate = function (whitespace) {
        if (whitespace === void 0) { whitespace = false; }
        return nodes.map(function (x) { return nodeToVue(x, whitespace); }).join(whitespace ? "\n" : "");
    };
    return { ast: nodes, toVueTemplate: toVueTemplate, toRenderFunc: function () { return toRenderFunc(nodes[0]); } };
}
function toRenderFunc(node, opts) {
    if (opts === void 0) { opts = { ce: "/*#__PURE__*/React.createElement", className: "className" }; }
    if (node.tag === "html")
        return JSON.stringify(node.innerHtml || "");
    var attrExprText = new Map();
    var styleExprText = new Map();
    var classExprText = new Map();
    var mapToObj = function (m) { return ' { ' + Array.from(m.entries()).map(function (_a) {
        var k = _a[0], v = _a[1];
        return "".concat(JSON.stringify(k), ": ").concat(v);
    }).join(", ") + '} '; };
    for (var _i = 0, _a = node.attrs; _i < _a.length; _i++) {
        var x = _a[_i];
        var exprText = x.value === undefined ? 'true' : x.isExpr ? x.value : JSON.stringify(x.value);
        if (x.kind === "style") {
            styleExprText.set(caseChange(x.key).toCamel(), exprText);
            attrExprText.set('style', mapToObj(styleExprText));
        }
        else if (x.kind === "class") {
            classExprText.set(x.key, exprText);
            attrExprText.set(opts.className, "classNames(".concat(mapToObj(classExprText), ")"));
        }
        else {
            attrExprText.set(x.key, exprText);
        }
    }
    var out = [];
    out.push("".concat(opts.ce, "(").concat(JSON.stringify(node.tag), ", "));
    if (attrExprText.size)
        out.push(mapToObj(attrExprText));
    else
        out.push("null");
    // Children
    if (node.innerHtml)
        out.push(", " + JSON.stringify(node.innerHtml)); // TODO support interpolation?
    for (var _b = 0, _c = node.children; _b < _c.length; _b++) {
        var x = _c[_b];
        out.push(", " + toRenderFunc(x, opts));
    }
    out.push(")");
    return out.join("");
}
function nodeToVue(node, whitespace) {
    if (whitespace === void 0) { whitespace = false; }
    var out = [];
    if (node.tag === 'html') {
        out.push(node.innerHtml || "");
    }
    else {
        out.push('<', node.tag);
        var htmlAttrEnc_1 = function (x, usingApos) {
            if (usingApos === void 0) { usingApos = false; }
            return x.replace(/&/g, '&amp;').replace(usingApos ? /'/g : /"/g, usingApos ? '&#x27;' : '&quot;').replace(/>/g, '&gt;');
        };
        var block = function (items, funcs) { var _a, _b; if (!items.length)
            return; (_a = funcs.start) === null || _a === void 0 ? void 0 : _a.call(funcs); items.forEach(function (x, i) { var _a; if (i)
            (_a = funcs.between) === null || _a === void 0 ? void 0 : _a.call(funcs); funcs.each(x, i); }); (_b = funcs.end) === null || _b === void 0 ? void 0 : _b.call(funcs); };
        var _a = ['class', 'style', 'attr'].map(function (x) { return node.attrs.filter(function (y) { return y.kind === x; }); }), klass = _a[0], style = _a[1], attr = _a[2];
        var _b = partition(klass, function (x) { return x.isExpr; }), classExpr = _b[0], classStatic = _b[1];
        block(classStatic, {
            start: function () { return out.push(' class="'); },
            each: function (x) { out.push(x.key); if (x.value !== undefined)
                throw "CSS-Class attributes cannot have a static value. For a condition, use curly braces or simply no quotes. -- : " + x.key; },
            between: function () { return out.push(" "); },
            end: function () { return out.push('"'); }
        });
        block(classExpr, {
            start: function () { return out.push(" :class='{"); },
            each: function (x) {
                var expr = x.value === undefined ? 'true' : !x.isExpr ? JSON.stringify(x.value) : x.value;
                out.push(JSON.stringify(x.key), ': ', htmlAttrEnc_1(expr, true));
            },
            between: function () { return out.push(", "); },
            end: function () { return out.push("}'"); }
        });
        var _c = partition(style, function (x) { return x.isExpr; }), styleExpr = _c[0], styleStatic = _c[1];
        block(styleStatic, {
            start: function () { return out.push(' style="'); },
            each: function (x) { return out.push(x.key, ": ", x.value); },
            between: function () { return out.push("; "); },
            end: function () { return out.push('"'); }
        });
        block(styleExpr, {
            start: function () { return out.push(" :style='{"); },
            each: function (x) {
                if (x.value === undefined)
                    throw "Style keys must have a value: " + x.key;
                var expr = !x.isExpr ? JSON.stringify(x.value) : x.value;
                out.push(JSON.stringify(x.key), ': ', htmlAttrEnc_1(expr, true));
            },
            between: function () { return out.push(", "); },
            end: function () { return out.push("}'"); }
        });
        block(attr, {
            each: function (x) {
                if (x.value === undefined) {
                    out.push(" ", x.key);
                }
                else {
                    out.push(" ", x.isExpr ? ":" : "", x.key);
                    out.push('="', htmlAttrEnc_1(x.value), '"');
                }
            }
        });
        out.push(">");
        if (node.innerHtml)
            out.push(node.innerHtml);
    }
    for (var _i = 0, _d = node.children; _i < _d.length; _i++) {
        var c = _d[_i];
        var txt = nodeToVue(c, whitespace);
        if (whitespace)
            txt = txt.split("\n").map(function (l) { return "\n  ".concat(l); }).join("\n"); // Indent
        out.push(txt);
    }
    if (whitespace)
        out.push("\n");
    // Close tags except for 'void tags'. That includes 'html' because that's my element for raw HTML
    if (!["html", "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"].includes(node.tag.toLowerCase()))
        out.push("</".concat(node.tag, ">"));
    return out.join("");
}
function childize(items, getIndent) {
    var out = [];
    var stack = [];
    var _loop_1 = function (i) {
        var ch = __assign(__assign({}, i), { children: [] });
        // Remove items from the stack unless they're LESS indented than me
        stack = stack.filter(function (x) { return getIndent(x) < getIndent(ch); });
        // Add ourselves to the last stack element, otherwise to main
        var lastStack = stack.slice(-1)[0];
        if (lastStack)
            lastStack.children.push(ch);
        else
            out.push(ch);
        // Push ourselves onto the stack, in case we have children
        stack.push(ch);
    };
    for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
        var i = items_1[_i];
        _loop_1(i);
    }
    return out;
}
var cssProperties = "--*|-webkit-line-clamp|accent-color|align-content|align-items|align-self|alignment-baseline|all|animation|animation-delay|animation-direction|animation-duration|animation-fill-mode|animation-iteration-count|animation-name|animation-play-state|animation-timing-function|appearance|aspect-ratio|azimuth|backface-visibility|background|background-attachment|background-blend-mode|background-clip|background-color|background-image|background-origin|background-position|background-repeat|background-size|baseline-shift|baseline-source|block-ellipsis|block-size|block-step|block-step-align|block-step-insert|block-step-round|block-step-size|bookmark-label|bookmark-level|bookmark-state|border|border-block|border-block-color|border-block-end|border-block-end-color|border-block-end-style|border-block-end-width|border-block-start|border-block-start-color|border-block-start-style|border-block-start-width|border-block-style|border-block-width|border-bottom|border-bottom-color|border-bottom-left-radius|border-bottom-right-radius|border-bottom-style|border-bottom-width|border-boundary|border-collapse|border-color|border-end-end-radius|border-end-start-radius|border-image|border-image-outset|border-image-repeat|border-image-slice|border-image-source|border-image-width|border-inline|border-inline-color|border-inline-end|border-inline-end-color|border-inline-end-style|border-inline-end-width|border-inline-start|border-inline-start-color|border-inline-start-style|border-inline-start-width|border-inline-style|border-inline-width|border-left|border-left-color|border-left-style|border-left-width|border-radius|border-right|border-right-color|border-right-style|border-right-width|border-spacing|border-start-end-radius|border-start-start-radius|border-style|border-top|border-top-color|border-top-left-radius|border-top-right-radius|border-top-style|border-top-width|border-width|bottom|box-decoration-break|box-shadow|box-sizing|box-snap|break-after|break-before|break-inside|caption-side|caret|caret-color|caret-shape|chains|clear|clip|clip-path|clip-rule|color|color-adjust|color-interpolation-filters|color-scheme|column-count|column-fill|column-gap|column-rule|column-rule-color|column-rule-style|column-rule-width|column-span|column-width|columns|contain|contain-intrinsic-block-size|contain-intrinsic-height|contain-intrinsic-inline-size|contain-intrinsic-size|contain-intrinsic-width|container|container-name|container-type|content|content-visibility|continue|counter-increment|counter-reset|counter-set|cue|cue-after|cue-before|cursor|direction|display|dominant-baseline|elevation|empty-cells|fill|fill-break|fill-color|fill-image|fill-opacity|fill-origin|fill-position|fill-repeat|fill-rule|fill-size|filter|flex|flex-basis|flex-direction|flex-flow|flex-grow|flex-shrink|flex-wrap|float|float-defer|float-offset|float-reference|flood-color|flood-opacity|flow|flow-from|flow-into|font|font-family|font-feature-settings|font-kerning|font-language-override|font-optical-sizing|font-palette|font-size|font-size-adjust|font-stretch|font-style|font-synthesis|font-synthesis-small-caps|font-synthesis-style|font-synthesis-weight|font-variant|font-variant-alternates|font-variant-caps|font-variant-east-asian|font-variant-emoji|font-variant-ligatures|font-variant-numeric|font-variant-position|font-variation-settings|font-weight|footnote-display|footnote-policy|forced-color-adjust|gap|glyph-orientation-vertical|grid|grid-area|grid-auto-columns|grid-auto-flow|grid-auto-rows|grid-column|grid-column-end|grid-column-start|grid-row|grid-row-end|grid-row-start|grid-template|grid-template-areas|grid-template-columns|grid-template-rows|hanging-punctuation|height|hyphenate-character|hyphenate-limit-chars|hyphenate-limit-last|hyphenate-limit-lines|hyphenate-limit-zone|hyphens|image-orientation|image-rendering|image-resolution|initial-letter|initial-letter-align|initial-letter-wrap|inline-size|inline-sizing|input-security|inset|inset-block|inset-block-end|inset-block-start|inset-inline|inset-inline-end|inset-inline-start|isolation|justify-content|justify-items|justify-self|leading-trim|left|letter-spacing|lighting-color|line-break|line-clamp|line-grid|line-height|line-height-step|line-padding|line-snap|list-style|list-style-image|list-style-position|list-style-type|margin|margin-block|margin-block-end|margin-block-start|margin-bottom|margin-break|margin-inline|margin-inline-end|margin-inline-start|margin-left|margin-right|margin-top|margin-trim|marker|marker-end|marker-knockout-left|marker-knockout-right|marker-mid|marker-pattern|marker-segment|marker-side|marker-start|mask|mask-border|mask-border-mode|mask-border-outset|mask-border-repeat|mask-border-slice|mask-border-source|mask-border-width|mask-clip|mask-composite|mask-image|mask-mode|mask-origin|mask-position|mask-repeat|mask-size|mask-type|max-block-size|max-height|max-inline-size|max-lines|max-width|min-block-size|min-height|min-inline-size|min-intrinsic-sizing|min-width|mix-blend-mode|nav-down|nav-left|nav-right|nav-up|object-fit|object-position|offset|offset-anchor|offset-distance|offset-path|offset-position|offset-rotate|opacity|order|orphans|outline|outline-color|outline-offset|outline-style|outline-width|overflow|overflow-anchor|overflow-block|overflow-clip-margin|overflow-inline|overflow-wrap|overflow-x|overflow-y|overscroll-behavior|overscroll-behavior-block|overscroll-behavior-inline|overscroll-behavior-x|overscroll-behavior-y|padding|padding-block|padding-block-end|padding-block-start|padding-bottom|padding-inline|padding-inline-end|padding-inline-start|padding-left|padding-right|padding-top|page|page-break-after|page-break-before|page-break-inside|pause|pause-after|pause-before|perspective|perspective-origin|pitch|pitch-range|place-content|place-items|place-self|play-during|pointer-events|position|print-color-adjust|property-name|quotes|region-fragment|resize|rest|rest-after|rest-before|richness|right|rotate|row-gap|ruby-align|ruby-merge|ruby-overhang|ruby-position|running|scale|scroll-behavior|scroll-margin|scroll-margin-block|scroll-margin-block-end|scroll-margin-block-start|scroll-margin-bottom|scroll-margin-inline|scroll-margin-inline-end|scroll-margin-inline-start|scroll-margin-left|scroll-margin-right|scroll-margin-top|scroll-padding|scroll-padding-block|scroll-padding-block-end|scroll-padding-block-start|scroll-padding-bottom|scroll-padding-inline|scroll-padding-inline-end|scroll-padding-inline-start|scroll-padding-left|scroll-padding-right|scroll-padding-top|scroll-snap-align|scroll-snap-stop|scroll-snap-type|scrollbar-color|scrollbar-gutter|scrollbar-width|shape-image-threshold|shape-inside|shape-margin|shape-outside|spatial-navigation-action|spatial-navigation-contain|spatial-navigation-function|speak|speak-as|speak-header|speak-numeral|speak-punctuation|speech-rate|stress|string-set|stroke|stroke-align|stroke-alignment|stroke-break|stroke-color|stroke-dash-corner|stroke-dash-justify|stroke-dashadjust|stroke-dasharray|stroke-dashcorner|stroke-dashoffset|stroke-image|stroke-linecap|stroke-linejoin|stroke-miterlimit|stroke-opacity|stroke-origin|stroke-position|stroke-repeat|stroke-size|stroke-width|tab-size|table-layout|text-align|text-align-all|text-align-last|text-combine-upright|text-decoration|text-decoration-color|text-decoration-line|text-decoration-skip|text-decoration-skip-box|text-decoration-skip-ink|text-decoration-skip-inset|text-decoration-skip-self|text-decoration-skip-spaces|text-decoration-style|text-decoration-thickness|text-edge|text-emphasis|text-emphasis-color|text-emphasis-position|text-emphasis-skip|text-emphasis-style|text-group-align|text-indent|text-justify|text-orientation|text-overflow|text-shadow|text-space-collapse|text-space-trim|text-spacing|text-transform|text-underline-offset|text-underline-position|text-wrap|top|transform|transform-box|transform-origin|transform-style|transition|transition-delay|transition-duration|transition-property|transition-timing-function|translate|unicode-bidi|user-select|vertical-align|visibility|voice-balance|voice-duration|voice-family|voice-pitch|voice-range|voice-rate|voice-stress|voice-volume|volume|white-space|widows|width|will-change|word-boundary-detection|word-boundary-expansion|word-break|word-spacing|word-wrap|wrap-after|wrap-before|wrap-flow|wrap-inside|wrap-through|writing-mode|z-index".split("|");
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
function ViteTransformPlugin(opts) {
    if (opts === void 0) { opts = {}; }
    return {
        name: 'vite-plugin-vue-vug',
        enforce: "pre",
        transform: function (code, id) {
            if (!id.endsWith(".vue"))
                return;
            var findTemplateTag = /<template lang=['"]?vug['" >]/g.exec(code);
            if (!findTemplateTag)
                return;
            var startOfTemplateTag = findTemplateTag.index;
            var startOfCode = code.indexOf(">", startOfTemplateTag) + 1;
            var endOfCode = code.lastIndexOf("</template>");
            var vugCode = code.substring(startOfCode, endOfCode);
            var output = (opts._tempLangVersion || 1.2) >= 2 ? compile$1(vugCode).toVueTemplate() : load(vugCode).toVueTemplate();
            return code.substring(0, startOfTemplateTag) + "<template>" + output + code.substring(endOfCode); // We have to replace the template tag so the SFC compiler doesn't error because it doesn't know how to process Vue
        }
    };
}
function transformVugReact(code) {
    while (true) {
        var ind = code.indexOf("vugReact`");
        if (ind < 0)
            break;
        var end = code.indexOf("`", ind + 10);
        var contents = code.substring(ind + 9, end);
        contents = contents.replace(/@click/g, ':onClick'); // temp to support Vue syntax
        var converted = load(contents).toRenderFunc();
        converted = converted.replace(/\{\{/g, '" + '); // temp to support Vue syntax
        converted = converted.replace(/\}\}/g, ' + "'); // temp to support Vue syntax
        code = code.slice(0, ind) + converted + code.slice(end + 1);
        console.log(code);
    }
    return code;
}
function ViteReactPlugin() {
    return {
        name: 'vite-plugin-react-vug',
        enforce: "pre",
        transform: function (code, id) {
            if (!/\.m?(j|t)sx?$/.test(id))
                return;
            return transformVugReact(code);
        }
    };
}
var VueConsolidatePlugin = function () { return ({
    // Implements Vite's `consolidate` interface: https://github.com/vuejs/core/blob/471f66a1f6cd182f3e106184b2e06f7753382996/packages/compiler-sfc/src/compileTemplate.ts#L89  
    render: function (code, data, callback) {
        try {
            callback(undefined, load(code).toVueTemplate());
        }
        catch (e) {
            callback(String(e));
        }
    }
}); };

exports.ViteReactPlugin = ViteReactPlugin;
exports.ViteTransformPlugin = ViteTransformPlugin;
exports.VueConsolidatePlugin = VueConsolidatePlugin;
exports.load = load;
exports.transformVugReact = transformVugReact;
