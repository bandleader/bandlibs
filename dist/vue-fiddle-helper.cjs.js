

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

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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

function prop(def, moreOpts) {
    if (moreOpts === void 0) { moreOpts = {}; }
    // Typescript-wise it returns a T, so you can use it from elsewhere within the component,
    // whereas at runtime it returns a prop object that VueClassPlus knows to put in the right place.
    // You can specify, `required`, `type`, etc. in moreOpts if you like..
    var o = moreOpts;
    o["default"] = def;
    o._isProp = true; // This causes VueClassPlus to make it into a prop
    return o;
}
function propRequired(moreOpts) {
    if (moreOpts === void 0) { moreOpts = {}; }
    var o = moreOpts;
    o.required = true;
    o._isProp = true;
    return o;
}
function classComponent(cl, opts) {
    if (typeof cl === 'object')
        return cl; // This is a regular Vue component, just return
    if (typeof cl !== 'function')
        throw "VueClassPlus: Expected a class, not " + typeof cl;
    var propsToIgnore = ['prototype', 'length', 'name', 'caller', 'callee'];
    var copyData = function (source, target) {
        var insPropsOnly = Object.getOwnPropertyNames(source).filter(function (x) { return !propsToIgnore.includes(x); });
        for (var _i = 0, insPropsOnly_1 = insPropsOnly; _i < insPropsOnly_1.length; _i++) {
            var prop_1 = insPropsOnly_1[_i];
            target[prop_1] = source[prop_1];
        }
    };
    // Allow `opts` to be specified as a method on the class, or as a static object
    if (!opts && typeof cl.prototype.opts === 'function') {
        opts = cl.prototype.opts();
        propsToIgnore.push("opts");
    }
    if (!opts && typeof cl.opts === 'object') {
        opts = cl.opts;
        propsToIgnore.push("opts");
    }
    // Validate/default for opts
    opts = opts || {};
    if (typeof opts !== 'object')
        throw "VueClassPlus: `opts` must be an options object, not " + typeof opts;
    // Create main object
    var coercePropsArrayToObj = function (x) { return Array.isArray(x) ? x.reduce(function (a, c) { return (a[c] = {}, a); }, {}) : x; };
    var ret = __assign(__assign({}, opts), { name: cl.name, computed: __assign({}, (opts.computed || {})), methods: __assign({}, (opts.methods || {})), props: coercePropsArrayToObj(opts.props || {}), data: function () {
            var newInstance = new cl();
            var data = {};
            copyData(newInstance, data);
            return data;
        } });
    var consumeProp = function (obj, prop, ignoreOthers) {
        if (ignoreOthers === void 0) { ignoreOthers = false; }
        if (propsToIgnore.includes(prop))
            return;
        var getValue = function () { return obj[prop]; }; // it's behind a function so that we don't call getters unnecessarily -- which will throw an error
        var descriptor = Object.getOwnPropertyDescriptor(obj, prop);
        if (['created', 'mounted', 'destroyed', 'template'].includes(prop)) {
            ret[prop] = obj[prop];
        }
        else if (prop === "css") {
            // Just add it right away. No scoping or waiting till the component is created for now. The point is colocation
            document.body.appendChild(Object.assign(document.createElement("style"), { type: "text/css", innerText: obj[prop] }));
        }
        else if (descriptor && descriptor.get) {
            ret.computed[prop] = {
                get: descriptor.get,
                set: descriptor.set
            };
        }
        else if (typeof getValue() === 'function') {
            ret.methods[prop] = getValue();
        }
        else if (getValue() && getValue()._isProp) {
            ret.props[prop] = getValue();
        }
        else if (!ignoreOthers) {
            throw "VueClassPlus: Class prop `".concat(prop, "` must be a method or a getter");
        }
        else { // It's a data prop, from the "check instance properties" section below
            return; // Silently ignore it; it will be used in `data()` only
        }
        // If we were successful, ignore the prop in subsequent checks
        propsToIgnore.push(prop);
    };
    // Populate methods/computeds/props from the class's prototype
    for (var _i = 0, _a = Object.getOwnPropertyNames(cl.prototype); _i < _a.length; _i++) {
        var prop_2 = _a[_i];
        consumeProp(cl.prototype, prop_2);
    }
    // Experimental: check static properties
    for (var _b = 0, _c = Object.getOwnPropertyNames(cl); _b < _c.length; _b++) {
        var prop_3 = _c[_b];
        consumeProp(cl, prop_3);
    }
    // Experimental: check instance properties
    var dummyInstance = new cl();
    for (var _d = 0, _e = Object.getOwnPropertyNames(dummyInstance); _d < _e.length; _d++) {
        var prop_4 = _e[_d];
        consumeProp(dummyInstance, prop_4, true);
    }
    // Done!
    return ret;
}

