function isVisibleCssWise(el: HTMLElement, ignoreOpacity = true): boolean {
  const styl = getComputedStyle(el)
  return styl.display !== 'none' && styl.visibility !== 'hidden' && (ignoreOpacity || styl.opacity !== '0') && (!el.parentElement || isVisibleCssWise(el.parentElement, false))
}
export function isVisible(el: HTMLElement, partial = true) {
  if (!isVisibleCssWise(el)) return false
  const viewTop = window.scrollY,
      viewBottom = viewTop + window.innerHeight,
      _top = el.getBoundingClientRect().top + window.scrollY,
      _bottom = el.getBoundingClientRect().bottom + window.scrollY,
      compareTop = partial ? _bottom : _top,
      compareBottom = partial ? _top : _bottom;
  return (compareBottom <= viewBottom) && (compareTop >= viewTop)
}
  
  export default function reveal(els: HTMLElement[], effect?: object, speed = 500, staggerChildren = 500, delay = 0) {
    effect = effect || { opacity: 0 }
    const hide = (el: HTMLElement) => Object.assign(el.style, effect)
    const reveal = (el: HTMLElement) => { const oldTransition = el.style.transition; el.style.transition = `all ${speed}ms`; Object.keys(effect).forEach(k => el.style[k] = ''); setTimeout(() => el.style.transition = oldTransition, 1000) }
    const revealAll = () => els.forEach((x,i) => setTimeout(() => reveal(x), i * staggerChildren))
    let done = false
    const test = () => isVisible(els[0])
    const check = () => { if (done || !test()) return; done = true; setTimeout(revealAll, delay) }
    els.forEach(hide)
    const constantCheck = () => { check(); if (!done) { setTimeout(constantCheck, 150) }}
    setTimeout(constantCheck, 5)
    window.addEventListener('scroll', check)
  }
  
  const vueDirectiveMounted = function mounted(el: HTMLElement, {value, modifiers}: {value: any, modifiers: any}) { 
    if (isVisible(el) && modifiers.noimm) return;
    const els = modifiers.children ? (Array.from(el.children) as HTMLElement[]) : [el]
    const getKeyArg = (prefix: string) => {
      const findKey = Object.keys(modifiers).find(x => x.startsWith(prefix + "-"))
      if (!findKey) return null
      return findKey.slice(prefix.length + 1)
    }
    const parseSpeed = (str: string) => { let ms = parseFloat(str); return ms < 20 ? ms * 1000 : ms }
    const staggerChildren = getKeyArg('stagger') ? parseSpeed(getKeyArg('stagger')) : undefined
    const delay = getKeyArg('delay') ? parseSpeed(getKeyArg('delay')!) : undefined
    const speed = getKeyArg('speed') ? parseSpeed(getKeyArg('speed')!) : undefined
    reveal(els, value, speed, staggerChildren, delay)
  } 
  export const vueDirective = {
    inserted: vueDirectiveMounted, // for Vue 2
    mounted: vueDirectiveMounted, // for Vue 3
  }
  