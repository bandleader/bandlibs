'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function isVisibleCssWise(el, ignoreOpacity) {
    if (ignoreOpacity === void 0) { ignoreOpacity = true; }
    var styl = getComputedStyle(el);
    return styl.display !== 'none' && styl.visibility !== 'hidden' && (ignoreOpacity || styl.opacity !== '0') && (!el.parentElement || isVisibleCssWise(el.parentElement, false));
}
function isVisible(el, partial) {
    if (partial === void 0) { partial = true; }
    if (!isVisibleCssWise(el))
        return false;
    var viewTop = window.scrollY, viewBottom = viewTop + window.innerHeight, _top = el.getBoundingClientRect().top + window.scrollY, _bottom = el.getBoundingClientRect().bottom + window.scrollY, compareTop = partial ? _bottom : _top, compareBottom = partial ? _top : _bottom;
    return (compareBottom <= viewBottom) && (compareTop >= viewTop);
}
function reveal(els, effect, speed, staggerChildren, delay) {
    if (speed === void 0) { speed = 500; }
    if (staggerChildren === void 0) { staggerChildren = 500; }
    if (delay === void 0) { delay = 0; }
    effect = effect || { opacity: 0 };
    if (effect.debug)
        console.log("Reveal debug:", { effect: effect, speed: speed, staggerChildren: staggerChildren, delay: delay });
    var hide = function (el) { return Object.assign(el.style, effect); };
    var reveal = function (el) { var oldTransition = el.style.transition; el.style.transition = "all ".concat(speed, "ms"); Object.keys(effect).forEach(function (k) { return el.style[k] = ''; }); setTimeout(function () { return el.style.transition = oldTransition; }, 1000); };
    var revealAll = function () { return els.forEach(function (x, i) { return setTimeout(function () { return reveal(x); }, i * staggerChildren); }); };
    var done = false;
    var test = function () { return isVisible(els[0]); };
    var check = function () { if (done || !test())
        return; done = true; setTimeout(revealAll, delay); };
    els.forEach(hide);
    var constantCheck = function () { check(); if (!done) {
        setTimeout(constantCheck, 150);
    } };
    setTimeout(constantCheck, 5);
    window.addEventListener('scroll', check);
}
var vueDirectiveMounted = function mounted(el, _a) {
    var value = _a.value, modifiers = _a.modifiers;
    // Explanation of 'children' modifier ('stagger' is no longer necessary):
    // v-reveal.children:     animates children staggered by 500ms
    // v-reveal.children-100: animates children staggered by 100ms
    // v-reveal.children-0:   animates them simultaneously
    if (value === null || value === void 0 ? void 0 : value.debug)
        console.log("v-reveal debug:", el, value, modifiers);
    if (isVisible(el) && modifiers.noimm)
        return;
    var getKeyArg = function (prefix) {
        var findKey = Object.keys(modifiers).find(function (x) { return x.startsWith(prefix + "-"); });
        if (!findKey)
            return null;
        return findKey.slice(prefix.length + 1);
    };
    var wantsToRunOnChildren = modifiers.children || !!getKeyArg('children');
    var els = wantsToRunOnChildren ? Array.from(el.children) : [el];
    var parseSpeed = function (str) { var ms = parseFloat(str); return ms < 20 ? ms * 1000 : ms; };
    var delay = getKeyArg('delay') ? parseSpeed(getKeyArg('delay')) : undefined;
    var speed = getKeyArg('speed') ? parseSpeed(getKeyArg('speed')) : undefined;
    var staggerArgForChildren = getKeyArg('stagger') || getKeyArg('children'); // accept 'stagger' argument for compatibility reasons, but now we allow you to put it on the 'children' modifier
    var staggerAmountForChildren = staggerArgForChildren ? parseSpeed(staggerArgForChildren) : undefined;
    reveal(els, value, speed, staggerAmountForChildren, delay);
};
var vueDirective = {
    inserted: vueDirectiveMounted,
    mounted: vueDirectiveMounted
};

exports["default"] = reveal;
exports.isVisible = isVisible;
exports.reveal = reveal;
exports.vueDirective = vueDirective;
