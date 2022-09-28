/* TODO
*/

type OurEl = HTMLElement & {len: number, animClass: string, hiddenByGrand?: boolean}

export function initOnElement(el: OurEl) {
    // Hide element immediately
    el.classList.add(el.animClass + '-enter-from', "hidden-by-grand")
    // TODO: Just use the class for this. (Or replace with a data attribute; might be better or at least cleaner. And easy to set with .dataset)
    el.hiddenByGrand = true
}
// TODO: Only do this if 
window.addEventListener('scroll', tick)
setInterval(tick, 150)

function reveal(el: OurEl) {
    el.classList.add(el.animClass + '-enter-active')
    el.classList.remove(el.animClass + '-enter-from')
    el.hiddenByGrand = false
    const after = new Promise(res => {
        el.addEventListener('transitionend', res)
        el.addEventListener('transitioncancel', res)
        setTimeout(res, 2000)
    })
    after.then(() => el.classList.remove(el.animClass + '-enter-active'))
}

let last = 0
function tick() {
    // Check the current viewport for unrevealed elements, and reveal them one at a time, scheduling the next one. 
    // And possibly, elements that have been in viewport and now out, should not be shown.
    const candidates = (Array.from(document.getElementsByClassName("hidden-by-grand")) as OurEl[])
        .filter(x => isWithinViewport(x) && isVisibleCssWise(x))
    if (!candidates.length) return;

    const whenWeCanDoIt = last + candidates[0].len
    if (whenWeCanDoIt > Date.now()) return setTimeout(tick, whenWeCanDoIt - Date.now())
        
    // Ready to reveal a candidate!
    candidates[0].classList.remove("hidden-by-grand")
    reveal(candidates[0])
    last = Date.now()
}

// Helper functions
function isVisibleCssWise(el: HTMLElement, ignoreGrandHidden = true): boolean {
    const styl = getComputedStyle(el)
    return styl.display !== 'none' && styl.visibility !== 'hidden' && (ignoreGrandHidden || !(el as OurEl).hiddenByGrand) && (!el.parentElement || isVisibleCssWise(el.parentElement, false))
}
function isWithinViewport(el: HTMLElement, partial = true) {
    const viewTop = window.scrollY,
        viewBottom = viewTop + window.innerHeight,
        _top = el.getBoundingClientRect().top + window.scrollY,
        _bottom = el.getBoundingClientRect().bottom + window.scrollY,
        compareTop = partial ? _bottom : _top,
        compareBottom = partial ? _top : _bottom;
    return (compareBottom <= viewBottom) && (compareTop >= viewTop)
}

// Vue directive
function onInserted_vue(el: HTMLElement, x: { value: any, modifiers: Record<string, boolean>, arg: string }) {
    const args = (x.arg || '').split(":")
    if (args.length === 1 && parseInt(args[0])) { args[1] = args[0]; args[0] = '' }
    const run = (actualElement: Element) => {
        const typedElement = actualElement as OurEl
        typedElement.animClass = args[0] || 'fade'
        typedElement.len = parseInt(args[1]) || 300
        initOnElement(typedElement)
    }
    if (x.modifiers.children) Array.from(el.children).filter(x => x.getBoundingClientRect().height > 5 && x.getBoundingClientRect().width > 5).forEach(y => run(y))
    else run(el)
}
export const vueDirective: any = {
    inserted: onInserted_vue, // for Vue 2
    mounted: onInserted_vue, // for Vue 3
}
  