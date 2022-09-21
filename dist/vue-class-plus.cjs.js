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
    var e_1, _a, e_2, _b, e_3, _c;
    if (typeof cl === 'object')
        return cl; // This is a regular Vue component, just return
    if (typeof cl !== 'function')
        throw "VueClassPlus: Expected a class, not " + typeof cl;
    var propsToIgnore = ['prototype', 'length', 'name', 'caller', 'callee'];
    var copyData = function (source, target) {
        var e_4, _a;
        var insPropsOnly = Object.getOwnPropertyNames(source).filter(function (x) { return !propsToIgnore.includes(x); });
        try {
            for (var insPropsOnly_1 = __values(insPropsOnly), insPropsOnly_1_1 = insPropsOnly_1.next(); !insPropsOnly_1_1.done; insPropsOnly_1_1 = insPropsOnly_1.next()) {
                var prop_1 = insPropsOnly_1_1.value;
                target[prop_1] = source[prop_1];
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (insPropsOnly_1_1 && !insPropsOnly_1_1.done && (_a = insPropsOnly_1["return"])) _a.call(insPropsOnly_1);
            }
            finally { if (e_4) throw e_4.error; }
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
            document.head.appendChild(Object.assign(document.createElement("style"), { type: "text/css", innerText: obj[prop] }));
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
    try {
        // Populate methods/computeds/props from the class's prototype
        for (var _d = __values(Object.getOwnPropertyNames(cl.prototype)), _e = _d.next(); !_e.done; _e = _d.next()) {
            var prop_2 = _e.value;
            consumeProp(cl.prototype, prop_2);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_e && !_e.done && (_a = _d["return"])) _a.call(_d);
        }
        finally { if (e_1) throw e_1.error; }
    }
    try {
        // Experimental: check static properties
        for (var _f = __values(Object.getOwnPropertyNames(cl)), _g = _f.next(); !_g.done; _g = _f.next()) {
            var prop_3 = _g.value;
            consumeProp(cl, prop_3);
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_g && !_g.done && (_b = _f["return"])) _b.call(_f);
        }
        finally { if (e_2) throw e_2.error; }
    }
    // Experimental: check instance properties
    var dummyInstance = new cl();
    try {
        for (var _h = __values(Object.getOwnPropertyNames(dummyInstance)), _j = _h.next(); !_j.done; _j = _h.next()) {
            var prop_4 = _j.value;
            consumeProp(dummyInstance, prop_4, true);
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (_j && !_j.done && (_c = _h["return"])) _c.call(_h);
        }
        finally { if (e_3) throw e_3.error; }
    }
    // Done!
    return ret;
}

exports.classComponent = classComponent;
exports["default"] = classComponent;
exports.prop = prop;
exports.propRequired = propRequired;
