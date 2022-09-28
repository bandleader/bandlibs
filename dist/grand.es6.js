/* TODO
*/
function initOnElement(el) {
    // Hide element immediately
    el.classList.add(el.animClass + '-enter-from', "hidden-by-grand");
    // TODO: Just use the class for this. (Or replace with a data attribute; might be better or at least cleaner. And easy to set with .dataset)
    el.hiddenByGrand = true;
}
// TODO: Only do this if 
window.addEventListener('scroll', tick);
setInterval(tick, 150);
function reveal(el) {
    el.classList.add(el.animClass + '-enter-active');
    el.classList.remove(el.animClass + '-enter-from');
    el.hiddenByGrand = false;
    var after = new Promise(function (res) {
        el.addEventListener('transitionend', res);
        el.addEventListener('transitioncancel', res);
        setTimeout(res, 2000);
    });
    after.then(function () { return el.classList.remove(el.animClass + '-enter-active'); });
}
var last = 0;
function tick() {
    // Check the current viewport for unrevealed elements, and reveal them one at a time, scheduling the next one. 
    // And possibly, elements that have been in viewport and now out, should not be shown.
    var candidates = Array.from(document.getElementsByClassName("hidden-by-grand"))
        .filter(function (x) { return isWithinViewport(x) && isVisibleCssWise(x); });
    if (!candidates.length)
        return;
    var whenWeCanDoIt = last + candidates[0].len;
    if (whenWeCanDoIt > Date.now())
        return setTimeout(tick, whenWeCanDoIt - Date.now());
    // Ready to reveal a candidate!
    candidates[0].classList.remove("hidden-by-grand");
    reveal(candidates[0]);
    last = Date.now();
}
// Helper functions
function isVisibleCssWise(el, ignoreGrandHidden) {
    if (ignoreGrandHidden === void 0) { ignoreGrandHidden = true; }
    var styl = getComputedStyle(el);
    return styl.display !== 'none' && styl.visibility !== 'hidden' && (ignoreGrandHidden || !el.hiddenByGrand) && (!el.parentElement || isVisibleCssWise(el.parentElement, false));
}
function isWithinViewport(el, partial) {
    if (partial === void 0) { partial = true; }
    var viewTop = window.scrollY, viewBottom = viewTop + window.innerHeight, _top = el.getBoundingClientRect().top + window.scrollY, _bottom = el.getBoundingClientRect().bottom + window.scrollY, compareTop = partial ? _bottom : _top, compareBottom = partial ? _top : _bottom;
    return (compareBottom <= viewBottom) && (compareTop >= viewTop);
}
// Vue directive
function onInserted_vue(el, x) {
    var args = (x.arg || '').split(":");
    if (args.length === 1 && parseInt(args[0])) {
        args[1] = args[0];
        args[0] = '';
    }
    var run = function (actualElement) {
        var typedElement = actualElement;
        typedElement.animClass = args[0] || 'fade';
        typedElement.len = parseInt(args[1]) || 300;
        initOnElement(typedElement);
    };
    if (x.modifiers.children)
        Array.from(el.children).filter(function (x) { return x.getBoundingClientRect().height > 5 && x.getBoundingClientRect().width > 5; }).forEach(function (y) { return run(y); });
    else
        run(el);
}
var vueDirective = {
    inserted: onInserted_vue,
    mounted: onInserted_vue
};

export { initOnElement, vueDirective };
