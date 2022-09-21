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

function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}

/*
TODO
- See if we can move macros (incl flex) into processCssProp
- Maybe make it in multiple steps, or recursive, so that py=0.5q will work
- Un-export the others, and just use processCssProp
- See if we can un-export clone/wordTransformer in macros.ts
*/
function processCssProp(key, value) {
    var _a, _b;
    /*
    Supports shorthands, units, and soon macros. Meant for running from anywhere, not necessarily a lowering pass.
    Returns null if the key is not recognized.
    */
    if (cssProperties.includes(key))
        return _a = {}, _a[key] = allowQUnits(value), _a;
    if (imbaDict[key])
        return _b = {}, _b[imbaDict[key]] = allowQUnits(value), _b;
    // Macros
    if (key === "sz")
        return { "width": allowQUnits(value), "height": allowQUnits(value) };
    if (key === "px")
        return { "padding-left": allowQUnits(value), "padding-right": allowQUnits(value) };
    if (key === "py")
        return { "padding-top": allowQUnits(value), "padding-bottom": allowQUnits(value) };
    if (key === "mx")
        return { "margin-left": allowQUnits(value), "margin-right": allowQUnits(value) };
    if (key === "my")
        return { "margin-top": allowQUnits(value), "margin-bottom": allowQUnits(value) };
    if (key === "circ" && !value)
        return { "border-radius": "100%" };
    if (key === "d")
        return { "display": cssDisplayShorthand[value] }; // TODO not sure I want this, perhaps just use tag types, except b/i/if conflict, but can use full form for those. Or can use the arg
    return null;
}
function mainTransform(n) {
    var words = n.words.flatMap(function (w) {
        var processed = processCssProp(w.key, w.value);
        if (!processed)
            return w; // Not CSS
        return Object.keys(processed).map(function (k) { return new VugWord("style_".concat(k), processed[k], w.isExpr); });
    });
    return new VugNode(n.tag, words, n.children);
}
function allowQUnits(value) {
    if (/^-?([0-9]*\.)?[0-9]+q$/.test(value))
        return parseFloat(value) * 0.25 + 'rem';
    return value;
}
var cssDisplayShorthand = { b: "block", i: "inline", f: "flex", g: "grid", ib: "inline-block", "if": "inline-flex", ig: "inline-grid" };
function flexArg(n) {
    var value = n.getWordErrIfCalc("fx"); // we've moved it there
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
    if (value[0] === "v") {
        column = true;
        value = value.slice(1);
    }
    if (value[0] === "-") {
        row = true;
        value = value.slice(1);
    }
    if (value[0] === "h") {
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
    var obj = { fx: null, style_display: 'flex' };
    if (direction)
        obj['style_flex-direction'] = direction;
    // Alignment etc
    var flexAlignmentShorthands = {
        c: "center",
        s: "flex-start",
        e: "flex-end",
        // s: "start",
        // e: "end",
        l: "left",
        r: "right",
        x: "stretch"
    };
    var _a = __read(value.replace(/[.,]/g, '').split('').map(function (x) { return flexAlignmentShorthands[x] || x; }), 3), jc = _a[0], ai = _a[1], ac = _a[2];
    if (jc)
        obj['style_justify-content'] = jc;
    if (ai)
        obj['style_align-items'] = ai;
    if (ac)
        obj['style_align-content'] = ac;
    return clone(n, obj);
}
var imbaDict = { ac: "align-content", ai: "align-items", as: "align-self", b: "bottom", bc: "border-color", bcb: "border-bottom-color", bcl: "border-left-color", bcr: "border-right-color", bct: "border-top-color", bd: "border", bdb: "border-bottom", bdl: "border-left", bdr: "border-right", bdt: "border-top", bg: "background", bga: "background-attachment", bgc: "background-color", bgclip: "background-clip", bcgi: "background-image", bgo: "background-origin", bgp: "background-position", bgr: "background-repeat", bgs: "background-size", bs: "border-style", bsb: "border-bottom-style", bsl: "border-left-style", bsr: "border-right-style", bst: "border-top-style", bw: "border-width", bwb: "border-bottom-width", bwl: "border-left-width", bwr: "border-right-width", bwt: "border-top-width", c: "color", cg: "column-gap", d: "display", e: "ease", ec: "ease-colors", eo: "ease-opacity", et: "ease-transform", ff: "font-family", fl: "flex", flb: "flex-basis", fld: "flex-direction", flf: "flex-flow", flg: "flex-grow", fls: "flex-shrink", flw: "flex-wrap", fs: "font-size", fw: "font-weight", g: "gap", ga: "grid-area", gac: "grid-auto-columns", gaf: "grid-auto-flow", gar: "grid-auto-rows", gc: "grid-column", gce: "grid-column-end", gcg: "grid-column-gap", gcs: "grid-column-start", gr: "grid-row", gre: "grid-row-end", grg: "grid-row-gap", grs: "grid-row-start", gt: "grid-template", gta: "grid-template-areas", gtc: "grid-template-columns", gtr: "grid-template-rows", h: "height", jac: "place-content", jai: "place-items", jas: "place-self", jc: "justify-content", ji: "justify-items", js: "justify-self", l: "left", lh: "line-height", ls: "letter-spacing", m: "margin", mb: "margin-bottom", ml: "margin-left", mr: "margin-right", mt: "margin-top", o: "opacity", of: "overflow", ofa: "overflow-anchor", ofx: "overflow-x", ofy: "overflow-y", origin: "transform-origin", p: "padding", pb: "padding-bottom", pe: "pointer-events", pl: "padding-left", pos: "position", pr: "padding-right", pt: "padding-top", r: "right", rd: "border-radius", rdbl: "border-bottom-left-radius", rdbr: "border-bottom-right-radius", rdtl: "border-top-left-radius", rdtr: "border-top-right-radius", rg: "row-gap", shadow: "box-shadow", t: "top", ta: "text-align", td: "text-decoration", tdc: "text-decoration-color", tdl: "text-decoration-line", tds: "text-decoration-style", tdsi: "text-decoration-skip-ink", tdt: "text-decoration-thickness", te: "text-emphasis", tec: "text-emphasis-color", tep: "text-emphasis-position", tes: "text-emphasis-style", ts: "text-shadow", tt: "text-transform", tween: "transition", us: "user-select", va: "vertical-align", w: "width", ws: "white-space", zi: "z-index" };
var cssProperties = "--*|-webkit-line-clamp|accent-color|align-content|align-items|align-self|alignment-baseline|all|animation|animation-delay|animation-direction|animation-duration|animation-fill-mode|animation-iteration-count|animation-name|animation-play-state|animation-timing-function|appearance|aspect-ratio|azimuth|backface-visibility|background|background-attachment|background-blend-mode|background-clip|background-color|background-image|background-origin|background-position|background-repeat|background-size|baseline-shift|baseline-source|block-ellipsis|block-size|block-step|block-step-align|block-step-insert|block-step-round|block-step-size|bookmark-label|bookmark-level|bookmark-state|border|border-block|border-block-color|border-block-end|border-block-end-color|border-block-end-style|border-block-end-width|border-block-start|border-block-start-color|border-block-start-style|border-block-start-width|border-block-style|border-block-width|border-bottom|border-bottom-color|border-bottom-left-radius|border-bottom-right-radius|border-bottom-style|border-bottom-width|border-boundary|border-collapse|border-color|border-end-end-radius|border-end-start-radius|border-image|border-image-outset|border-image-repeat|border-image-slice|border-image-source|border-image-width|border-inline|border-inline-color|border-inline-end|border-inline-end-color|border-inline-end-style|border-inline-end-width|border-inline-start|border-inline-start-color|border-inline-start-style|border-inline-start-width|border-inline-style|border-inline-width|border-left|border-left-color|border-left-style|border-left-width|border-radius|border-right|border-right-color|border-right-style|border-right-width|border-spacing|border-start-end-radius|border-start-start-radius|border-style|border-top|border-top-color|border-top-left-radius|border-top-right-radius|border-top-style|border-top-width|border-width|bottom|box-decoration-break|box-shadow|box-sizing|box-snap|break-after|break-before|break-inside|caption-side|caret|caret-color|caret-shape|chains|clear|clip|clip-path|clip-rule|color|color-adjust|color-interpolation-filters|color-scheme|column-count|column-fill|column-gap|column-rule|column-rule-color|column-rule-style|column-rule-width|column-span|column-width|columns|contain|contain-intrinsic-block-size|contain-intrinsic-height|contain-intrinsic-inline-size|contain-intrinsic-size|contain-intrinsic-width|container|container-name|container-type|content|content-visibility|continue|counter-increment|counter-reset|counter-set|cue|cue-after|cue-before|cursor|direction|display|dominant-baseline|elevation|empty-cells|fill|fill-break|fill-color|fill-image|fill-opacity|fill-origin|fill-position|fill-repeat|fill-rule|fill-size|filter|flex|flex-basis|flex-direction|flex-flow|flex-grow|flex-shrink|flex-wrap|float|float-defer|float-offset|float-reference|flood-color|flood-opacity|flow|flow-from|flow-into|font|font-family|font-feature-settings|font-kerning|font-language-override|font-optical-sizing|font-palette|font-size|font-size-adjust|font-stretch|font-style|font-synthesis|font-synthesis-small-caps|font-synthesis-style|font-synthesis-weight|font-variant|font-variant-alternates|font-variant-caps|font-variant-east-asian|font-variant-emoji|font-variant-ligatures|font-variant-numeric|font-variant-position|font-variation-settings|font-weight|footnote-display|footnote-policy|forced-color-adjust|gap|glyph-orientation-vertical|grid|grid-area|grid-auto-columns|grid-auto-flow|grid-auto-rows|grid-column|grid-column-end|grid-column-start|grid-row|grid-row-end|grid-row-start|grid-template|grid-template-areas|grid-template-columns|grid-template-rows|hanging-punctuation|height|hyphenate-character|hyphenate-limit-chars|hyphenate-limit-last|hyphenate-limit-lines|hyphenate-limit-zone|hyphens|image-orientation|image-rendering|image-resolution|initial-letter|initial-letter-align|initial-letter-wrap|inline-size|inline-sizing|input-security|inset|inset-block|inset-block-end|inset-block-start|inset-inline|inset-inline-end|inset-inline-start|isolation|justify-content|justify-items|justify-self|leading-trim|left|letter-spacing|lighting-color|line-break|line-clamp|line-grid|line-height|line-height-step|line-padding|line-snap|list-style|list-style-image|list-style-position|list-style-type|margin|margin-block|margin-block-end|margin-block-start|margin-bottom|margin-break|margin-inline|margin-inline-end|margin-inline-start|margin-left|margin-right|margin-top|margin-trim|marker|marker-end|marker-knockout-left|marker-knockout-right|marker-mid|marker-pattern|marker-segment|marker-side|marker-start|mask|mask-border|mask-border-mode|mask-border-outset|mask-border-repeat|mask-border-slice|mask-border-source|mask-border-width|mask-clip|mask-composite|mask-image|mask-mode|mask-origin|mask-position|mask-repeat|mask-size|mask-type|max-block-size|max-height|max-inline-size|max-lines|max-width|min-block-size|min-height|min-inline-size|min-intrinsic-sizing|min-width|mix-blend-mode|nav-down|nav-left|nav-right|nav-up|object-fit|object-position|offset|offset-anchor|offset-distance|offset-path|offset-position|offset-rotate|opacity|order|orphans|outline|outline-color|outline-offset|outline-style|outline-width|overflow|overflow-anchor|overflow-block|overflow-clip-margin|overflow-inline|overflow-wrap|overflow-x|overflow-y|overscroll-behavior|overscroll-behavior-block|overscroll-behavior-inline|overscroll-behavior-x|overscroll-behavior-y|padding|padding-block|padding-block-end|padding-block-start|padding-bottom|padding-inline|padding-inline-end|padding-inline-start|padding-left|padding-right|padding-top|page|page-break-after|page-break-before|page-break-inside|pause|pause-after|pause-before|perspective|perspective-origin|pitch|pitch-range|place-content|place-items|place-self|play-during|pointer-events|position|print-color-adjust|property-name|quotes|region-fragment|resize|rest|rest-after|rest-before|richness|right|rotate|row-gap|ruby-align|ruby-merge|ruby-overhang|ruby-position|running|scale|scroll-behavior|scroll-margin|scroll-margin-block|scroll-margin-block-end|scroll-margin-block-start|scroll-margin-bottom|scroll-margin-inline|scroll-margin-inline-end|scroll-margin-inline-start|scroll-margin-left|scroll-margin-right|scroll-margin-top|scroll-padding|scroll-padding-block|scroll-padding-block-end|scroll-padding-block-start|scroll-padding-bottom|scroll-padding-inline|scroll-padding-inline-end|scroll-padding-inline-start|scroll-padding-left|scroll-padding-right|scroll-padding-top|scroll-snap-align|scroll-snap-stop|scroll-snap-type|scrollbar-color|scrollbar-gutter|scrollbar-width|shape-image-threshold|shape-inside|shape-margin|shape-outside|spatial-navigation-action|spatial-navigation-contain|spatial-navigation-function|speak|speak-as|speak-header|speak-numeral|speak-punctuation|speech-rate|stress|string-set|stroke|stroke-align|stroke-alignment|stroke-break|stroke-color|stroke-dash-corner|stroke-dash-justify|stroke-dashadjust|stroke-dasharray|stroke-dashcorner|stroke-dashoffset|stroke-image|stroke-linecap|stroke-linejoin|stroke-miterlimit|stroke-opacity|stroke-origin|stroke-position|stroke-repeat|stroke-size|stroke-width|tab-size|table-layout|text-align|text-align-all|text-align-last|text-combine-upright|text-decoration|text-decoration-color|text-decoration-line|text-decoration-skip|text-decoration-skip-box|text-decoration-skip-ink|text-decoration-skip-inset|text-decoration-skip-self|text-decoration-skip-spaces|text-decoration-style|text-decoration-thickness|text-edge|text-emphasis|text-emphasis-color|text-emphasis-position|text-emphasis-skip|text-emphasis-style|text-group-align|text-indent|text-justify|text-orientation|text-overflow|text-shadow|text-space-collapse|text-space-trim|text-spacing|text-transform|text-underline-offset|text-underline-position|text-wrap|top|transform|transform-box|transform-origin|transform-style|transition|transition-delay|transition-duration|transition-property|transition-timing-function|translate|unicode-bidi|user-select|vertical-align|visibility|voice-balance|voice-duration|voice-family|voice-pitch|voice-range|voice-rate|voice-stress|voice-volume|volume|white-space|widows|width|will-change|word-boundary-detection|word-boundary-expansion|word-break|word-spacing|word-wrap|wrap-after|wrap-before|wrap-flow|wrap-inside|wrap-through|writing-mode|z-index".split("|"); // TODO can optimize into a map

function sheetStyles(n) {
    /*
    Handles css attributes that are to be converted into stylesheet rules
    (i.e. `css` custom tag, handled later in the pipeline).
        div *bg=green *bg:hover=green
    - TODO maybe don't require the star, do it wherever it has a colon, and for things without colons, do bg:all, bg:css, bg:*, etc.
        - OR if there is anything conditional, put styles on that element in a stylesheet by default, UNLESS overridden by a star, or style-, etc.
        - OR maybe ALWAYS put things in a stylesheet by default, why not?
    */
    var newCssTags = [];
    var ourWords = n.words.flatMap(function (w) {
        if (w.key[0] !== '*')
            return [w];
        if (w.isExpr)
            throw "Stylesheet CSS attribute '".concat(w.key, "' must be a literal, not an expression like '").concat(w.value, "'");
        var newTagKey = "css";
        if (w.key.includes(":"))
            newTagKey += ":" + w.key.split(":").slice(1).join(":");
        newCssTags.push(new VugNode(newTagKey, [new VugWord(w.key.slice(1).split(":")[0], w.value, false)]));
        return []; // skip the word, we've added it to newCssTags
    });
    if (!newCssTags.length)
        return n;
    return new VugNode(n.tag, ourWords, __spreadArray(__spreadArray([], __read(newCssTags), false), __read(n.children), false));
}
function cssCustomTag(n) {
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
    - I don't know how this is catching args, tagNameParser was supposed to take it out and put it under 'type'
    - "opacity=0.5" errors with "Props of a CSS tag can't be expressions, since they're inserted as a stylesheet" since numbers are parsed as expressions
    */
    function cssStringForCssCustomTag(cssTag) {
        var e_1, _a;
        var selector = cssTag.getWordErrIfCalc("selector") || cssTag.getWordErrIfCalc("s") || '&';
        var rule = cssTag.children.map(function (x) { return x.getWord("_contents"); }).join(" ");
        var attrs = cssTag.words.filter(function (x) { return x.key !== "selector" && x.key !== "s"; });
        if (rule.includes("{")) {
            if (selector !== "&")
                throw "Can't have a rule with braces when a selector is specified. '" + selector;
            if (attrs.length)
                throw "Can't have attributes when a selector is specified."; // TODO maybe allow as long as there's %%% etc
        }
        else { // no braces. Parse words
            try {
                for (var attrs_1 = __values(attrs), attrs_1_1 = attrs_1.next(); !attrs_1_1.done; attrs_1_1 = attrs_1.next()) {
                    var prop_1 = attrs_1_1.value;
                    if (prop_1.isExpr)
                        throw "Props of a CSS tag can't be expressions, since they're inserted as a stylesheet";
                    var x = processCssProp(prop_1.key, prop_1.value);
                    if (!x)
                        throw "Unrecognized CSS property (of a CSS tag): " + prop_1.key;
                    for (var k in x)
                        rule = "".concat(k, ": ").concat(x[k], "; ").concat(rule); // TODO reverse really
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (attrs_1_1 && !attrs_1_1.done && (_a = attrs_1["return"])) _a.call(attrs_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            rule = parseStyleVariants(cssTag.tag, selector, rule); // parse arg
        }
        return rule;
    }
    var isCssChild = function (x) { return x.tag === "css" || x.tag.startsWith("css:"); }; // TODO use parseArgs
    var cssChildren = n.children.filter(isCssChild);
    if (!cssChildren.length)
        return n;
    var text = cssChildren.map(cssStringForCssCustomTag).join(" ");
    return new VugNode(n.tag, __spreadArray(__spreadArray([], __read(n.words), false), [new VugWord("vg-css", text, false)], false), n.children.filter(function (x) { return !isCssChild(x); }));
}
function compileVgCss(n) {
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
    var contents = n.getWord("vg-css");
    if (!contents)
        return n;
    var script = "\n        if (!$el) return;\n        if ($el.$el) $el = $el.$el;\n        const d = $el.ownerDocument; \n        let st = null;\n        if (!$el.vgcssKey) {\n            $el.vgcssKey = 'vg_' + String((Math.random()+1).toString(36).slice(7));\n            st = d.head.appendChild(d.createElement('style'));\n            st.dataset[$el.vgcssKey] = '';\n            $el.dataset.vgcss = $el.vgcssKey;\n        } else {\n            st = d.querySelector('*[data-' + $el.vgcssKey + ']');\n        }\n        st.innerText = ".concat(JSON.stringify(contents), ".replace(/&/g, '*[data-vgcss=' + $el.vgcssKey + ']');\n    ").replace(/\n/g, '').replace(/[ \t]+/g, ' ').replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    // return clone(n, { "vg-css": null, "vg-do": script })
    return clone(n, { "vg-css": null, ":ref": "$el => { ".concat(script, " }") });
}
function parseStyleVariants(key, start, attrs) {
    var e_2, _a, e_3, _b;
    if (start === void 0) { start = ".foo"; }
    if (attrs === void 0) { attrs = "%%%"; }
    // Returns ".foo:extraThings { %%% }"
    // `key` is in the format `ignored:someVariant:otherVariant:!negatedVariant:@variant:[& .customTarget]`
    var parts = splitThree(key, ":").slice(1);
    var respBrkpts = { sm: 640, md: 768, lg: 1024, xl: 1280, "2xl": 1536 };
    var sel = start, blocks = [];
    try {
        for (var parts_1 = __values(parts), parts_1_1 = parts_1.next(); !parts_1_1.done; parts_1_1 = parts_1.next()) {
            var x = parts_1_1.value;
            if (["hover", "focus", "active", "focus-within", "focus-visible", "disabled", "visited", "checked"].includes(x))
                sel = "".concat(sel, ":").concat(x);
            else if (x === "last" || x === "first")
                sel = "".concat(sel, ":").concat(x, "-child");
            else if (x === "odd" || x === "even")
                sel = "".concat(sel, ":nth-child(").concat(x, ")");
            else if (x[0] === '.')
                sel = "".concat(sel).concat(x);
            else if (x[0] === '!') { // negation -- experimental and hacky
                var plchldr = '.dummySelectorHREKJSBLLI';
                var done = parseStyleVariants("thisPartIsIgnored:" + x.slice(1), plchldr, '%%%').split('{')[0].trim();
                var whatAdded = done.slice(done.indexOf(plchldr) + plchldr.length);
                sel = "".concat(sel, ":not(").concat(whatAdded, ")");
            }
            else if (x[0] === '[' && x[x.length - 1] === ']')
                sel = x.slice(1, x.length - 1).replace(/\&/g, sel);
            else if (x[0] === '@')
                blocks.unshift(x);
            else if (x[0] === "<" && respBrkpts[x.slice(1)])
                blocks.unshift("@media (max-width: ".concat(respBrkpts[x.slice(1)] - 1, "px)"));
            else if (respBrkpts[x])
                blocks.unshift("@media (min-width: ".concat(respBrkpts[x], "px)"));
            else if (x === "motion-safe")
                blocks.unshift("@media (prefers-reduced-motion: no-preference)");
            else if (x === "motion-reduce")
                blocks.unshift("@media (prefers-reduced-motion: reduce)");
            else if (!x) { } // nothing after the colon; perhaps it was there just to ensure it's a rule (though currently we any use * at the beginning)
            else
                throw "Unknown style variant: '".concat(x, "'");
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (parts_1_1 && !parts_1_1.done && (_a = parts_1["return"])) _a.call(parts_1);
        }
        finally { if (e_2) throw e_2.error; }
    }
    var ret = "".concat(sel, " { ").concat(attrs, " }");
    try {
        for (var blocks_1 = __values(blocks), blocks_1_1 = blocks_1.next(); !blocks_1_1.done; blocks_1_1 = blocks_1.next()) {
            var b = blocks_1_1.value;
            ret = "".concat(b, " {\n") + ret.split("\n").map(function (x) { return "  ".concat(x); }).join("\n") + "\n}";
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (blocks_1_1 && !blocks_1_1.done && (_b = blocks_1["return"])) _b.call(blocks_1);
        }
        finally { if (e_3) throw e_3.error; }
    }
    return ret;
}

// Adding this file into here because there are issues importing it in GitHub's build only. So silly.

/**
 * marked - a markdown parser
 * Copyright (c) 2011-2022, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/markedjs/marked
 */

/**
 * DO NOT EDIT THIS FILE
 * The code in this file is generated from files in ./src/
 */

 function getDefaults() {
    return {
      baseUrl: null,
      breaks: false,
      extensions: null,
      gfm: true,
      headerIds: true,
      headerPrefix: '',
      highlight: null,
      langPrefix: 'language-',
      mangle: true,
      pedantic: false,
      renderer: null,
      sanitize: false,
      sanitizer: null,
      silent: false,
      smartLists: false,
      smartypants: false,
      tokenizer: null,
      walkTokens: null,
      xhtml: false
    };
  }
  
  let defaults = getDefaults();
  
  function changeDefaults(newDefaults) {
    defaults = newDefaults;
  }
  
  /**
   * Helpers
   */
  const escapeTest = /[&<>"']/;
  const escapeReplace = /[&<>"']/g;
  const escapeTestNoEncode = /[<>"']|&(?!#?\w+;)/;
  const escapeReplaceNoEncode = /[<>"']|&(?!#?\w+;)/g;
  const escapeReplacements = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  const getEscapeReplacement = (ch) => escapeReplacements[ch];
  function escape(html, encode) {
    if (encode) {
      if (escapeTest.test(html)) {
        return html.replace(escapeReplace, getEscapeReplacement);
      }
    } else {
      if (escapeTestNoEncode.test(html)) {
        return html.replace(escapeReplaceNoEncode, getEscapeReplacement);
      }
    }
  
    return html;
  }
  
  const unescapeTest = /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig;
  
  /**
   * @param {string} html
   */
  function unescape(html) {
    // explicitly match decimal, hex, and named HTML entities
    return html.replace(unescapeTest, (_, n) => {
      n = n.toLowerCase();
      if (n === 'colon') return ':';
      if (n.charAt(0) === '#') {
        return n.charAt(1) === 'x'
          ? String.fromCharCode(parseInt(n.substring(2), 16))
          : String.fromCharCode(+n.substring(1));
      }
      return '';
    });
  }
  
  const caret = /(^|[^\[])\^/g;
  
  /**
   * @param {string | RegExp} regex
   * @param {string} opt
   */
  function edit(regex, opt) {
    regex = typeof regex === 'string' ? regex : regex.source;
    opt = opt || '';
    const obj = {
      replace: (name, val) => {
        val = val.source || val;
        val = val.replace(caret, '$1');
        regex = regex.replace(name, val);
        return obj;
      },
      getRegex: () => {
        return new RegExp(regex, opt);
      }
    };
    return obj;
  }
  
  const nonWordAndColonTest = /[^\w:]/g;
  const originIndependentUrl = /^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;
  
  /**
   * @param {boolean} sanitize
   * @param {string} base
   * @param {string} href
   */
  function cleanUrl(sanitize, base, href) {
    if (sanitize) {
      let prot;
      try {
        prot = decodeURIComponent(unescape(href))
          .replace(nonWordAndColonTest, '')
          .toLowerCase();
      } catch (e) {
        return null;
      }
      if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0 || prot.indexOf('data:') === 0) {
        return null;
      }
    }
    if (base && !originIndependentUrl.test(href)) {
      href = resolveUrl(base, href);
    }
    try {
      href = encodeURI(href).replace(/%25/g, '%');
    } catch (e) {
      return null;
    }
    return href;
  }
  
  const baseUrls = {};
  const justDomain = /^[^:]+:\/*[^/]*$/;
  const protocol = /^([^:]+:)[\s\S]*$/;
  const domain = /^([^:]+:\/*[^/]*)[\s\S]*$/;
  
  /**
   * @param {string} base
   * @param {string} href
   */
  function resolveUrl(base, href) {
    if (!baseUrls[' ' + base]) {
      // we can ignore everything in base after the last slash of its path component,
      // but we might need to add _that_
      // https://tools.ietf.org/html/rfc3986#section-3
      if (justDomain.test(base)) {
        baseUrls[' ' + base] = base + '/';
      } else {
        baseUrls[' ' + base] = rtrim(base, '/', true);
      }
    }
    base = baseUrls[' ' + base];
    const relativeBase = base.indexOf(':') === -1;
  
    if (href.substring(0, 2) === '//') {
      if (relativeBase) {
        return href;
      }
      return base.replace(protocol, '$1') + href;
    } else if (href.charAt(0) === '/') {
      if (relativeBase) {
        return href;
      }
      return base.replace(domain, '$1') + href;
    } else {
      return base + href;
    }
  }
  
  const noopTest = { exec: function noopTest() {} };
  
  function merge(obj) {
    let i = 1,
      target,
      key;
  
    for (; i < arguments.length; i++) {
      target = arguments[i];
      for (key in target) {
        if (Object.prototype.hasOwnProperty.call(target, key)) {
          obj[key] = target[key];
        }
      }
    }
  
    return obj;
  }
  
  function splitCells(tableRow, count) {
    // ensure that every cell-delimiting pipe has a space
    // before it to distinguish it from an escaped pipe
    const row = tableRow.replace(/\|/g, (match, offset, str) => {
        let escaped = false,
          curr = offset;
        while (--curr >= 0 && str[curr] === '\\') escaped = !escaped;
        if (escaped) {
          // odd number of slashes means | is escaped
          // so we leave it alone
          return '|';
        } else {
          // add space before unescaped |
          return ' |';
        }
      }),
      cells = row.split(/ \|/);
    let i = 0;
  
    // First/last cell in a row cannot be empty if it has no leading/trailing pipe
    if (!cells[0].trim()) { cells.shift(); }
    if (cells.length > 0 && !cells[cells.length - 1].trim()) { cells.pop(); }
  
    if (cells.length > count) {
      cells.splice(count);
    } else {
      while (cells.length < count) cells.push('');
    }
  
    for (; i < cells.length; i++) {
      // leading or trailing whitespace is ignored per the gfm spec
      cells[i] = cells[i].trim().replace(/\\\|/g, '|');
    }
    return cells;
  }
  
  /**
   * Remove trailing 'c's. Equivalent to str.replace(/c*$/, '').
   * /c*$/ is vulnerable to REDOS.
   *
   * @param {string} str
   * @param {string} c
   * @param {boolean} invert Remove suffix of non-c chars instead. Default falsey.
   */
  function rtrim(str, c, invert) {
    const l = str.length;
    if (l === 0) {
      return '';
    }
  
    // Length of suffix matching the invert condition.
    let suffLen = 0;
  
    // Step left until we fail to match the invert condition.
    while (suffLen < l) {
      const currChar = str.charAt(l - suffLen - 1);
      if (currChar === c && !invert) {
        suffLen++;
      } else if (currChar !== c && invert) {
        suffLen++;
      } else {
        break;
      }
    }
  
    return str.slice(0, l - suffLen);
  }
  
  function findClosingBracket(str, b) {
    if (str.indexOf(b[1]) === -1) {
      return -1;
    }
    const l = str.length;
    let level = 0,
      i = 0;
    for (; i < l; i++) {
      if (str[i] === '\\') {
        i++;
      } else if (str[i] === b[0]) {
        level++;
      } else if (str[i] === b[1]) {
        level--;
        if (level < 0) {
          return i;
        }
      }
    }
    return -1;
  }
  
  function checkSanitizeDeprecation(opt) {
    if (opt && opt.sanitize && !opt.silent) {
      console.warn('marked(): sanitize and sanitizer parameters are deprecated since version 0.7.0, should not be used and will be removed in the future. Read more here: https://marked.js.org/#/USING_ADVANCED.md#options');
    }
  }
  
  // copied from https://stackoverflow.com/a/5450113/806777
  /**
   * @param {string} pattern
   * @param {number} count
   */
  function repeatString(pattern, count) {
    if (count < 1) {
      return '';
    }
    let result = '';
    while (count > 1) {
      if (count & 1) {
        result += pattern;
      }
      count >>= 1;
      pattern += pattern;
    }
    return result + pattern;
  }
  
  function outputLink(cap, link, raw, lexer) {
    const href = link.href;
    const title = link.title ? escape(link.title) : null;
    const text = cap[1].replace(/\\([\[\]])/g, '$1');
  
    if (cap[0].charAt(0) !== '!') {
      lexer.state.inLink = true;
      const token = {
        type: 'link',
        raw,
        href,
        title,
        text,
        tokens: lexer.inlineTokens(text, [])
      };
      lexer.state.inLink = false;
      return token;
    }
    return {
      type: 'image',
      raw,
      href,
      title,
      text: escape(text)
    };
  }
  
  function indentCodeCompensation(raw, text) {
    const matchIndentToCode = raw.match(/^(\s+)(?:```)/);
  
    if (matchIndentToCode === null) {
      return text;
    }
  
    const indentToCode = matchIndentToCode[1];
  
    return text
      .split('\n')
      .map(node => {
        const matchIndentInNode = node.match(/^\s+/);
        if (matchIndentInNode === null) {
          return node;
        }
  
        const [indentInNode] = matchIndentInNode;
  
        if (indentInNode.length >= indentToCode.length) {
          return node.slice(indentToCode.length);
        }
  
        return node;
      })
      .join('\n');
  }
  
  /**
   * Tokenizer
   */
  class Tokenizer {
    constructor(options) {
      this.options = options || defaults;
    }
  
    space(src) {
      const cap = this.rules.block.newline.exec(src);
      if (cap && cap[0].length > 0) {
        return {
          type: 'space',
          raw: cap[0]
        };
      }
    }
  
    code(src) {
      const cap = this.rules.block.code.exec(src);
      if (cap) {
        const text = cap[0].replace(/^ {1,4}/gm, '');
        return {
          type: 'code',
          raw: cap[0],
          codeBlockStyle: 'indented',
          text: !this.options.pedantic
            ? rtrim(text, '\n')
            : text
        };
      }
    }
  
    fences(src) {
      const cap = this.rules.block.fences.exec(src);
      if (cap) {
        const raw = cap[0];
        const text = indentCodeCompensation(raw, cap[3] || '');
  
        return {
          type: 'code',
          raw,
          lang: cap[2] ? cap[2].trim() : cap[2],
          text
        };
      }
    }
  
    heading(src) {
      const cap = this.rules.block.heading.exec(src);
      if (cap) {
        let text = cap[2].trim();
  
        // remove trailing #s
        if (/#$/.test(text)) {
          const trimmed = rtrim(text, '#');
          if (this.options.pedantic) {
            text = trimmed.trim();
          } else if (!trimmed || / $/.test(trimmed)) {
            // CommonMark requires space before trailing #s
            text = trimmed.trim();
          }
        }
  
        const token = {
          type: 'heading',
          raw: cap[0],
          depth: cap[1].length,
          text,
          tokens: []
        };
        this.lexer.inline(token.text, token.tokens);
        return token;
      }
    }
  
    hr(src) {
      const cap = this.rules.block.hr.exec(src);
      if (cap) {
        return {
          type: 'hr',
          raw: cap[0]
        };
      }
    }
  
    blockquote(src) {
      const cap = this.rules.block.blockquote.exec(src);
      if (cap) {
        const text = cap[0].replace(/^ *>[ \t]?/gm, '');
  
        return {
          type: 'blockquote',
          raw: cap[0],
          tokens: this.lexer.blockTokens(text, []),
          text
        };
      }
    }
  
    list(src) {
      let cap = this.rules.block.list.exec(src);
      if (cap) {
        let raw, istask, ischecked, indent, i, blankLine, endsWithBlankLine,
          line, nextLine, rawLine, itemContents, endEarly;
  
        let bull = cap[1].trim();
        const isordered = bull.length > 1;
  
        const list = {
          type: 'list',
          raw: '',
          ordered: isordered,
          start: isordered ? +bull.slice(0, -1) : '',
          loose: false,
          items: []
        };
  
        bull = isordered ? `\\d{1,9}\\${bull.slice(-1)}` : `\\${bull}`;
  
        if (this.options.pedantic) {
          bull = isordered ? bull : '[*+-]';
        }
  
        // Get next list item
        const itemRegex = new RegExp(`^( {0,3}${bull})((?:[\t ][^\\n]*)?(?:\\n|$))`);
  
        // Check if current bullet point can start a new List Item
        while (src) {
          endEarly = false;
          if (!(cap = itemRegex.exec(src))) {
            break;
          }
  
          if (this.rules.block.hr.test(src)) { // End list if bullet was actually HR (possibly move into itemRegex?)
            break;
          }
  
          raw = cap[0];
          src = src.substring(raw.length);
  
          line = cap[2].split('\n', 1)[0];
          nextLine = src.split('\n', 1)[0];
  
          if (this.options.pedantic) {
            indent = 2;
            itemContents = line.trimLeft();
          } else {
            indent = cap[2].search(/[^ ]/); // Find first non-space char
            indent = indent > 4 ? 1 : indent; // Treat indented code blocks (> 4 spaces) as having only 1 indent
            itemContents = line.slice(indent);
            indent += cap[1].length;
          }
  
          blankLine = false;
  
          if (!line && /^ *$/.test(nextLine)) { // Items begin with at most one blank line
            raw += nextLine + '\n';
            src = src.substring(nextLine.length + 1);
            endEarly = true;
          }
  
          if (!endEarly) {
            const nextBulletRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}(?:[*+-]|\\d{1,9}[.)])((?: [^\\n]*)?(?:\\n|$))`);
            const hrRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`);
            const fencesBeginRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}(?:\`\`\`|~~~)`);
            const headingBeginRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}#`);
  
            // Check if following lines should be included in List Item
            while (src) {
              rawLine = src.split('\n', 1)[0];
              line = rawLine;
  
              // Re-align to follow commonmark nesting rules
              if (this.options.pedantic) {
                line = line.replace(/^ {1,4}(?=( {4})*[^ ])/g, '  ');
              }
  
              // End list item if found code fences
              if (fencesBeginRegex.test(line)) {
                break;
              }
  
              // End list item if found start of new heading
              if (headingBeginRegex.test(line)) {
                break;
              }
  
              // End list item if found start of new bullet
              if (nextBulletRegex.test(line)) {
                break;
              }
  
              // Horizontal rule found
              if (hrRegex.test(src)) {
                break;
              }
  
              if (line.search(/[^ ]/) >= indent || !line.trim()) { // Dedent if possible
                itemContents += '\n' + line.slice(indent);
              } else if (!blankLine) { // Until blank line, item doesn't need indentation
                itemContents += '\n' + line;
              } else { // Otherwise, improper indentation ends this item
                break;
              }
  
              if (!blankLine && !line.trim()) { // Check if current line is blank
                blankLine = true;
              }
  
              raw += rawLine + '\n';
              src = src.substring(rawLine.length + 1);
            }
          }
  
          if (!list.loose) {
            // If the previous item ended with a blank line, the list is loose
            if (endsWithBlankLine) {
              list.loose = true;
            } else if (/\n *\n *$/.test(raw)) {
              endsWithBlankLine = true;
            }
          }
  
          // Check for task list items
          if (this.options.gfm) {
            istask = /^\[[ xX]\] /.exec(itemContents);
            if (istask) {
              ischecked = istask[0] !== '[ ] ';
              itemContents = itemContents.replace(/^\[[ xX]\] +/, '');
            }
          }
  
          list.items.push({
            type: 'list_item',
            raw,
            task: !!istask,
            checked: ischecked,
            loose: false,
            text: itemContents
          });
  
          list.raw += raw;
        }
  
        // Do not consume newlines at end of final item. Alternatively, make itemRegex *start* with any newlines to simplify/speed up endsWithBlankLine logic
        list.items[list.items.length - 1].raw = raw.trimRight();
        list.items[list.items.length - 1].text = itemContents.trimRight();
        list.raw = list.raw.trimRight();
  
        const l = list.items.length;
  
        // Item child tokens handled here at end because we needed to have the final item to trim it first
        for (i = 0; i < l; i++) {
          this.lexer.state.top = false;
          list.items[i].tokens = this.lexer.blockTokens(list.items[i].text, []);
          const spacers = list.items[i].tokens.filter(t => t.type === 'space');
          const hasMultipleLineBreaks = spacers.every(t => {
            const chars = t.raw.split('');
            let lineBreaks = 0;
            for (const char of chars) {
              if (char === '\n') {
                lineBreaks += 1;
              }
              if (lineBreaks > 1) {
                return true;
              }
            }
  
            return false;
          });
  
          if (!list.loose && spacers.length && hasMultipleLineBreaks) {
            // Having a single line break doesn't mean a list is loose. A single line break is terminating the last list item
            list.loose = true;
            list.items[i].loose = true;
          }
        }
  
        return list;
      }
    }
  
    html(src) {
      const cap = this.rules.block.html.exec(src);
      if (cap) {
        const token = {
          type: 'html',
          raw: cap[0],
          pre: !this.options.sanitizer
            && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
          text: cap[0]
        };
        if (this.options.sanitize) {
          token.type = 'paragraph';
          token.text = this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape(cap[0]);
          token.tokens = [];
          this.lexer.inline(token.text, token.tokens);
        }
        return token;
      }
    }
  
    def(src) {
      const cap = this.rules.block.def.exec(src);
      if (cap) {
        if (cap[3]) cap[3] = cap[3].substring(1, cap[3].length - 1);
        const tag = cap[1].toLowerCase().replace(/\s+/g, ' ');
        return {
          type: 'def',
          tag,
          raw: cap[0],
          href: cap[2],
          title: cap[3]
        };
      }
    }
  
    table(src) {
      const cap = this.rules.block.table.exec(src);
      if (cap) {
        const item = {
          type: 'table',
          header: splitCells(cap[1]).map(c => { return { text: c }; }),
          align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
          rows: cap[3] && cap[3].trim() ? cap[3].replace(/\n[ \t]*$/, '').split('\n') : []
        };
  
        if (item.header.length === item.align.length) {
          item.raw = cap[0];
  
          let l = item.align.length;
          let i, j, k, row;
          for (i = 0; i < l; i++) {
            if (/^ *-+: *$/.test(item.align[i])) {
              item.align[i] = 'right';
            } else if (/^ *:-+: *$/.test(item.align[i])) {
              item.align[i] = 'center';
            } else if (/^ *:-+ *$/.test(item.align[i])) {
              item.align[i] = 'left';
            } else {
              item.align[i] = null;
            }
          }
  
          l = item.rows.length;
          for (i = 0; i < l; i++) {
            item.rows[i] = splitCells(item.rows[i], item.header.length).map(c => { return { text: c }; });
          }
  
          // parse child tokens inside headers and cells
  
          // header child tokens
          l = item.header.length;
          for (j = 0; j < l; j++) {
            item.header[j].tokens = [];
            this.lexer.inline(item.header[j].text, item.header[j].tokens);
          }
  
          // cell child tokens
          l = item.rows.length;
          for (j = 0; j < l; j++) {
            row = item.rows[j];
            for (k = 0; k < row.length; k++) {
              row[k].tokens = [];
              this.lexer.inline(row[k].text, row[k].tokens);
            }
          }
  
          return item;
        }
      }
    }
  
    lheading(src) {
      const cap = this.rules.block.lheading.exec(src);
      if (cap) {
        const token = {
          type: 'heading',
          raw: cap[0],
          depth: cap[2].charAt(0) === '=' ? 1 : 2,
          text: cap[1],
          tokens: []
        };
        this.lexer.inline(token.text, token.tokens);
        return token;
      }
    }
  
    paragraph(src) {
      const cap = this.rules.block.paragraph.exec(src);
      if (cap) {
        const token = {
          type: 'paragraph',
          raw: cap[0],
          text: cap[1].charAt(cap[1].length - 1) === '\n'
            ? cap[1].slice(0, -1)
            : cap[1],
          tokens: []
        };
        this.lexer.inline(token.text, token.tokens);
        return token;
      }
    }
  
    text(src) {
      const cap = this.rules.block.text.exec(src);
      if (cap) {
        const token = {
          type: 'text',
          raw: cap[0],
          text: cap[0],
          tokens: []
        };
        this.lexer.inline(token.text, token.tokens);
        return token;
      }
    }
  
    escape(src) {
      const cap = this.rules.inline.escape.exec(src);
      if (cap) {
        return {
          type: 'escape',
          raw: cap[0],
          text: escape(cap[1])
        };
      }
    }
  
    tag(src) {
      const cap = this.rules.inline.tag.exec(src);
      if (cap) {
        if (!this.lexer.state.inLink && /^<a /i.test(cap[0])) {
          this.lexer.state.inLink = true;
        } else if (this.lexer.state.inLink && /^<\/a>/i.test(cap[0])) {
          this.lexer.state.inLink = false;
        }
        if (!this.lexer.state.inRawBlock && /^<(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
          this.lexer.state.inRawBlock = true;
        } else if (this.lexer.state.inRawBlock && /^<\/(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
          this.lexer.state.inRawBlock = false;
        }
  
        return {
          type: this.options.sanitize
            ? 'text'
            : 'html',
          raw: cap[0],
          inLink: this.lexer.state.inLink,
          inRawBlock: this.lexer.state.inRawBlock,
          text: this.options.sanitize
            ? (this.options.sanitizer
              ? this.options.sanitizer(cap[0])
              : escape(cap[0]))
            : cap[0]
        };
      }
    }
  
    link(src) {
      const cap = this.rules.inline.link.exec(src);
      if (cap) {
        const trimmedUrl = cap[2].trim();
        if (!this.options.pedantic && /^</.test(trimmedUrl)) {
          // commonmark requires matching angle brackets
          if (!(/>$/.test(trimmedUrl))) {
            return;
          }
  
          // ending angle bracket cannot be escaped
          const rtrimSlash = rtrim(trimmedUrl.slice(0, -1), '\\');
          if ((trimmedUrl.length - rtrimSlash.length) % 2 === 0) {
            return;
          }
        } else {
          // find closing parenthesis
          const lastParenIndex = findClosingBracket(cap[2], '()');
          if (lastParenIndex > -1) {
            const start = cap[0].indexOf('!') === 0 ? 5 : 4;
            const linkLen = start + cap[1].length + lastParenIndex;
            cap[2] = cap[2].substring(0, lastParenIndex);
            cap[0] = cap[0].substring(0, linkLen).trim();
            cap[3] = '';
          }
        }
        let href = cap[2];
        let title = '';
        if (this.options.pedantic) {
          // split pedantic href and title
          const link = /^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(href);
  
          if (link) {
            href = link[1];
            title = link[3];
          }
        } else {
          title = cap[3] ? cap[3].slice(1, -1) : '';
        }
  
        href = href.trim();
        if (/^</.test(href)) {
          if (this.options.pedantic && !(/>$/.test(trimmedUrl))) {
            // pedantic allows starting angle bracket without ending angle bracket
            href = href.slice(1);
          } else {
            href = href.slice(1, -1);
          }
        }
        return outputLink(cap, {
          href: href ? href.replace(this.rules.inline._escapes, '$1') : href,
          title: title ? title.replace(this.rules.inline._escapes, '$1') : title
        }, cap[0], this.lexer);
      }
    }
  
    reflink(src, links) {
      let cap;
      if ((cap = this.rules.inline.reflink.exec(src))
          || (cap = this.rules.inline.nolink.exec(src))) {
        let link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
        link = links[link.toLowerCase()];
        if (!link || !link.href) {
          const text = cap[0].charAt(0);
          return {
            type: 'text',
            raw: text,
            text
          };
        }
        return outputLink(cap, link, cap[0], this.lexer);
      }
    }
  
    emStrong(src, maskedSrc, prevChar = '') {
      let match = this.rules.inline.emStrong.lDelim.exec(src);
      if (!match) return;
  
      // _ can't be between two alphanumerics. \p{L}\p{N} includes non-english alphabet/numbers as well
      if (match[3] && prevChar.match(/[\p{L}\p{N}]/u)) return;
  
      const nextChar = match[1] || match[2] || '';
  
      if (!nextChar || (nextChar && (prevChar === '' || this.rules.inline.punctuation.exec(prevChar)))) {
        const lLength = match[0].length - 1;
        let rDelim, rLength, delimTotal = lLength, midDelimTotal = 0;
  
        const endReg = match[0][0] === '*' ? this.rules.inline.emStrong.rDelimAst : this.rules.inline.emStrong.rDelimUnd;
        endReg.lastIndex = 0;
  
        // Clip maskedSrc to same section of string as src (move to lexer?)
        maskedSrc = maskedSrc.slice(-1 * src.length + lLength);
  
        while ((match = endReg.exec(maskedSrc)) != null) {
          rDelim = match[1] || match[2] || match[3] || match[4] || match[5] || match[6];
  
          if (!rDelim) continue; // skip single * in __abc*abc__
  
          rLength = rDelim.length;
  
          if (match[3] || match[4]) { // found another Left Delim
            delimTotal += rLength;
            continue;
          } else if (match[5] || match[6]) { // either Left or Right Delim
            if (lLength % 3 && !((lLength + rLength) % 3)) {
              midDelimTotal += rLength;
              continue; // CommonMark Emphasis Rules 9-10
            }
          }
  
          delimTotal -= rLength;
  
          if (delimTotal > 0) continue; // Haven't found enough closing delimiters
  
          // Remove extra characters. *a*** -> *a*
          rLength = Math.min(rLength, rLength + delimTotal + midDelimTotal);
  
          // Create `em` if smallest delimiter has odd char count. *a***
          if (Math.min(lLength, rLength) % 2) {
            const text = src.slice(1, lLength + match.index + rLength);
            return {
              type: 'em',
              raw: src.slice(0, lLength + match.index + rLength + 1),
              text,
              tokens: this.lexer.inlineTokens(text, [])
            };
          }
  
          // Create 'strong' if smallest delimiter has even char count. **a***
          const text = src.slice(2, lLength + match.index + rLength - 1);
          return {
            type: 'strong',
            raw: src.slice(0, lLength + match.index + rLength + 1),
            text,
            tokens: this.lexer.inlineTokens(text, [])
          };
        }
      }
    }
  
    codespan(src) {
      const cap = this.rules.inline.code.exec(src);
      if (cap) {
        let text = cap[2].replace(/\n/g, ' ');
        const hasNonSpaceChars = /[^ ]/.test(text);
        const hasSpaceCharsOnBothEnds = /^ /.test(text) && / $/.test(text);
        if (hasNonSpaceChars && hasSpaceCharsOnBothEnds) {
          text = text.substring(1, text.length - 1);
        }
        text = escape(text, true);
        return {
          type: 'codespan',
          raw: cap[0],
          text
        };
      }
    }
  
    br(src) {
      const cap = this.rules.inline.br.exec(src);
      if (cap) {
        return {
          type: 'br',
          raw: cap[0]
        };
      }
    }
  
    del(src) {
      const cap = this.rules.inline.del.exec(src);
      if (cap) {
        return {
          type: 'del',
          raw: cap[0],
          text: cap[2],
          tokens: this.lexer.inlineTokens(cap[2], [])
        };
      }
    }
  
    autolink(src, mangle) {
      const cap = this.rules.inline.autolink.exec(src);
      if (cap) {
        let text, href;
        if (cap[2] === '@') {
          text = escape(this.options.mangle ? mangle(cap[1]) : cap[1]);
          href = 'mailto:' + text;
        } else {
          text = escape(cap[1]);
          href = text;
        }
  
        return {
          type: 'link',
          raw: cap[0],
          text,
          href,
          tokens: [
            {
              type: 'text',
              raw: text,
              text
            }
          ]
        };
      }
    }
  
    url(src, mangle) {
      let cap;
      if (cap = this.rules.inline.url.exec(src)) {
        let text, href;
        if (cap[2] === '@') {
          text = escape(this.options.mangle ? mangle(cap[0]) : cap[0]);
          href = 'mailto:' + text;
        } else {
          // do extended autolink path validation
          let prevCapZero;
          do {
            prevCapZero = cap[0];
            cap[0] = this.rules.inline._backpedal.exec(cap[0])[0];
          } while (prevCapZero !== cap[0]);
          text = escape(cap[0]);
          if (cap[1] === 'www.') {
            href = 'http://' + text;
          } else {
            href = text;
          }
        }
        return {
          type: 'link',
          raw: cap[0],
          text,
          href,
          tokens: [
            {
              type: 'text',
              raw: text,
              text
            }
          ]
        };
      }
    }
  
    inlineText(src, smartypants) {
      const cap = this.rules.inline.text.exec(src);
      if (cap) {
        let text;
        if (this.lexer.state.inRawBlock) {
          text = this.options.sanitize ? (this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape(cap[0])) : cap[0];
        } else {
          text = escape(this.options.smartypants ? smartypants(cap[0]) : cap[0]);
        }
        return {
          type: 'text',
          raw: cap[0],
          text
        };
      }
    }
  }
  
  /**
   * Block-Level Grammar
   */
  const block = {
    newline: /^(?: *(?:\n|$))+/,
    code: /^( {4}[^\n]+(?:\n(?: *(?:\n|$))*)?)+/,
    fences: /^ {0,3}(`{3,}(?=[^`\n]*\n)|~{3,})([^\n]*)\n(?:|([\s\S]*?)\n)(?: {0,3}\1[~`]* *(?=\n|$)|$)/,
    hr: /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,
    heading: /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,
    blockquote: /^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,
    list: /^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/,
    html: '^ {0,3}(?:' // optional indentation
      + '<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)' // (1)
      + '|comment[^\\n]*(\\n+|$)' // (2)
      + '|<\\?[\\s\\S]*?(?:\\?>\\n*|$)' // (3)
      + '|<![A-Z][\\s\\S]*?(?:>\\n*|$)' // (4)
      + '|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)' // (5)
      + '|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n *)+\\n|$)' // (6)
      + '|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)' // (7) open tag
      + '|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)' // (7) closing tag
      + ')',
    def: /^ {0,3}\[(label)\]: *(?:\n *)?<?([^\s>]+)>?(?:(?: +(?:\n *)?| *\n *)(title))? *(?:\n+|$)/,
    table: noopTest,
    lheading: /^([^\n]+)\n {0,3}(=+|-+) *(?:\n+|$)/,
    // regex template, placeholders will be replaced according to different paragraph
    // interruption rules of commonmark and the original markdown spec:
    _paragraph: /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,
    text: /^[^\n]+/
  };
  
  block._label = /(?!\s*\])(?:\\.|[^\[\]\\])+/;
  block._title = /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/;
  block.def = edit(block.def)
    .replace('label', block._label)
    .replace('title', block._title)
    .getRegex();
  
  block.bullet = /(?:[*+-]|\d{1,9}[.)])/;
  block.listItemStart = edit(/^( *)(bull) */)
    .replace('bull', block.bullet)
    .getRegex();
  
  block.list = edit(block.list)
    .replace(/bull/g, block.bullet)
    .replace('hr', '\\n+(?=\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$))')
    .replace('def', '\\n+(?=' + block.def.source + ')')
    .getRegex();
  
  block._tag = 'address|article|aside|base|basefont|blockquote|body|caption'
    + '|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption'
    + '|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe'
    + '|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option'
    + '|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr'
    + '|track|ul';
  block._comment = /<!--(?!-?>)[\s\S]*?(?:-->|$)/;
  block.html = edit(block.html, 'i')
    .replace('comment', block._comment)
    .replace('tag', block._tag)
    .replace('attribute', / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/)
    .getRegex();
  
  block.paragraph = edit(block._paragraph)
    .replace('hr', block.hr)
    .replace('heading', ' {0,3}#{1,6} ')
    .replace('|lheading', '') // setex headings don't interrupt commonmark paragraphs
    .replace('|table', '')
    .replace('blockquote', ' {0,3}>')
    .replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n')
    .replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
    .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)')
    .replace('tag', block._tag) // pars can be interrupted by type (6) html blocks
    .getRegex();
  
  block.blockquote = edit(block.blockquote)
    .replace('paragraph', block.paragraph)
    .getRegex();
  
  /**
   * Normal Block Grammar
   */
  
  block.normal = merge({}, block);
  
  /**
   * GFM Block Grammar
   */
  
  block.gfm = merge({}, block.normal, {
    table: '^ *([^\\n ].*\\|.*)\\n' // Header
      + ' {0,3}(?:\\| *)?(:?-+:? *(?:\\| *:?-+:? *)*)(?:\\| *)?' // Align
      + '(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)' // Cells
  });
  
  block.gfm.table = edit(block.gfm.table)
    .replace('hr', block.hr)
    .replace('heading', ' {0,3}#{1,6} ')
    .replace('blockquote', ' {0,3}>')
    .replace('code', ' {4}[^\\n]')
    .replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n')
    .replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
    .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)')
    .replace('tag', block._tag) // tables can be interrupted by type (6) html blocks
    .getRegex();
  
  block.gfm.paragraph = edit(block._paragraph)
    .replace('hr', block.hr)
    .replace('heading', ' {0,3}#{1,6} ')
    .replace('|lheading', '') // setex headings don't interrupt commonmark paragraphs
    .replace('table', block.gfm.table) // interrupt paragraphs with table
    .replace('blockquote', ' {0,3}>')
    .replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n')
    .replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
    .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)')
    .replace('tag', block._tag) // pars can be interrupted by type (6) html blocks
    .getRegex();
  /**
   * Pedantic grammar (original John Gruber's loose markdown specification)
   */
  
  block.pedantic = merge({}, block.normal, {
    html: edit(
      '^ *(?:comment *(?:\\n|\\s*$)'
      + '|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)' // closed tag
      + '|<tag(?:"[^"]*"|\'[^\']*\'|\\s[^\'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))')
      .replace('comment', block._comment)
      .replace(/tag/g, '(?!(?:'
        + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub'
        + '|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)'
        + '\\b)\\w+(?!:|[^\\w\\s@]*@)\\b')
      .getRegex(),
    def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
    heading: /^(#{1,6})(.*)(?:\n+|$)/,
    fences: noopTest, // fences not supported
    paragraph: edit(block.normal._paragraph)
      .replace('hr', block.hr)
      .replace('heading', ' *#{1,6} *[^\n]')
      .replace('lheading', block.lheading)
      .replace('blockquote', ' {0,3}>')
      .replace('|fences', '')
      .replace('|list', '')
      .replace('|html', '')
      .getRegex()
  });
  
  /**
   * Inline-Level Grammar
   */
  const inline = {
    escape: /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,
    autolink: /^<(scheme:[^\s\x00-\x1f<>]*|email)>/,
    url: noopTest,
    tag: '^comment'
      + '|^</[a-zA-Z][\\w:-]*\\s*>' // self-closing tag
      + '|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>' // open tag
      + '|^<\\?[\\s\\S]*?\\?>' // processing instruction, e.g. <?php ?>
      + '|^<![a-zA-Z]+\\s[\\s\\S]*?>' // declaration, e.g. <!DOCTYPE html>
      + '|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>', // CDATA section
    link: /^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/,
    reflink: /^!?\[(label)\]\[(ref)\]/,
    nolink: /^!?\[(ref)\](?:\[\])?/,
    reflinkSearch: 'reflink|nolink(?!\\()',
    emStrong: {
      lDelim: /^(?:\*+(?:([punct_])|[^\s*]))|^_+(?:([punct*])|([^\s_]))/,
      //        (1) and (2) can only be a Right Delimiter. (3) and (4) can only be Left.  (5) and (6) can be either Left or Right.
      //          () Skip orphan inside strong  () Consume to delim (1) #***                (2) a***#, a***                   (3) #***a, ***a                 (4) ***#              (5) #***#                 (6) a***a
      rDelimAst: /^[^_*]*?\_\_[^_*]*?\*[^_*]*?(?=\_\_)|[^*]+(?=[^*])|[punct_](\*+)(?=[\s]|$)|[^punct*_\s](\*+)(?=[punct_\s]|$)|[punct_\s](\*+)(?=[^punct*_\s])|[\s](\*+)(?=[punct_])|[punct_](\*+)(?=[punct_])|[^punct*_\s](\*+)(?=[^punct*_\s])/,
      rDelimUnd: /^[^_*]*?\*\*[^_*]*?\_[^_*]*?(?=\*\*)|[^_]+(?=[^_])|[punct*](\_+)(?=[\s]|$)|[^punct*_\s](\_+)(?=[punct*\s]|$)|[punct*\s](\_+)(?=[^punct*_\s])|[\s](\_+)(?=[punct*])|[punct*](\_+)(?=[punct*])/ // ^- Not allowed for _
    },
    code: /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,
    br: /^( {2,}|\\)\n(?!\s*$)/,
    del: noopTest,
    text: /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,
    punctuation: /^([\spunctuation])/
  };
  
  // list of punctuation marks from CommonMark spec
  // without * and _ to handle the different emphasis markers * and _
  inline._punctuation = '!"#$%&\'()+\\-.,/:;<=>?@\\[\\]`^{|}~';
  inline.punctuation = edit(inline.punctuation).replace(/punctuation/g, inline._punctuation).getRegex();
  
  // sequences em should skip over [title](link), `code`, <html>
  inline.blockSkip = /\[[^\]]*?\]\([^\)]*?\)|`[^`]*?`|<[^>]*?>/g;
  inline.escapedEmSt = /\\\*|\\_/g;
  
  inline._comment = edit(block._comment).replace('(?:-->|$)', '-->').getRegex();
  
  inline.emStrong.lDelim = edit(inline.emStrong.lDelim)
    .replace(/punct/g, inline._punctuation)
    .getRegex();
  
  inline.emStrong.rDelimAst = edit(inline.emStrong.rDelimAst, 'g')
    .replace(/punct/g, inline._punctuation)
    .getRegex();
  
  inline.emStrong.rDelimUnd = edit(inline.emStrong.rDelimUnd, 'g')
    .replace(/punct/g, inline._punctuation)
    .getRegex();
  
  inline._escapes = /\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/g;
  
  inline._scheme = /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/;
  inline._email = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/;
  inline.autolink = edit(inline.autolink)
    .replace('scheme', inline._scheme)
    .replace('email', inline._email)
    .getRegex();
  
  inline._attribute = /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/;
  
  inline.tag = edit(inline.tag)
    .replace('comment', inline._comment)
    .replace('attribute', inline._attribute)
    .getRegex();
  
  inline._label = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/;
  inline._href = /<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/;
  inline._title = /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/;
  
  inline.link = edit(inline.link)
    .replace('label', inline._label)
    .replace('href', inline._href)
    .replace('title', inline._title)
    .getRegex();
  
  inline.reflink = edit(inline.reflink)
    .replace('label', inline._label)
    .replace('ref', block._label)
    .getRegex();
  
  inline.nolink = edit(inline.nolink)
    .replace('ref', block._label)
    .getRegex();
  
  inline.reflinkSearch = edit(inline.reflinkSearch, 'g')
    .replace('reflink', inline.reflink)
    .replace('nolink', inline.nolink)
    .getRegex();
  
  /**
   * Normal Inline Grammar
   */
  
  inline.normal = merge({}, inline);
  
  /**
   * Pedantic Inline Grammar
   */
  
  inline.pedantic = merge({}, inline.normal, {
    strong: {
      start: /^__|\*\*/,
      middle: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
      endAst: /\*\*(?!\*)/g,
      endUnd: /__(?!_)/g
    },
    em: {
      start: /^_|\*/,
      middle: /^()\*(?=\S)([\s\S]*?\S)\*(?!\*)|^_(?=\S)([\s\S]*?\S)_(?!_)/,
      endAst: /\*(?!\*)/g,
      endUnd: /_(?!_)/g
    },
    link: edit(/^!?\[(label)\]\((.*?)\)/)
      .replace('label', inline._label)
      .getRegex(),
    reflink: edit(/^!?\[(label)\]\s*\[([^\]]*)\]/)
      .replace('label', inline._label)
      .getRegex()
  });
  
  /**
   * GFM Inline Grammar
   */
  
  inline.gfm = merge({}, inline.normal, {
    escape: edit(inline.escape).replace('])', '~|])').getRegex(),
    _extended_email: /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/,
    url: /^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,
    _backpedal: /(?:[^?!.,:;*_~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_~)]+(?!$))+/,
    del: /^(~~?)(?=[^\s~])([\s\S]*?[^\s~])\1(?=[^~]|$)/,
    text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
  });
  
  inline.gfm.url = edit(inline.gfm.url, 'i')
    .replace('email', inline.gfm._extended_email)
    .getRegex();
  /**
   * GFM + Line Breaks Inline Grammar
   */
  
  inline.breaks = merge({}, inline.gfm, {
    br: edit(inline.br).replace('{2,}', '*').getRegex(),
    text: edit(inline.gfm.text)
      .replace('\\b_', '\\b_| {2,}\\n')
      .replace(/\{2,\}/g, '*')
      .getRegex()
  });
  
  /**
   * smartypants text replacement
   * @param {string} text
   */
  function smartypants(text) {
    return text
      // em-dashes
      .replace(/---/g, '\u2014')
      // en-dashes
      .replace(/--/g, '\u2013')
      // opening singles
      .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
      // closing singles & apostrophes
      .replace(/'/g, '\u2019')
      // opening doubles
      .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
      // closing doubles
      .replace(/"/g, '\u201d')
      // ellipses
      .replace(/\.{3}/g, '\u2026');
  }
  
  /**
   * mangle email addresses
   * @param {string} text
   */
  function mangle(text) {
    let out = '',
      i,
      ch;
  
    const l = text.length;
    for (i = 0; i < l; i++) {
      ch = text.charCodeAt(i);
      if (Math.random() > 0.5) {
        ch = 'x' + ch.toString(16);
      }
      out += '&#' + ch + ';';
    }
  
    return out;
  }
  
  /**
   * Block Lexer
   */
  class Lexer {
    constructor(options) {
      this.tokens = [];
      this.tokens.links = Object.create(null);
      this.options = options || defaults;
      this.options.tokenizer = this.options.tokenizer || new Tokenizer();
      this.tokenizer = this.options.tokenizer;
      this.tokenizer.options = this.options;
      this.tokenizer.lexer = this;
      this.inlineQueue = [];
      this.state = {
        inLink: false,
        inRawBlock: false,
        top: true
      };
  
      const rules = {
        block: block.normal,
        inline: inline.normal
      };
  
      if (this.options.pedantic) {
        rules.block = block.pedantic;
        rules.inline = inline.pedantic;
      } else if (this.options.gfm) {
        rules.block = block.gfm;
        if (this.options.breaks) {
          rules.inline = inline.breaks;
        } else {
          rules.inline = inline.gfm;
        }
      }
      this.tokenizer.rules = rules;
    }
  
    /**
     * Expose Rules
     */
    static get rules() {
      return {
        block,
        inline
      };
    }
  
    /**
     * Static Lex Method
     */
    static lex(src, options) {
      const lexer = new Lexer(options);
      return lexer.lex(src);
    }
  
    /**
     * Static Lex Inline Method
     */
    static lexInline(src, options) {
      const lexer = new Lexer(options);
      return lexer.inlineTokens(src);
    }
  
    /**
     * Preprocessing
     */
    lex(src) {
      src = src
        .replace(/\r\n|\r/g, '\n');
  
      this.blockTokens(src, this.tokens);
  
      let next;
      while (next = this.inlineQueue.shift()) {
        this.inlineTokens(next.src, next.tokens);
      }
  
      return this.tokens;
    }
  
    /**
     * Lexing
     */
    blockTokens(src, tokens = []) {
      if (this.options.pedantic) {
        src = src.replace(/\t/g, '    ').replace(/^ +$/gm, '');
      } else {
        src = src.replace(/^( *)(\t+)/gm, (_, leading, tabs) => {
          return leading + '    '.repeat(tabs.length);
        });
      }
  
      let token, lastToken, cutSrc, lastParagraphClipped;
  
      while (src) {
        if (this.options.extensions
          && this.options.extensions.block
          && this.options.extensions.block.some((extTokenizer) => {
            if (token = extTokenizer.call({ lexer: this }, src, tokens)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              return true;
            }
            return false;
          })) {
          continue;
        }
  
        // newline
        if (token = this.tokenizer.space(src)) {
          src = src.substring(token.raw.length);
          if (token.raw.length === 1 && tokens.length > 0) {
            // if there's a single \n as a spacer, it's terminating the last line,
            // so move it there so that we don't get unecessary paragraph tags
            tokens[tokens.length - 1].raw += '\n';
          } else {
            tokens.push(token);
          }
          continue;
        }
  
        // code
        if (token = this.tokenizer.code(src)) {
          src = src.substring(token.raw.length);
          lastToken = tokens[tokens.length - 1];
          // An indented code block cannot interrupt a paragraph.
          if (lastToken && (lastToken.type === 'paragraph' || lastToken.type === 'text')) {
            lastToken.raw += '\n' + token.raw;
            lastToken.text += '\n' + token.text;
            this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
          } else {
            tokens.push(token);
          }
          continue;
        }
  
        // fences
        if (token = this.tokenizer.fences(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        }
  
        // heading
        if (token = this.tokenizer.heading(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        }
  
        // hr
        if (token = this.tokenizer.hr(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        }
  
        // blockquote
        if (token = this.tokenizer.blockquote(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        }
  
        // list
        if (token = this.tokenizer.list(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        }
  
        // html
        if (token = this.tokenizer.html(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        }
  
        // def
        if (token = this.tokenizer.def(src)) {
          src = src.substring(token.raw.length);
          lastToken = tokens[tokens.length - 1];
          if (lastToken && (lastToken.type === 'paragraph' || lastToken.type === 'text')) {
            lastToken.raw += '\n' + token.raw;
            lastToken.text += '\n' + token.raw;
            this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
          } else if (!this.tokens.links[token.tag]) {
            this.tokens.links[token.tag] = {
              href: token.href,
              title: token.title
            };
          }
          continue;
        }
  
        // table (gfm)
        if (token = this.tokenizer.table(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        }
  
        // lheading
        if (token = this.tokenizer.lheading(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        }
  
        // top-level paragraph
        // prevent paragraph consuming extensions by clipping 'src' to extension start
        cutSrc = src;
        if (this.options.extensions && this.options.extensions.startBlock) {
          let startIndex = Infinity;
          const tempSrc = src.slice(1);
          let tempStart;
          this.options.extensions.startBlock.forEach(function(getStartIndex) {
            tempStart = getStartIndex.call({ lexer: this }, tempSrc);
            if (typeof tempStart === 'number' && tempStart >= 0) { startIndex = Math.min(startIndex, tempStart); }
          });
          if (startIndex < Infinity && startIndex >= 0) {
            cutSrc = src.substring(0, startIndex + 1);
          }
        }
        if (this.state.top && (token = this.tokenizer.paragraph(cutSrc))) {
          lastToken = tokens[tokens.length - 1];
          if (lastParagraphClipped && lastToken.type === 'paragraph') {
            lastToken.raw += '\n' + token.raw;
            lastToken.text += '\n' + token.text;
            this.inlineQueue.pop();
            this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
          } else {
            tokens.push(token);
          }
          lastParagraphClipped = (cutSrc.length !== src.length);
          src = src.substring(token.raw.length);
          continue;
        }
  
        // text
        if (token = this.tokenizer.text(src)) {
          src = src.substring(token.raw.length);
          lastToken = tokens[tokens.length - 1];
          if (lastToken && lastToken.type === 'text') {
            lastToken.raw += '\n' + token.raw;
            lastToken.text += '\n' + token.text;
            this.inlineQueue.pop();
            this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
          } else {
            tokens.push(token);
          }
          continue;
        }
  
        if (src) {
          const errMsg = 'Infinite loop on byte: ' + src.charCodeAt(0);
          if (this.options.silent) {
            console.error(errMsg);
            break;
          } else {
            throw new Error(errMsg);
          }
        }
      }
  
      this.state.top = true;
      return tokens;
    }
  
    inline(src, tokens = []) {
      this.inlineQueue.push({ src, tokens });
      return tokens;
    }
  
    /**
     * Lexing/Compiling
     */
    inlineTokens(src, tokens = []) {
      let token, lastToken, cutSrc;
  
      // String with links masked to avoid interference with em and strong
      let maskedSrc = src;
      let match;
      let keepPrevChar, prevChar;
  
      // Mask out reflinks
      if (this.tokens.links) {
        const links = Object.keys(this.tokens.links);
        if (links.length > 0) {
          while ((match = this.tokenizer.rules.inline.reflinkSearch.exec(maskedSrc)) != null) {
            if (links.includes(match[0].slice(match[0].lastIndexOf('[') + 1, -1))) {
              maskedSrc = maskedSrc.slice(0, match.index) + '[' + repeatString('a', match[0].length - 2) + ']' + maskedSrc.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex);
            }
          }
        }
      }
      // Mask out other blocks
      while ((match = this.tokenizer.rules.inline.blockSkip.exec(maskedSrc)) != null) {
        maskedSrc = maskedSrc.slice(0, match.index) + '[' + repeatString('a', match[0].length - 2) + ']' + maskedSrc.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
      }
  
      // Mask out escaped em & strong delimiters
      while ((match = this.tokenizer.rules.inline.escapedEmSt.exec(maskedSrc)) != null) {
        maskedSrc = maskedSrc.slice(0, match.index) + '++' + maskedSrc.slice(this.tokenizer.rules.inline.escapedEmSt.lastIndex);
      }
  
      while (src) {
        if (!keepPrevChar) {
          prevChar = '';
        }
        keepPrevChar = false;
  
        // extensions
        if (this.options.extensions
          && this.options.extensions.inline
          && this.options.extensions.inline.some((extTokenizer) => {
            if (token = extTokenizer.call({ lexer: this }, src, tokens)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              return true;
            }
            return false;
          })) {
          continue;
        }
  
        // escape
        if (token = this.tokenizer.escape(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        }
  
        // tag
        if (token = this.tokenizer.tag(src)) {
          src = src.substring(token.raw.length);
          lastToken = tokens[tokens.length - 1];
          if (lastToken && token.type === 'text' && lastToken.type === 'text') {
            lastToken.raw += token.raw;
            lastToken.text += token.text;
          } else {
            tokens.push(token);
          }
          continue;
        }
  
        // link
        if (token = this.tokenizer.link(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        }
  
        // reflink, nolink
        if (token = this.tokenizer.reflink(src, this.tokens.links)) {
          src = src.substring(token.raw.length);
          lastToken = tokens[tokens.length - 1];
          if (lastToken && token.type === 'text' && lastToken.type === 'text') {
            lastToken.raw += token.raw;
            lastToken.text += token.text;
          } else {
            tokens.push(token);
          }
          continue;
        }
  
        // em & strong
        if (token = this.tokenizer.emStrong(src, maskedSrc, prevChar)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        }
  
        // code
        if (token = this.tokenizer.codespan(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        }
  
        // br
        if (token = this.tokenizer.br(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        }
  
        // del (gfm)
        if (token = this.tokenizer.del(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        }
  
        // autolink
        if (token = this.tokenizer.autolink(src, mangle)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        }
  
        // url (gfm)
        if (!this.state.inLink && (token = this.tokenizer.url(src, mangle))) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        }
  
        // text
        // prevent inlineText consuming extensions by clipping 'src' to extension start
        cutSrc = src;
        if (this.options.extensions && this.options.extensions.startInline) {
          let startIndex = Infinity;
          const tempSrc = src.slice(1);
          let tempStart;
          this.options.extensions.startInline.forEach(function(getStartIndex) {
            tempStart = getStartIndex.call({ lexer: this }, tempSrc);
            if (typeof tempStart === 'number' && tempStart >= 0) { startIndex = Math.min(startIndex, tempStart); }
          });
          if (startIndex < Infinity && startIndex >= 0) {
            cutSrc = src.substring(0, startIndex + 1);
          }
        }
        if (token = this.tokenizer.inlineText(cutSrc, smartypants)) {
          src = src.substring(token.raw.length);
          if (token.raw.slice(-1) !== '_') { // Track prevChar before string of ____ started
            prevChar = token.raw.slice(-1);
          }
          keepPrevChar = true;
          lastToken = tokens[tokens.length - 1];
          if (lastToken && lastToken.type === 'text') {
            lastToken.raw += token.raw;
            lastToken.text += token.text;
          } else {
            tokens.push(token);
          }
          continue;
        }
  
        if (src) {
          const errMsg = 'Infinite loop on byte: ' + src.charCodeAt(0);
          if (this.options.silent) {
            console.error(errMsg);
            break;
          } else {
            throw new Error(errMsg);
          }
        }
      }
  
      return tokens;
    }
  }
  
  /**
   * Renderer
   */
  class Renderer {
    constructor(options) {
      this.options = options || defaults;
    }
  
    code(code, infostring, escaped) {
      const lang = (infostring || '').match(/\S*/)[0];
      if (this.options.highlight) {
        const out = this.options.highlight(code, lang);
        if (out != null && out !== code) {
          escaped = true;
          code = out;
        }
      }
  
      code = code.replace(/\n$/, '') + '\n';
  
      if (!lang) {
        return '<pre><code>'
          + (escaped ? code : escape(code, true))
          + '</code></pre>\n';
      }
  
      return '<pre><code class="'
        + this.options.langPrefix
        + escape(lang, true)
        + '">'
        + (escaped ? code : escape(code, true))
        + '</code></pre>\n';
    }
  
    /**
     * @param {string} quote
     */
    blockquote(quote) {
      return `<blockquote>\n${quote}</blockquote>\n`;
    }
  
    html(html) {
      return html;
    }
  
    /**
     * @param {string} text
     * @param {string} level
     * @param {string} raw
     * @param {any} slugger
     */
    heading(text, level, raw, slugger) {
      if (this.options.headerIds) {
        const id = this.options.headerPrefix + slugger.slug(raw);
        return `<h${level} id="${id}">${text}</h${level}>\n`;
      }
  
      // ignore IDs
      return `<h${level}>${text}</h${level}>\n`;
    }
  
    hr() {
      return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
    }
  
    list(body, ordered, start) {
      const type = ordered ? 'ol' : 'ul',
        startatt = (ordered && start !== 1) ? (' start="' + start + '"') : '';
      return '<' + type + startatt + '>\n' + body + '</' + type + '>\n';
    }
  
    /**
     * @param {string} text
     */
    listitem(text) {
      return `<li>${text}</li>\n`;
    }
  
    checkbox(checked) {
      return '<input '
        + (checked ? 'checked="" ' : '')
        + 'disabled="" type="checkbox"'
        + (this.options.xhtml ? ' /' : '')
        + '> ';
    }
  
    /**
     * @param {string} text
     */
    paragraph(text) {
      return `<p>${text}</p>\n`;
    }
  
    /**
     * @param {string} header
     * @param {string} body
     */
    table(header, body) {
      if (body) body = `<tbody>${body}</tbody>`;
  
      return '<table>\n'
        + '<thead>\n'
        + header
        + '</thead>\n'
        + body
        + '</table>\n';
    }
  
    /**
     * @param {string} content
     */
    tablerow(content) {
      return `<tr>\n${content}</tr>\n`;
    }
  
    tablecell(content, flags) {
      const type = flags.header ? 'th' : 'td';
      const tag = flags.align
        ? `<${type} align="${flags.align}">`
        : `<${type}>`;
      return tag + content + `</${type}>\n`;
    }
  
    /**
     * span level renderer
     * @param {string} text
     */
    strong(text) {
      return `<strong>${text}</strong>`;
    }
  
    /**
     * @param {string} text
     */
    em(text) {
      return `<em>${text}</em>`;
    }
  
    /**
     * @param {string} text
     */
    codespan(text) {
      return `<code>${text}</code>`;
    }
  
    br() {
      return this.options.xhtml ? '<br/>' : '<br>';
    }
  
    /**
     * @param {string} text
     */
    del(text) {
      return `<del>${text}</del>`;
    }
  
    /**
     * @param {string} href
     * @param {string} title
     * @param {string} text
     */
    link(href, title, text) {
      href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);
      if (href === null) {
        return text;
      }
      let out = '<a href="' + escape(href) + '"';
      if (title) {
        out += ' title="' + title + '"';
      }
      out += '>' + text + '</a>';
      return out;
    }
  
    /**
     * @param {string} href
     * @param {string} title
     * @param {string} text
     */
    image(href, title, text) {
      href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);
      if (href === null) {
        return text;
      }
  
      let out = `<img src="${href}" alt="${text}"`;
      if (title) {
        out += ` title="${title}"`;
      }
      out += this.options.xhtml ? '/>' : '>';
      return out;
    }
  
    text(text) {
      return text;
    }
  }
  
  /**
   * TextRenderer
   * returns only the textual part of the token
   */
  class TextRenderer {
    // no need for block level renderers
    strong(text) {
      return text;
    }
  
    em(text) {
      return text;
    }
  
    codespan(text) {
      return text;
    }
  
    del(text) {
      return text;
    }
  
    html(text) {
      return text;
    }
  
    text(text) {
      return text;
    }
  
    link(href, title, text) {
      return '' + text;
    }
  
    image(href, title, text) {
      return '' + text;
    }
  
    br() {
      return '';
    }
  }
  
  /**
   * Slugger generates header id
   */
  class Slugger {
    constructor() {
      this.seen = {};
    }
  
    /**
     * @param {string} value
     */
    serialize(value) {
      return value
        .toLowerCase()
        .trim()
        // remove html tags
        .replace(/<[!\/a-z].*?>/ig, '')
        // remove unwanted chars
        .replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g, '')
        .replace(/\s/g, '-');
    }
  
    /**
     * Finds the next safe (unique) slug to use
     * @param {string} originalSlug
     * @param {boolean} isDryRun
     */
    getNextSafeSlug(originalSlug, isDryRun) {
      let slug = originalSlug;
      let occurenceAccumulator = 0;
      if (this.seen.hasOwnProperty(slug)) {
        occurenceAccumulator = this.seen[originalSlug];
        do {
          occurenceAccumulator++;
          slug = originalSlug + '-' + occurenceAccumulator;
        } while (this.seen.hasOwnProperty(slug));
      }
      if (!isDryRun) {
        this.seen[originalSlug] = occurenceAccumulator;
        this.seen[slug] = 0;
      }
      return slug;
    }
  
    /**
     * Convert string to unique id
     * @param {object} [options]
     * @param {boolean} [options.dryrun] Generates the next unique slug without
     * updating the internal accumulator.
     */
    slug(value, options = {}) {
      const slug = this.serialize(value);
      return this.getNextSafeSlug(slug, options.dryrun);
    }
  }
  
  /**
   * Parsing & Compiling
   */
  class Parser {
    constructor(options) {
      this.options = options || defaults;
      this.options.renderer = this.options.renderer || new Renderer();
      this.renderer = this.options.renderer;
      this.renderer.options = this.options;
      this.textRenderer = new TextRenderer();
      this.slugger = new Slugger();
    }
  
    /**
     * Static Parse Method
     */
    static parse(tokens, options) {
      const parser = new Parser(options);
      return parser.parse(tokens);
    }
  
    /**
     * Static Parse Inline Method
     */
    static parseInline(tokens, options) {
      const parser = new Parser(options);
      return parser.parseInline(tokens);
    }
  
    /**
     * Parse Loop
     */
    parse(tokens, top = true) {
      let out = '',
        i,
        j,
        k,
        l2,
        l3,
        row,
        cell,
        header,
        body,
        token,
        ordered,
        start,
        loose,
        itemBody,
        item,
        checked,
        task,
        checkbox,
        ret;
  
      const l = tokens.length;
      for (i = 0; i < l; i++) {
        token = tokens[i];
  
        // Run any renderer extensions
        if (this.options.extensions && this.options.extensions.renderers && this.options.extensions.renderers[token.type]) {
          ret = this.options.extensions.renderers[token.type].call({ parser: this }, token);
          if (ret !== false || !['space', 'hr', 'heading', 'code', 'table', 'blockquote', 'list', 'html', 'paragraph', 'text'].includes(token.type)) {
            out += ret || '';
            continue;
          }
        }
  
        switch (token.type) {
          case 'space': {
            continue;
          }
          case 'hr': {
            out += this.renderer.hr();
            continue;
          }
          case 'heading': {
            out += this.renderer.heading(
              this.parseInline(token.tokens),
              token.depth,
              unescape(this.parseInline(token.tokens, this.textRenderer)),
              this.slugger);
            continue;
          }
          case 'code': {
            out += this.renderer.code(token.text,
              token.lang,
              token.escaped);
            continue;
          }
          case 'table': {
            header = '';
  
            // header
            cell = '';
            l2 = token.header.length;
            for (j = 0; j < l2; j++) {
              cell += this.renderer.tablecell(
                this.parseInline(token.header[j].tokens),
                { header: true, align: token.align[j] }
              );
            }
            header += this.renderer.tablerow(cell);
  
            body = '';
            l2 = token.rows.length;
            for (j = 0; j < l2; j++) {
              row = token.rows[j];
  
              cell = '';
              l3 = row.length;
              for (k = 0; k < l3; k++) {
                cell += this.renderer.tablecell(
                  this.parseInline(row[k].tokens),
                  { header: false, align: token.align[k] }
                );
              }
  
              body += this.renderer.tablerow(cell);
            }
            out += this.renderer.table(header, body);
            continue;
          }
          case 'blockquote': {
            body = this.parse(token.tokens);
            out += this.renderer.blockquote(body);
            continue;
          }
          case 'list': {
            ordered = token.ordered;
            start = token.start;
            loose = token.loose;
            l2 = token.items.length;
  
            body = '';
            for (j = 0; j < l2; j++) {
              item = token.items[j];
              checked = item.checked;
              task = item.task;
  
              itemBody = '';
              if (item.task) {
                checkbox = this.renderer.checkbox(checked);
                if (loose) {
                  if (item.tokens.length > 0 && item.tokens[0].type === 'paragraph') {
                    item.tokens[0].text = checkbox + ' ' + item.tokens[0].text;
                    if (item.tokens[0].tokens && item.tokens[0].tokens.length > 0 && item.tokens[0].tokens[0].type === 'text') {
                      item.tokens[0].tokens[0].text = checkbox + ' ' + item.tokens[0].tokens[0].text;
                    }
                  } else {
                    item.tokens.unshift({
                      type: 'text',
                      text: checkbox
                    });
                  }
                } else {
                  itemBody += checkbox;
                }
              }
  
              itemBody += this.parse(item.tokens, loose);
              body += this.renderer.listitem(itemBody, task, checked);
            }
  
            out += this.renderer.list(body, ordered, start);
            continue;
          }
          case 'html': {
            // TODO parse inline content if parameter markdown=1
            out += this.renderer.html(token.text);
            continue;
          }
          case 'paragraph': {
            out += this.renderer.paragraph(this.parseInline(token.tokens));
            continue;
          }
          case 'text': {
            body = token.tokens ? this.parseInline(token.tokens) : token.text;
            while (i + 1 < l && tokens[i + 1].type === 'text') {
              token = tokens[++i];
              body += '\n' + (token.tokens ? this.parseInline(token.tokens) : token.text);
            }
            out += top ? this.renderer.paragraph(body) : body;
            continue;
          }
  
          default: {
            const errMsg = 'Token with "' + token.type + '" type was not found.';
            if (this.options.silent) {
              console.error(errMsg);
              return;
            } else {
              throw new Error(errMsg);
            }
          }
        }
      }
  
      return out;
    }
  
    /**
     * Parse Inline Tokens
     */
    parseInline(tokens, renderer) {
      renderer = renderer || this.renderer;
      let out = '',
        i,
        token,
        ret;
  
      const l = tokens.length;
      for (i = 0; i < l; i++) {
        token = tokens[i];
  
        // Run any renderer extensions
        if (this.options.extensions && this.options.extensions.renderers && this.options.extensions.renderers[token.type]) {
          ret = this.options.extensions.renderers[token.type].call({ parser: this }, token);
          if (ret !== false || !['escape', 'html', 'link', 'image', 'strong', 'em', 'codespan', 'br', 'del', 'text'].includes(token.type)) {
            out += ret || '';
            continue;
          }
        }
  
        switch (token.type) {
          case 'escape': {
            out += renderer.text(token.text);
            break;
          }
          case 'html': {
            out += renderer.html(token.text);
            break;
          }
          case 'link': {
            out += renderer.link(token.href, token.title, this.parseInline(token.tokens, renderer));
            break;
          }
          case 'image': {
            out += renderer.image(token.href, token.title, token.text);
            break;
          }
          case 'strong': {
            out += renderer.strong(this.parseInline(token.tokens, renderer));
            break;
          }
          case 'em': {
            out += renderer.em(this.parseInline(token.tokens, renderer));
            break;
          }
          case 'codespan': {
            out += renderer.codespan(token.text);
            break;
          }
          case 'br': {
            out += renderer.br();
            break;
          }
          case 'del': {
            out += renderer.del(this.parseInline(token.tokens, renderer));
            break;
          }
          case 'text': {
            out += renderer.text(token.text);
            break;
          }
          default: {
            const errMsg = 'Token with "' + token.type + '" type was not found.';
            if (this.options.silent) {
              console.error(errMsg);
              return;
            } else {
              throw new Error(errMsg);
            }
          }
        }
      }
      return out;
    }
  }
  
  /**
   * Marked
   */
  function marked(src, opt, callback) {
    // throw error in case of non string input
    if (typeof src === 'undefined' || src === null) {
      throw new Error('marked(): input parameter is undefined or null');
    }
    if (typeof src !== 'string') {
      throw new Error('marked(): input parameter is of type '
        + Object.prototype.toString.call(src) + ', string expected');
    }
  
    if (typeof opt === 'function') {
      callback = opt;
      opt = null;
    }
  
    opt = merge({}, marked.defaults, opt || {});
    checkSanitizeDeprecation(opt);
  
    if (callback) {
      const highlight = opt.highlight;
      let tokens;
  
      try {
        tokens = Lexer.lex(src, opt);
      } catch (e) {
        return callback(e);
      }
  
      const done = function(err) {
        let out;
  
        if (!err) {
          try {
            if (opt.walkTokens) {
              marked.walkTokens(tokens, opt.walkTokens);
            }
            out = Parser.parse(tokens, opt);
          } catch (e) {
            err = e;
          }
        }
  
        opt.highlight = highlight;
  
        return err
          ? callback(err)
          : callback(null, out);
      };
  
      if (!highlight || highlight.length < 3) {
        return done();
      }
  
      delete opt.highlight;
  
      if (!tokens.length) return done();
  
      let pending = 0;
      marked.walkTokens(tokens, function(token) {
        if (token.type === 'code') {
          pending++;
          setTimeout(() => {
            highlight(token.text, token.lang, function(err, code) {
              if (err) {
                return done(err);
              }
              if (code != null && code !== token.text) {
                token.text = code;
                token.escaped = true;
              }
  
              pending--;
              if (pending === 0) {
                done();
              }
            });
          }, 0);
        }
      });
  
      if (pending === 0) {
        done();
      }
  
      return;
    }
  
    try {
      const tokens = Lexer.lex(src, opt);
      if (opt.walkTokens) {
        marked.walkTokens(tokens, opt.walkTokens);
      }
      return Parser.parse(tokens, opt);
    } catch (e) {
      e.message += '\nPlease report this to https://github.com/markedjs/marked.';
      if (opt.silent) {
        return '<p>An error occurred:</p><pre>'
          + escape(e.message + '', true)
          + '</pre>';
      }
      throw e;
    }
  }
  
  /**
   * Options
   */
  
  marked.options =
  marked.setOptions = function(opt) {
    merge(marked.defaults, opt);
    changeDefaults(marked.defaults);
    return marked;
  };
  
  marked.getDefaults = getDefaults;
  
  marked.defaults = defaults;
  
  /**
   * Use Extension
   */
  
  marked.use = function(...args) {
    const opts = merge({}, ...args);
    const extensions = marked.defaults.extensions || { renderers: {}, childTokens: {} };
    let hasExtensions;
  
    args.forEach((pack) => {
      // ==-- Parse "addon" extensions --== //
      if (pack.extensions) {
        hasExtensions = true;
        pack.extensions.forEach((ext) => {
          if (!ext.name) {
            throw new Error('extension name required');
          }
          if (ext.renderer) { // Renderer extensions
            const prevRenderer = extensions.renderers ? extensions.renderers[ext.name] : null;
            if (prevRenderer) {
              // Replace extension with func to run new extension but fall back if false
              extensions.renderers[ext.name] = function(...args) {
                let ret = ext.renderer.apply(this, args);
                if (ret === false) {
                  ret = prevRenderer.apply(this, args);
                }
                return ret;
              };
            } else {
              extensions.renderers[ext.name] = ext.renderer;
            }
          }
          if (ext.tokenizer) { // Tokenizer Extensions
            if (!ext.level || (ext.level !== 'block' && ext.level !== 'inline')) {
              throw new Error("extension level must be 'block' or 'inline'");
            }
            if (extensions[ext.level]) {
              extensions[ext.level].unshift(ext.tokenizer);
            } else {
              extensions[ext.level] = [ext.tokenizer];
            }
            if (ext.start) { // Function to check for start of token
              if (ext.level === 'block') {
                if (extensions.startBlock) {
                  extensions.startBlock.push(ext.start);
                } else {
                  extensions.startBlock = [ext.start];
                }
              } else if (ext.level === 'inline') {
                if (extensions.startInline) {
                  extensions.startInline.push(ext.start);
                } else {
                  extensions.startInline = [ext.start];
                }
              }
            }
          }
          if (ext.childTokens) { // Child tokens to be visited by walkTokens
            extensions.childTokens[ext.name] = ext.childTokens;
          }
        });
      }
  
      // ==-- Parse "overwrite" extensions --== //
      if (pack.renderer) {
        const renderer = marked.defaults.renderer || new Renderer();
        for (const prop in pack.renderer) {
          const prevRenderer = renderer[prop];
          // Replace renderer with func to run extension, but fall back if false
          renderer[prop] = (...args) => {
            let ret = pack.renderer[prop].apply(renderer, args);
            if (ret === false) {
              ret = prevRenderer.apply(renderer, args);
            }
            return ret;
          };
        }
        opts.renderer = renderer;
      }
      if (pack.tokenizer) {
        const tokenizer = marked.defaults.tokenizer || new Tokenizer();
        for (const prop in pack.tokenizer) {
          const prevTokenizer = tokenizer[prop];
          // Replace tokenizer with func to run extension, but fall back if false
          tokenizer[prop] = (...args) => {
            let ret = pack.tokenizer[prop].apply(tokenizer, args);
            if (ret === false) {
              ret = prevTokenizer.apply(tokenizer, args);
            }
            return ret;
          };
        }
        opts.tokenizer = tokenizer;
      }
  
      // ==-- Parse WalkTokens extensions --== //
      if (pack.walkTokens) {
        const walkTokens = marked.defaults.walkTokens;
        opts.walkTokens = function(token) {
          pack.walkTokens.call(this, token);
          if (walkTokens) {
            walkTokens.call(this, token);
          }
        };
      }
  
      if (hasExtensions) {
        opts.extensions = extensions;
      }
  
      marked.setOptions(opts);
    });
  };
  
  /**
   * Run callback for every token
   */
  
  marked.walkTokens = function(tokens, callback) {
    for (const token of tokens) {
      callback.call(marked, token);
      switch (token.type) {
        case 'table': {
          for (const cell of token.header) {
            marked.walkTokens(cell.tokens, callback);
          }
          for (const row of token.rows) {
            for (const cell of row) {
              marked.walkTokens(cell.tokens, callback);
            }
          }
          break;
        }
        case 'list': {
          marked.walkTokens(token.items, callback);
          break;
        }
        default: {
          if (marked.defaults.extensions && marked.defaults.extensions.childTokens && marked.defaults.extensions.childTokens[token.type]) { // Walk any extensions
            marked.defaults.extensions.childTokens[token.type].forEach(function(childTokens) {
              marked.walkTokens(token[childTokens], callback);
            });
          } else if (token.tokens) {
            marked.walkTokens(token.tokens, callback);
          }
        }
      }
    }
  };
  
  /**
   * Parse Inline
   * @param {string} src
   */
  marked.parseInline = function(src, opt) {
    // throw error in case of non string input
    if (typeof src === 'undefined' || src === null) {
      throw new Error('marked.parseInline(): input parameter is undefined or null');
    }
    if (typeof src !== 'string') {
      throw new Error('marked.parseInline(): input parameter is of type '
        + Object.prototype.toString.call(src) + ', string expected');
    }
  
    opt = merge({}, marked.defaults, opt || {});
    checkSanitizeDeprecation(opt);
  
    try {
      const tokens = Lexer.lexInline(src, opt);
      if (opt.walkTokens) {
        marked.walkTokens(tokens, opt.walkTokens);
      }
      return Parser.parseInline(tokens, opt);
    } catch (e) {
      e.message += '\nPlease report this to https://github.com/markedjs/marked.';
      if (opt.silent) {
        return '<p>An error occurred:</p><pre>'
          + escape(e.message + '', true)
          + '</pre>';
      }
      throw e;
    }
  };
  
  /**
   * Expose
   */
  marked.Parser = Parser;
  marked.parser = Parser.parse;
  marked.Renderer = Renderer;
  marked.TextRenderer = TextRenderer;
  marked.Lexer = Lexer;
  marked.lexer = Lexer.lex;
  marked.Tokenizer = Tokenizer;
  marked.Slugger = Slugger;
  marked.parse = marked;
  Parser.parse;
  Lexer.lex;

function lineTransformBasedOnPrefixes(line) {
    var convLine = convertSingleLineOfText;
    var re = function (regexp, transform) { return function (input) { var result = input.match(regexp); if (!result)
        return null; return transform(result); }; };
    var slug = function (text) { return text.replace(/ /g, '-').replace(/[^A-Za-z0-9א-ת_./\-]+/g, '').toLowerCase(); }; // trying to match Marked
    var funcs = [
        re(/^(#+) (.*)/, function (x) { return "h".concat(x[1].length, " id=").concat(JSON.stringify(slug(x[2])), " -- ").concat(convLine(x[2])); }),
        re(/^[-*] (.*)/, function (x) { return "markdownlistitem-ul -- ".concat(convLine(x[1])); }),
        re(/^[0-9]+[.)] (.*)/, function (x) { return "markdownlistitem-ol -- ".concat(convLine(x[1])); }),
        re(/^> (.*)/, function (x) { return "markdownlistitem-blockquote.blockquote -- ".concat(convLine(x[1])); }),
        re(/^[+|] (.*)/, function (x) { return "p -- ".concat(convLine(x[1])); }),
        re(/^\|\| (.*)/, function (x) { return "div -- ".concat(convLine(x[1])); }),
        re(/^\|\|\| (.*)/, function (x) { return "-- ".concat(convLine(x[1])); }),
    ];
    var tryThem = funcs.find(function (f) { return f(line) !== null; });
    if (tryThem)
        return tryThem(line);
    return line;
}
function convertSingleLineOfText(txt) {
    // if (!globalThis.convertMarkdown) return txt
    var ret = marked.parse(txt).replace(/\n/g, ' ').trim();
    if (ret.startsWith("<p>"))
        ret = ret.slice(3, ret.length - 4);
    return ret;
}
function aggressiveMarkdownParagraphDetection(tag, words) {
    // After parsing into a tag and words, returns whether the line still looks like a Markdown paragraph rather than a line containing an element, based on heuristics
    /* Known fail cases:
        Let's talk about something          (because the quote causes it to be parsed as one word)
            (maybe we should use simpler word parsing for this test. Though that needs reparsing so it'll be slow)
    */
    var hasAndNotAtEnd = function (text, char) { var ind = text.indexOf(char); return ind >= 0 && ind != (text.length - char.length); };
    var looksCodey = function (w) { return w === ">" || ["=", ".", ":", "#"].some(function (ch) { return hasAndNotAtEnd(w, ch); }); };
    return words.length >= 3 && !looksCodey(tag) && !words.slice(0, 3).some(looksCodey);
}
function fixMarkdownMacro(n) {
    var e_1, _a;
    // Handles list items and blockquotes, which need to be grouped together with siblings of the same type, into a container of the appropriate type
    // (markdownlistitem-ul)+       --->        ul > li
    // (markdownlistitem-ol)+       --->        ol > li
    // (blockquote.blockquote)+     --->        blockquote.blockquote > p
    var foundAny = false, children = [], lastTag = "";
    try {
        for (var _b = __values(n.children), _c = _b.next(); !_c.done; _c = _b.next()) {
            var c = _c.value;
            if (c.tag.startsWith("markdownlistitem-")) {
                foundAny = true;
                var kind = c.tag.split("-")[1];
                var item = clone(c, { tag: kind === 'blockquote.blockquote' ? 'p' : "li" });
                if (lastTag === c.tag) {
                    children.slice(-1)[0].children.push(item);
                }
                else {
                    var container = new VugNode(kind, [], [item]);
                    children.push(container);
                }
            }
            else {
                children.push(c);
            }
            lastTag = c.tag;
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    if (!foundAny)
        return n;
    return new VugNode(n.tag, n.words, children);
}

/* TODO
- Debug things that aren't working properly:
    f:c.c.class1.class2 (class1 is taken as align-content, and class2 is discarded) (either use hyphens [but that conflicts with row], or go back to "al" or "fx" props)
    `d vg-let:foo="a b".split(' ')` throws `Unterminated string quote in value`
*/
function clone(node, changes) {
    var e_1, _a;
    var ret = new VugNode(changes.tag || node.tag, node.words, node.children);
    var _loop_1 = function (k, v) {
        if (k === 'tag')
            return "continue";
        else if (v === undefined)
            return "continue";
        if (ret.words.find(function (x) { return x.key === k && x.isExpr && v !== null; }))
            throw "Clone can't overwrite attribute '".concat(k, "' that is bound to an expression");
        ret.words = ret.words.filter(function (x) { return x.key !== k; });
        if (v !== null)
            ret.words.push(new VugWord(k, v, false));
    };
    try {
        for (var _b = __values(Object.entries(changes)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var _d = __read(_c.value, 2), k = _d[0], v = _d[1];
            _loop_1(k, v);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return ret;
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
    node = fixMarkdownMacro(node);
    node = directChild(node);
    node = doAwaitAttribute(node);
    node = tagNameParser(node);
    node = splitDoubleClasses(node);
    node = customTagTypes(node);
    node = routing(node);
    node = flexArg(node);
    node = mainTransform(node);
    node = sheetStyles(node);
    node = cssCustomTag(node);
    node = compileVgCss(node);
    node = vgDo(node);
    node = vgLet(node);
    node = vgEachSimple(node);
    node = vgEach(node);
    node = allowReferencesToGlobals(node);
    return new VugNode(node.tag, node.words, node.children.map(function (c) { return runAll(c); }));
}
function doAwaitAttribute(n) {
    // const awaitWords = n.words.filter(x => x.key.startsWith("await-"))
    // if (!awaitWords.length) return n
    // return new VugNode(n.tag, n.words.map(w => awaitWords.includes(w) ? new VugWord(w.key.slice(6),)))
    var word = n.words.find(function (w) { return w.key === 'await' || w.key.startsWith('await:'); });
    if (!word)
        return n;
    var varName = word.value.split(":")[1] || 'value';
    var thisWithAwaitRemoved = clone(n, { await: null });
    var tmplt = new VugNode("template", [new VugWord('v-slot', "{value: ".concat(varName, "}"), true)], [thisWithAwaitRemoved]);
    return new VugNode("async-value", [new VugWord('promise', n.getWord('await') || '', true)], [tmplt]);
}
function customTagTypes(n) {
    if (n.tag === 'd')
        return clone(n, { tag: "div" });
    if (n.tag === 's')
        return clone(n, { tag: "span" });
    if (n.tag === 'fr')
        n = clone(n, { tag: "f", 'style_flex-direction': 'row' });
    if (n.tag === 'fc')
        n = clone(n, { tag: "f", 'style_flex-direction': 'column' });
    if (n.tag === 'f')
        n = clone(n, { tag: "flex" });
    if (n.tag === "flex" && n.getWord("al"))
        n = clone(n, { fx: n.getWordErrIfCalc("al"), al: null });
    if (n.tag === 'flex')
        return clone(n, { tag: "div", style_display: "flex", fx: n.getWord("type") || undefined, type: null });
    if (n.tag === 'ib' || n.tag === 'inline-block')
        return clone(n, { tag: "div", style_display: "inline-block" });
    return n;
}
function routing(n) {
    if (n.tag === "a" && n.getWord('to-route')) {
        var word = n.words.find(function (x) { return x.key === 'to-route'; });
        var ret = clone(n, { 'to-route': null, onclick: "router.push(this.getAttribute('href')); return false" }); // getAttribute because href property returns the full URL with https://example.com!
        ret.words.push(new VugWord('href', word.value, word.isExpr)); // to allow calculated
        return ret;
    }
    if (n.tag !== "route")
        return n;
    var path = n.getWordErrIfCalc("path");
    var innerVFor = "{$route, $router} in (Array.constructor('return window')().router?.match?.(".concat(JSON.stringify(path).replace(/"/g, "&quot;"), ") || [])");
    var vIfTrue = function () { return new VugWord("v-if", "true", false); }; // for 'template' tags. Otherwise Vue renders them as the HTML tag 'template' which is invisible. I want a fragment. Note that even with this done, I couldn't make 'inner' a child of scriptAdder. It wouldn't render.
    var inner = new VugNode("template", [new VugWord("v-for", innerVFor, true)], n.children);
    var script = "function($el) {\n        const win = Array.constructor('return window')();\n        // win.console.log('Running!');\n        if (!win.router) {\n            win.router = {\n                basePath: '/bandlibs', // or ''\n                get pathname() { return win.location.pathname.replace(win.router.basePath, '') || '/' },\n                push(url) { win.history.pushState('', '', win.router.basePath + url); win.dispatchEvent(new win.Event('popstate')) },\n                match: path => win.router.pathname === path ? [{ $router: win.router, $route: { path: win.router.pathname, params: {} } }] : [],\n            };\n            // win.console.log(\"Router initialized!\");\n        };\n        // Update our component when the route changes, as well as once now\n        // This doesn't work in production. We'll go another way instead\n        // if (!$el || $el.ranonce) return;\n        // $el.ranonce = true;\n        // win.console.log('running on', $el, this); // debug\n        // const onUpd = () => $el.__vueParentComponent?.update();\n        // win.addEventListener('popstate', onUpd);\n        // win.setTimeout(onUpd, 10);\n      }\n    ".split("\n").map(function (x) { return x.split(" //")[0].trim(); }).join(" ").trim(); // So make sure you have semicolons on each line
    var scriptAdder = new VugNode("div", [new VugWord("ref", script, true)]);
    var container = new VugNode("template", [vIfTrue()], [scriptAdder, inner]);
    return container;
}
function splitDoubleClasses(n) {
    return new VugNode(n.tag, n.words.flatMap(function (w) {
        if (w.key[0] !== '.' || !w.key.slice(1).includes('.'))
            return [w];
        var classes = w.key.slice(1).split(".");
        return classes.map(function (x) { return new VugWord("." + x, w.value, w.isExpr); });
    }), n.children);
}
function tagNameParser(n) {
    var e_2, _a, e_3, _b, e_4, _c;
    var _d;
    var parts = n.tag.split('').reduce(function (list, char) {
        if (/[A-Za-z0-9_,|!\-]/.test(char))
            list.slice(-1)[0].text += char;
        else
            list.push({ prefix: char, text: "" }); //TODO allow prefixes consisting of double special characters, i.e. push onto previous
        return list;
    }, [{ text: '', prefix: '' }]).filter(function (x) { return x.text; });
    var tag = ((_d = parts.filter(function (x) { return !x.prefix; })[0]) === null || _d === void 0 ? void 0 : _d.text) || 'div';
    var classes = parts.filter(function (x) { return x.prefix === '.'; }).map(function (x) { return x.text; });
    var ids = parts.filter(function (x) { return x.prefix === '#'; }).map(function (x) { return x.text; });
    var args = parts.filter(function (x) { return x.prefix === ':'; }).map(function (x) { return x.text; });
    if (ids.length > 1)
        throw "Can't have more than 1 ID in tag name: '".concat(n.tag, "'");
    if (args.length > 1)
        throw "Can't have more than 1 arg in tag name: '".concat(n.tag, "'");
    // TODO ensure we recognize all parts
    var words = n.words.slice();
    try {
        for (var classes_1 = __values(classes), classes_1_1 = classes_1.next(); !classes_1_1.done; classes_1_1 = classes_1.next()) {
            var w = classes_1_1.value;
            words.push(new VugWord("." + w, '', false));
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (classes_1_1 && !classes_1_1.done && (_a = classes_1["return"])) _a.call(classes_1);
        }
        finally { if (e_2) throw e_2.error; }
    }
    try {
        for (var ids_1 = __values(ids), ids_1_1 = ids_1.next(); !ids_1_1.done; ids_1_1 = ids_1.next()) {
            var w = ids_1_1.value;
            words.push(new VugWord("id", w, false));
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (ids_1_1 && !ids_1_1.done && (_b = ids_1["return"])) _b.call(ids_1);
        }
        finally { if (e_3) throw e_3.error; }
    }
    try {
        for (var args_1 = __values(args), args_1_1 = args_1.next(); !args_1_1.done; args_1_1 = args_1.next()) {
            var w = args_1_1.value;
            words.push(new VugWord(['slot', 'transition', 'transition-group', 'transitiongroup'].includes(tag.toLowerCase()) ? "name" : "type", w, false));
        }
    }
    catch (e_4_1) { e_4 = { error: e_4_1 }; }
    finally {
        try {
            if (args_1_1 && !args_1_1.done && (_c = args_1["return"])) _c.call(args_1);
        }
        finally { if (e_4) throw e_4.error; }
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
        throw "Tag name after > cannot have a value (obviously, it's a tag, not an attribute!)";
    var secondTagWords = n.words.slice(indOfArrow + 2);
    var firstTagWords = n.words.slice(0, indOfArrow);
    return new VugNode(n.tag, firstTagWords, [new VugNode(secondTag.key, secondTagWords, n.children.slice())]);
}

function partition(arr, fn, minGroups) {
    var e_1, _a;
    if (minGroups === void 0) { minGroups = 2; }
    // Usage: const [trueOnes, falseOnes] = partition(arr, x => trueOrFalse)
    // Or:    const [one, two, three] = partition(arr, x => num, 3) // use the last argument to create a min number of groups
    var ret = Array.from(Array(minGroups)).map(function () { return []; });
    try {
        for (var arr_1 = __values(arr), arr_1_1 = arr_1.next(); !arr_1_1.done; arr_1_1 = arr_1.next()) {
            var i = arr_1_1.value;
            var k = fn(i);
            var ind = typeof k === 'number' ? k : !!k ? 0 : 1;
            while (ret.length < (ind + 1))
                ret.push([]);
            ret[ind].push(i);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (arr_1_1 && !arr_1_1.done && (_a = arr_1["return"])) _a.call(arr_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return ret;
}

function emitVueTemplate(node, whitespace) {
    var e_1, _a;
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
        var _b = __read(partition(node.words, function (x) { return x.key.startsWith("style_") ? 0 : x.key.startsWith(".") ? 1 : 2; }, 3), 3), style = _b[0], klass = _b[1], attr = _b[2];
        var _c = __read(partition(klass, function (x) { return x.isExpr; }), 2), classExpr = _c[0], classStatic = _c[1];
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
        var _d = __read(partition(style, function (x) { return x.isExpr; }), 2), styleExpr = _d[0], styleStatic = _d[1];
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
                    var needsColon = x.isExpr && !x.key.startsWith("v-") && !x.key.startsWith("x-");
                    out.push(" ", needsColon ? ":" : "", x.key);
                    out.push('="', htmlAttrEnc_1(x.value), '"');
                }
            }
        });
        out.push(">");
    }
    if (node.children.length) {
        var needsIndent = whitespace && (node.children.length > 1 || (node.children[0] && (node.children[0].tag !== "_html" || (node.children[0].getWord("_contents") || '').includes('\n'))));
        if (needsIndent)
            out.push("\n");
        try {
            for (var _e = __values(node.children), _f = _e.next(); !_f.done; _f = _e.next()) {
                var c = _f.value;
                if (needsIndent && c !== node.children[0])
                    out.push("\n");
                var txt = emitVueTemplate(c, whitespace);
                if (needsIndent)
                    txt = txt.split("\n").map(function (l) { return "  ".concat(l); }).join('\n'); // Indent
                out.push(txt);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_a = _e["return"])) _a.call(_e);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (needsIndent)
            out.push("\n");
    }
    // Close tags except for 'void tags'. That includes '_html' because that's my element for raw HTML
    if (!["_html", "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"].includes(node.tag.toLowerCase()))
        out.push("</".concat(node.tag, ">"));
    return out.join("");
}

var vueDefaultOpts = { Fragment: "Vue.Fragment", className: "className", h: "h" };
function renderAst(nodes, opts) {
    if (opts === void 0) { opts = vueDefaultOpts; }
    return nodes.length === 1 ? renderNode(nodes[0], opts) : renderNode(new VugNode(opts.Fragment || vueDefaultOpts.Fragment, undefined, nodes), opts); // for React, should be React.Fragment I think
}
function basicVueDirectivesToJsx(v) {
    /*
    Based on: https://vuejs.org/guide/extras/render-function.html#render-function-recipes
    TODO:
    - if any elements have v-if, v-else-if, v-else, convert them to a ternary expression. Has to be done at parent level
    - v-for -> map
    - seems v-html has to be done too, using innerHTML -- I think for React dangerouslySetInnerHTML to {html: contents}
    - and v-text, maybe innerText, or just add a text node: String(expr)
    - and v-show, using display: none/null I guess
    - v-model
      - .number etc -- how?
  
    - @click to onClick, but convert to a function if it has anything but alphanumeric and dots.
      - modifiers -- concat any modifiers in Title case for passive, etc, for others, use Vue.withModifiers
    - does :is tag have to be converted?
    - Built-in components
    - custom directives
    // - slots incl passing data
    - calling slots incl passing children to slots
    */
    return new VugNode(v.tag, v.words, v.children);
}
// TODO: non-HTML tags should be done as Expr i.e. it's a component in scope
function renderNode(node, opts) {
    var e_1, _a, e_2, _b;
    node = basicVueDirectivesToJsx(node);
    if (node.tag === "_html")
        return JSON.stringify(node.getWordErrIfCalc("_contents") || ""); // TODO not really, as this will be a text node in a render function, whereas this can contain HTML tags (and was converted from Markdown). We have to really parse it in the parser... or maybe it's legit to say you can't do this if you're gonna use the render func maker
    var attrExprText = new Map();
    var styleExprText = new Map();
    var classExprText = new Map();
    var mapToObj = function (m) { return '{ ' + Array.from(m.entries()).map(function (_a) {
        var _b = __read(_a, 2), k = _b[0], v = _b[1];
        return "".concat(JSON.stringify(k), ": ").concat(v);
    }).join(", ") + ' }'; };
    var _loop_1 = function (x) {
        var exprText = !x.value ? 'true' : x.isExpr ? x.value : JSON.stringify(x.value);
        if (x.key.startsWith("style_")) {
            styleExprText.set(caseChange$1(x.key.slice(6)).toCamel(), exprText);
            attrExprText.set('style', mapToObj(styleExprText));
        }
        else if (x.key.startsWith(".")) {
            classExprText.set(x.key.slice(1), exprText);
            var _g = __read(partition(__spreadArray([], __read(classExprText.entries()), false), function (_a) {
                var _b = __read(_a, 2), k = _b[0], v = _b[1];
                return v === 'true';
            }), 2), sStatic = _g[0], sCalc = _g[1];
            var stringExprs_1 = [];
            if (sStatic.length)
                stringExprs_1.push(JSON.stringify(sStatic.map(function (x) { return x[0]; }).join(" ")));
            sCalc.forEach(function (_a) {
                var _b = __read(_a, 2), k = _b[0], v = _b[1];
                return stringExprs_1.push("((".concat(v, ") ? ").concat(JSON.stringify(' ' + k), " : \"\")"));
            });
            attrExprText.set(opts.className || vueDefaultOpts.className, stringExprs_1.join(" + "));
            // attrExprText.set(opts.className || vueDefaultOpts.className, sStatic.join(" ") + sCalc.length  [...classExprText.entries()].map(([k,v],i) => exprText === 'true' ? JSON.stringify(' ' + k) : `((${v}) ? ${JSON.stringify(' ' + k)} : "")`).join(" + "))
            // attrExprText.set(opts.className || vueDefaultOpts.className, `classNames(${mapToObj(classExprText)})`)
        }
        else {
            attrExprText.set(x.key, exprText);
        }
    };
    try {
        for (var _c = __values(node.words), _d = _c.next(); !_d.done; _d = _c.next()) {
            var x = _d.value;
            _loop_1(x);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_d && !_d.done && (_a = _c["return"])) _a.call(_c);
        }
        finally { if (e_1) throw e_1.error; }
    }
    var out = [];
    if (node.tag === "slot") {
        var identifier = "slots.".concat(node.getWordErrIfCalc("name")); // TODO support calculated name
        var children = node.children.length ? "\n".concat(indent(renderAst(node.children, opts)), "\n") : 'null';
        out.push("".concat(identifier, " ? ").concat(identifier, "(").concat(mapToObj(attrExprText), ") : ").concat(children)); // TODO remove "name"
    }
    else {
        out.push("".concat(opts.h || vueDefaultOpts.h, "(").concat(JSON.stringify(node.tag), ", "));
        if (attrExprText.size)
            out.push(mapToObj(attrExprText));
        else
            out.push("null");
        try {
            // Children
            for (var _e = __values(node.children), _f = _e.next(); !_f.done; _f = _e.next()) {
                var x = _f.value;
                out.push(",\n" + indent(renderNode(x, opts)));
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_b = _e["return"])) _b.call(_e);
            }
            finally { if (e_2) throw e_2.error; }
        }
        out.push(")");
    }
    return out.join("");
}
function caseChange$1(txt) {
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
function indent(text) { return text.split("\n").map(function (x) { return "  ".concat(x); }).join("\n"); }

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
        toVueTemplate: function () { return ast.map(function (x) { return emitVueTemplate(x, true); }).join("\n"); },
        toRenderFunc: function (renderFuncOpts) { return renderAst(ast, renderFuncOpts); }
    };
}
function splitThree(what, sepChar) {
    var e_1, _a;
    if (sepChar === void 0) { sepChar = " "; }
    // Splits on a char EXCEPT when that char occurs within quotes, parens, braces, curlies
    // MAYBE allow sepChar to be >1 char long?
    // MAYBE allow for multiple possibilities of sepChar, and tack it on? Can use this for parsing classes&ids&args... nah won't help, we don't want quotes in there anyway
    // MAYBE customize the list of things that can quote? and the escape char?
    var ret = [''];
    var stack = [];
    var escaping = false;
    try {
        for (var _b = __values(what.split('')), _c = _b.next(); !_c.done; _c = _b.next()) {
            var ch = _c.value;
            var starter = "'\"({[`".indexOf(ch);
            if (escaping) {
                ret[ret.length - 1] += ch;
                escaping = false;
                continue;
            }
            else if (ch === '\\') {
                escaping = true;
                continue;
            }
            if (ch === stack.slice(-1)[0]) {
                stack.pop();
            }
            else if (starter >= 0) {
                stack.push("'\")}]`"[starter]); // Add the expected closing char to the stack
            }
            if (ch === sepChar && !stack.length) {
                ret.push(''); // Start a new item
            }
            else {
                ret[ret.length - 1] += ch; // Add to current item
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    // if (stack.length) throw "Unterminated " + stack.slice(-1)[0]
    return ret;
}
function parseValue(value) {
    /* Supports:
        foo             (literal)
        "foo"           (literal)
        'foo'           (literal)
        `foo ${}`       (expr)
        (1 + 2)         (expr)
        {obj: 'foo'}    (expr)
        345.2           (expr)
    */
    if (!value.length)
        return [false, '']; // If there is no value, it's not an expr.
    var first = value[0], last = value[value.length - 1], same = first === last && value.length > 1;
    if (same && (first === '"' || first === "'"))
        return [false, value.slice(1, value.length - 1)]; // Quoted values
    var opener = "({`".indexOf(first), closer = ")}`".indexOf(last);
    if (opener >= 0 && opener === closer && value.length > 1)
        return [true, (first === '(') ? value.slice(1, value.length - 1) : value]; // parens, objects, template strings. Cut off parens
    if (!isNaN(Number(value)))
        return [true, value]; // numbers
    // Removed because it throws for things like `vg-let:foo="a b".split(' ')` which is perfectly legal. // if ("\"'`".indexOf(first) >= 0) throw `Unterminated string quote in value: ${value}`
    return [false, value];
}
function splitTwo$1(text, sep) {
    var pos = text.indexOf(sep);
    if (pos < 0)
        return [text, ''];
    return [text.substr(0, pos), text.substr(pos + sep.length)];
}
var htmlNode = function (html, raw) {
    if (raw === void 0) { raw = false; }
    return new VugNode("_html", [new VugWord("_contents", raw ? html : convertSingleLineOfText(html), false)]);
};
function splitByContentSeparator(line) {
    // Returns the elementPart trimmed, BTW. And the contentPart not, because that's not desired sometimes.
    var findContentSep = line.match(/(?<![^ ])--(raw--)? /); // That's negative lookbehind, to not match the `--` if it's preceded by anything but a space.
    if (!findContentSep)
        return { elementPart: line.trim(), contentPart: "", contentIsRaw: false };
    var optionalRaw = findContentSep[1];
    return { elementPart: line.slice(0, findContentSep.index).trim(), contentPart: line.slice(findContentSep.index + 2 /*--*/ + ((optionalRaw === null || optionalRaw === void 0 ? void 0 : optionalRaw.length) || 0) + 1 /*space*/), contentIsRaw: !!optionalRaw };
}
function parseLine(line) {
    line = splitTwo$1(line, "// ")[0]; // ignore comments
    if (line.startsWith("<"))
        line = "--raw-- ".concat(line); // allow HTML tags
    line = lineTransformBasedOnPrefixes(line);
    var splitC = splitByContentSeparator(line);
    if (!splitC.elementPart)
        return htmlNode(splitC.contentPart, splitC.contentIsRaw);
    var _a = __read(splitThree(splitC.elementPart, " ")), tag = _a[0], words = _a.slice(1);
    if (aggressiveMarkdownParagraphDetection(tag, words))
        return parseLine("| " + line);
    var words2 = words.map(function (w) {
        var _a = __read(splitTwo$1(w, "="), 2), key = _a[0], value = _a[1];
        var _b = __read(parseValue(value), 2), isExpr = _b[0], parsedValue = _b[1];
        if (key[0] === ':') {
            key = key.slice(1);
            isExpr = true;
        } // allow Vue-style :attr=expr
        if ((key[0] === '.' || key.startsWith("v-") || key.startsWith("x-")) && value)
            isExpr = true; // .foo, v- and x- are always expressions (as long as they have a value)
        return new VugWord(key, parsedValue, isExpr);
    });
    var children = splitC.contentPart ? [htmlNode(splitC.contentPart, splitC.contentIsRaw)] : [];
    return new VugNode(tag, words2, children);
}
function parseDoc(html) {
    var e_2, _a;
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
    try {
        for (var lines_1 = __values(lines), lines_1_1 = lines_1.next(); !lines_1_1.done; lines_1_1 = lines_1.next()) {
            var ln = lines_1_1.value;
            _loop_1(ln);
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (lines_1_1 && !lines_1_1.done && (_a = lines_1["return"])) _a.call(lines_1);
        }
        finally { if (e_2) throw e_2.error; }
    }
    // Run macros. Let's run it on a fake top-level element, so that macros can access the children of it
    // Formerly simply: return out.map(x => Macros.runAll(x))
    var doc = new VugNode("_doc", undefined, out);
    var nodes = runAll(doc).children;
    return nodes;
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
function imbaCssShorthand(key) {
    return imbaDict[key] || key;
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
    var e_1, _a, e_2, _b, e_3, _c;
    line = splitTwo(line, "// ")[0]; // ignore comments
    if (line.startsWith("<"))
        line = "-- " + line; //return { tag: "html", attrs: [], innerHtml: line, children: [] }
    if (line.startsWith("-- "))
        line = " " + line; // so that it gets detected
    var _d = __read(splitTwo(line, " -- "), 2), wordPart = _d[0], innerHtml = _d[1];
    wordPart = wordPart.trim();
    var _e = __read(wordPart.match(/(?=\S)[^"\s]*(?:"[^\\"]*(?:\\[\s\S][^\\"]*)*"[^"\s]*)*/g) || ['']), tagPart = _e[0], words = _e.slice(1); // Not 100% sufficient. From https://stackoverflow.com/questions/4031900/split-a-string-by-whitespace-keeping-quoted-segments-allowing-escaped-quotes
    var _f = __read(tagPart.split(".")), __tag = _f[0], classesAttachedToTag = _f.slice(1);
    var _g = __read(splitTwo(__tag, "#"), 2), _tag = _g[0], id = _g[1];
    var tag = _tag || ((classesAttachedToTag.length || wordPart.length) ? 'div' : 'html'); // html for lines with no tag only innerHtml
    try {
        for (var classesAttachedToTag_1 = __values(classesAttachedToTag), classesAttachedToTag_1_1 = classesAttachedToTag_1.next(); !classesAttachedToTag_1_1.done; classesAttachedToTag_1_1 = classesAttachedToTag_1.next()) {
            var x = classesAttachedToTag_1_1.value;
            words.push("." + x);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (classesAttachedToTag_1_1 && !classesAttachedToTag_1_1.done && (_a = classesAttachedToTag_1["return"])) _a.call(classesAttachedToTag_1);
        }
        finally { if (e_1) throw e_1.error; }
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
    try {
        for (var words_1 = __values(words), words_1_1 = words_1.next(); !words_1_1.done; words_1_1 = words_1.next()) {
            var x = words_1_1.value;
            var _h = __read(splitTwo(x, "="), 2), _key = _h[0], _value = _h[1];
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
            try {
                for (var _j = (e_3 = void 0, __values(Object.keys(afterMacros))), _k = _j.next(); !_k.done; _k = _j.next()) {
                    var key = _k.value;
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
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_k && !_k.done && (_c = _j["return"])) _c.call(_j);
                }
                finally { if (e_3) throw e_3.error; }
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (words_1_1 && !words_1_1.done && (_b = words_1["return"])) _b.call(words_1);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return { tag: tag, attrs: attrs, innerHtml: innerHtml || undefined, children: [] };
}
function v1Load(text) {
    var nodes = compile(text);
    var toVueTemplate = function (whitespace) {
        if (whitespace === void 0) { whitespace = false; }
        return nodes.map(function (x) { return nodeToVue(x, whitespace); }).join(whitespace ? "\n" : "");
    };
    return { ast: nodes, toVueTemplate: toVueTemplate, toRenderFunc: function () { return toRenderFunc(nodes[0]); } };
}
function toRenderFunc(node, opts) {
    var e_4, _a, e_5, _b;
    if (opts === void 0) { opts = { ce: "/*#__PURE__*/React.createElement", className: "className" }; }
    if (node.tag === "html")
        return JSON.stringify(node.innerHtml || "");
    var attrExprText = new Map();
    var styleExprText = new Map();
    var classExprText = new Map();
    var mapToObj = function (m) { return ' { ' + Array.from(m.entries()).map(function (_a) {
        var _b = __read(_a, 2), k = _b[0], v = _b[1];
        return "".concat(JSON.stringify(k), ": ").concat(v);
    }).join(", ") + '} '; };
    try {
        for (var _c = __values(node.attrs), _d = _c.next(); !_d.done; _d = _c.next()) {
            var x = _d.value;
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
    }
    catch (e_4_1) { e_4 = { error: e_4_1 }; }
    finally {
        try {
            if (_d && !_d.done && (_a = _c["return"])) _a.call(_c);
        }
        finally { if (e_4) throw e_4.error; }
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
    try {
        for (var _e = __values(node.children), _f = _e.next(); !_f.done; _f = _e.next()) {
            var x = _f.value;
            out.push(", " + toRenderFunc(x, opts));
        }
    }
    catch (e_5_1) { e_5 = { error: e_5_1 }; }
    finally {
        try {
            if (_f && !_f.done && (_b = _e["return"])) _b.call(_e);
        }
        finally { if (e_5) throw e_5.error; }
    }
    out.push(")");
    return out.join("");
}
function nodeToVue(node, whitespace) {
    var e_6, _a;
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
        var _b = __read(['class', 'style', 'attr'].map(function (x) { return node.attrs.filter(function (y) { return y.kind === x; }); }), 3), klass = _b[0], style = _b[1], attr = _b[2];
        var _c = __read(partition(klass, function (x) { return x.isExpr; }), 2), classExpr = _c[0], classStatic = _c[1];
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
        var _d = __read(partition(style, function (x) { return x.isExpr; }), 2), styleExpr = _d[0], styleStatic = _d[1];
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
    try {
        for (var _e = __values(node.children), _f = _e.next(); !_f.done; _f = _e.next()) {
            var c = _f.value;
            var txt = nodeToVue(c, whitespace);
            if (whitespace)
                txt = txt.split("\n").map(function (l) { return "\n  ".concat(l); }).join("\n"); // Indent
            out.push(txt);
        }
    }
    catch (e_6_1) { e_6 = { error: e_6_1 }; }
    finally {
        try {
            if (_f && !_f.done && (_a = _e["return"])) _a.call(_e);
        }
        finally { if (e_6) throw e_6.error; }
    }
    if (whitespace)
        out.push("\n");
    // Close tags except for 'void tags'. That includes 'html' because that's my element for raw HTML
    if (!["html", "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"].includes(node.tag.toLowerCase()))
        out.push("</".concat(node.tag, ">"));
    return out.join("");
}
function childize(items, getIndent) {
    var e_7, _a;
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
    try {
        for (var items_1 = __values(items), items_1_1 = items_1.next(); !items_1_1.done; items_1_1 = items_1.next()) {
            var i = items_1_1.value;
            _loop_1(i);
        }
    }
    catch (e_7_1) { e_7 = { error: e_7_1 }; }
    finally {
        try {
            if (items_1_1 && !items_1_1.done && (_a = items_1["return"])) _a.call(items_1);
        }
        finally { if (e_7) throw e_7.error; }
    }
    return out;
}

function ViteTransformPlugin(opts) {
    if (opts === void 0) { opts = {}; }
    return {
        name: 'vite-plugin-vue-vug',
        enforce: "pre",
        transform: function (code, id) {
            var isVueFile = id.endsWith('.vue');
            if (!isVueFile && !/\.m?(j|t)sx?$/.test(id))
                return;
            var compile = function (what) { return (opts._tempLangVersion || 1.2) >= 2 ? compile$1(what) : v1Load(what); };
            code = transformVugTemplateStrings(code);
            if (!id.endsWith(".vue"))
                return;
            var origCode = code;
            var findTemplateTag = /<template lang=['"]?vug['" >]/g.exec(code);
            if (!findTemplateTag)
                return;
            var startOfTemplateTag = findTemplateTag.index;
            var startOfCode = code.indexOf(">", startOfTemplateTag) + 1;
            var endOfCode = code.lastIndexOf("</template>");
            var vugCode = code.substring(startOfCode, endOfCode);
            var output = compile(vugCode).toVueTemplate();
            code = code.substring(0, startOfTemplateTag) + "<template>" + output + code.substring(endOfCode); // We have to replace the template tag so the SFC compiler doesn't error because it doesn't know how to process Vue
            // require('fs').writeFileSync(`${require('os').tmpdir()}/vugtmp_` + id.split("/").slice(-1)[0], code) // For easy debugging output uncomment
            // Inject some code (experimental)
            if (origCode.includes('route path=')) {
                var decls = "import * as VugVue from 'vue'";
                var statements = "\n          const inst = VugVue.getCurrentInstance()\n          window.addEventListener('popstate', () => inst.update())\n          setTimeout(() => inst.update(), 10)\n        ";
                var scriptTag = code.match(/<script[^>]+>/);
                var scriptEndTag = code.match(/<\/script>/);
                if (!scriptTag || !scriptEndTag)
                    throw "Can't inject script; tag not found"; // TODO add one?
                code = code.replace(scriptTag[0], scriptTag[0] + '\n' + decls + '\n');
                code = code.replace(scriptEndTag[0], '\n' + statements + '\n' + scriptEndTag);
            }
            if (origCode.includes("// VUGDEBUG"))
                console.log("===============\nVug output ".concat(new Date(), "\n").concat(code, "\n==============="));
            return code;
        }
    };
}
function load(vugCode, opts) {
    if (opts === void 0) { opts = {}; }
    var useV2 = (opts._tempLangVersion || 1.2) >= 2;
    if (!useV2)
        return v1Load(vugCode);
    return compile$1(vugCode);
}
function vug(vugCode) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    throw "Vug.vug() template-tag function was called at runtime -- this means that you haven't properly set up a compile-time plugin to replace calls to it. If you meant to convert Vug code at runtime, use one of the provided methods for doing so.";
}
function transformVugTemplateStrings(code, opts) {
    if (opts === void 0) { opts = {}; }
    var weFoundOne = false;
    var templateTag = opts.templateTag || 'vug';
    var hFuncAlias = "_vugHFunc";
    while (true) {
        var ind = code.indexOf(templateTag + "`");
        if (ind < 0)
            break;
        weFoundOne = true;
        var end = code.indexOf("`", ind + templateTag.length + 1);
        var contents = code.substring(ind + templateTag.length + 1, end);
        contents = contents.replace(/@click/g, ':onClick'); // temp to support Vue syntax
        var converted = compile$1(contents).toRenderFunc({ h: hFuncAlias }); // callback(contents)
        converted = converted.replace(/\{\{/g, '" + '); // temp to support Vue syntax
        converted = converted.replace(/\}\}/g, ' + "'); // temp to support Vue syntax
        code = code.slice(0, ind) + converted + code.slice(end + 1);
    }
    if (weFoundOne) {
        // replace imports
        code = code.replace(/import \{ vug \} from ['"][^'"\n]*vug[^'"\n]*['"]/g, "import { h as ".concat(hFuncAlias, " } from 'vue'"));
    }
    return code;
}
var VueConsolidatePlugin = function () { return ({
    // Implements Vite's `consolidate` interface: https://github.com/vuejs/core/blob/471f66a1f6cd182f3e106184b2e06f7753382996/packages/compiler-sfc/src/compileTemplate.ts#L89  
    render: function (code, data, callback) {
        try {
            callback(undefined, v1Load(code).toVueTemplate());
        }
        catch (e) {
            callback(String(e));
        }
    }
}); };

exports.ViteTransformPlugin = ViteTransformPlugin;
exports.VueConsolidatePlugin = VueConsolidatePlugin;
exports.load = load;
exports.transformVugTemplateStrings = transformVugTemplateStrings;
exports.vug = vug;
