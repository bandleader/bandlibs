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

exports.classComponent = classComponent;
exports["default"] = classComponent;
exports.prop = prop;
exports.propRequired = propRequired;