var VCP = /*#__PURE__*/Object.freeze({
  __proto__: null,
  prop: prop,
  propRequired: propRequired,
  'default': classComponent,
  classComponent: classComponent
});

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
    else if (key === "display" && value === "b")
        return { display: "block" };
    else if (key === "display" && value === "i")
        return { display: "inline" };
    else if (key === "display" && value === "ib")
        return { display: "inline-block" };
    else if (key === "display" && value === "f")
        return { display: "flex" };
    else if (key === "display" && value === "if")
        return { display: "inline-flex" };
    // Commented out because this will require a further transform later to unify all the 'transform-___' attrs. Note also that some can be exprs and some not
    // const transformFuncs = "matrix|matrix3d|perspective|rotate|rotate3d|rotateX|rotateY|rotateZ|scale|scale3d|scaleX|scaleY|scaleZ|skew|skewX|skewY|translate|translate3d|translateX|translateY|translateZ|transform3d|matrix|matrix3d|perspective|rotate|rotate3d|rotateX|rotateY|rotateZ|scale|scale3d|scaleX|scaleY|scaleZ|skew|skewX|skewY|translate|translate3d|translateX|translateY|translateZ".split("|")
    // if (transformFuncs.includes(key)) return { ['transform-' + key]: value }
    return _a = {}, _a[key] = value, _a;
}
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
    else if (tag === "f") {
        tag = "div";
        words.push("display=flex");
    } // experimental
    var attrs = [];
    for (var _e = 0, words_1 = words; _e < words_1.length; _e++) {
        var x = words_1[_e];
        var _f = splitTwo(x, "="), _key = _f[0], _value = _f[1];
        var isExpr = false, isLiteral = false, kind = "attr";
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
            attrs.push({ key: key, value: value || undefined, isLiteral: isLiteral, isExpr: isExpr, kind: kind });
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
    return { ast: nodes, toVueTemplate: toVueTemplate };
}
function partition(arr, fn) {
    var ret = [[], []];
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
function ViteTransformPlugin() {
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
            var output = load(vugCode).toVueTemplate();
            return code.substring(0, startOfTemplateTag) + "<template>" + output + code.substring(endOfCode); // We have to replace the template tag so the SFC compiler doesn't error because it doesn't know how to process Vue
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

var Vug = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load,
  ViteTransformPlugin: ViteTransformPlugin,
  VueConsolidatePlugin: VueConsolidatePlugin
});

function initApp(Vue) {
    var _a, _b, _c, _d;
    if (Vue === void 0) { Vue = window.Vue; }
    var w = window;
    var mainInstance = {
        data: function () { return ({
            hash: window.location.hash
        }); },
        created: function () {
            var _this = this;
            window.addEventListener('hashchange', function () {
                _this.hash = window.location.hash === '#home' ? '' : window.location.hash; // special handling because navigating to # breaks the JSitor IDE; it brings your app preview to the top of the screen
                window.scrollTo(0, 0);
            });
        },
        template: "<main-app />"
    };
    var div = document.createElement("div");
    document.body.appendChild(div);
    w.app = Vue.createApp(mainInstance);
    // Support vue-class-plus
    var hook = function (obj, prop, fn) { var old = obj[prop].bind(obj); obj[prop] = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return fn.apply(obj, [old]).apply(obj, args);
    }; };
    hook(w.app, 'component', function (old) { return function (name, value) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        return old.apply(void 0, __spreadArray([name, classComponent(value)], args, false));
    }; });
    // Support vug
    hook(w.app, 'component', function (old) { return function (name, value) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        if (value.vug) {
            value.template = load(value.vug).toVueTemplate();
            delete value.vug;
        }
        old.apply(void 0, __spreadArray([name, value], args, false));
    }; });
    // Include some components
    w.app.component("async-value", (_a = /** @class */ (function () {
            function class_1() {
                this.promise = propRequired();
                this.resolved = false;
                this.value = null;
                this.error = null;
            }
            class_1.prototype.created = function () {
                var _this = this;
                this.promise.then(function (x) { _this.value = x; _this.resolved = true; }, function (err) { return _this.error = err; });
            };
            return class_1;
        }()),
        // TODO should make this use the included spinner (or rather include it here, so this doesn't need Bootstrap)
        _a.template = "<slot v-if=\"resolved\" v-bind=\"{value}\" /><span v-else-if=\"error\" class=\"text-danger\"><i class=\"fa fa-exclamation-triangle\" /> {{String(error)}}</span><span v-else class=\"text-primary spinner-border spinner-border-sm\" role=\"status\"></span>",
        _a));
    w.app.component("promise-button", (_b = /** @class */ (function () {
            function class_2() {
                this.action = propRequired();
                this.pending = false;
                this.success = false;
                this.error = null;
            }
            class_2.prototype.errorClicked = function () {
                alert(this.error);
            };
            class_2.prototype.go = function (ev) {
                var _this = this;
                this.pending = true;
                this.error = null;
                this.success = false;
                this.action(ev).then(function (x) {
                    _this.pending = false;
                    _this.success = true;
                    setTimeout(function () { return _this.success = false; }, 2000);
                }, function (e) { _this.pending = false; _this.error = e; });
            };
            return class_2;
        }()),
        _b.template = "<button @click=\"go\" :disabled=\"pending\"><slot /><transition name=\"fade\"><span v-if=\"pending||error||success\"><div v-if=\"pending\" class=\"spinner-border spinner-border-sm ms-2\" style=\"font-size: 0.7em\" role=\"status\" /><span v-else-if=\"error\" :title=\"String(error)\" @click.stop=\"errorClicked\">\u26A0</span><span v-else-if=\"success\">\u2705</span></span></transition></button>",
        _b));
    w.app.component("use-styles", (_c = /** @class */ (function () {
            function class_3() {
                this.bootswatch = prop("lumen");
                this.bootstrap = prop("5.1.3");
                this.fontawesome = prop("6.0.0-beta3");
                this.ready = false;
            }
            class_3.prototype.created = function () {
                return __awaiter(this, void 0, void 0, function () {
                    var addEl, waitingFor, href, href;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                addEl = function (type, attrs) { return new Promise(function (res) { return document.head.appendChild(Object.assign(document.createElement(type), attrs, { onload: res })); }); };
                                waitingFor = [];
                                if (this.bootstrap) {
                                    href = this.bootstrap.startsWith("http") ? this.bootstrap
                                        : this.bootswatch ? "https://cdnjs.cloudflare.com/ajax/libs/bootswatch/".concat(this.bootstrap, "/").concat(this.bootswatch, "/bootstrap.min.css")
                                            : "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/".concat(this.bootstrap, "/js/bootstrap.min.js");
                                    waitingFor.push(addEl("link", { rel: "stylesheet", href: href }));
                                }
                                if (this.fontawesome) {
                                    href = this.fontawesome.startsWith("http") ? this.fontawesome
                                        : "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/".concat(this.fontawesome, "/css/all.min.css");
                                    waitingFor.push(addEl("link", { rel: "stylesheet", href: href }));
                                }
                                return [4 /*yield*/, Promise.all(waitingFor)];
                            case 1:
                                _a.sent();
                                this.ready = true;
                                return [2 /*return*/];
                        }
                    });
                });
            };
            return class_3;
        }()),
        _c.template = "<slot v-if=ready /><div v-else style=\"text-align: center; padding: 2em\"><span class=\"super-simple-spinner\" /></div>",
        _c.css = "\n.super-simple-spinner {\n    display: inline-block;\n    width: 50px;\n    height: 50px;\n    border: 3px solid rgba(127,127,127,.5);\n    border-radius: 50%;\n    border-top-color: #fff;\n    animation: super-simple-spinner-spin 1s ease-in-out infinite;\n    -webkit-animation: super-simple-spinner-spin 1s ease-in-out infinite;\n}\n@keyframes super-simple-spinner-spin {\n    to { -webkit-transform: rotate(360deg); }\n}\n@-webkit-keyframes super-simple-spinner-spin {\n    to { -webkit-transform: rotate(360deg); }\n}\n\n.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }\n.fade-enter-from, .fade-leave-to { opacity: 0; }\n        ",
        _c));
    w.app.component("nav-bar", (_d = /** @class */ (function () {
            function class_4() {
                this.links = prop({}); // {href, title}
                this.heading = prop("Vue Fiddle");
                this.collapse = true;
                this.css = ".includedNavBar .nav-link.active { background: rgba(0, 0, 40, 0.2); border-radius: 0.3em; }";
            }
            return class_4;
        }()),
        _d.template = "\n<nav class=\"includedNavBar navbar navbar-expand-lg navbar-dark bg-primary\">\n    <div class=\"container-fluid\">\n    <a class=\"navbar-brand\" href=\"#\">{{heading}}</a>\n    <button class=\"navbar-toggler\" type=\"button\" data-bs-toggle=\"collapse\" data-bs-target=\"#navbarColor01\" aria-controls=\"navbarColor01\" aria-expanded=\"false\" aria-label=\"Toggle navigation\" @click=\"collapse=!collapse\">\n        <span class=\"navbar-toggler-icon\"></span>\n    </button>\n        <div class=\"navbar-collapse\" :class=\"{collapse}\">\n        <ul class=\"navbar-nav me-auto\">\n        <li class=\"nav-item\" v-for=\"(href,title) in links\">\n            <a class=\"nav-link\" :href=\"href\">{{title}}</a>\n        </li>\n        </ul>\n        <slot />\n    </div>\n    </div>\n</nav>\n        ",
        _d));
    setTimeout(function () { return w.app.mount(div); }); // Mount on next tick so all the components are ready
}

// Expose the included libraries globally
Object.assign(window, { VCP: VCP, Vug: Vug });
initApp(Vue);
