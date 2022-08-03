export function addEl<T extends HTMLElement = HTMLElement>(where: string|Element, tagName: string, attrs: Partial<T>|any = {}) {
    // Returns newly created element, plus a method 'loadPromise' that returns a Promise for the onLoad event.
    // Not doing the promise automatically, because most elements never fire onLoad, and that will cause an [unhandled] rejected Promise.
    const el = document.createElement(tagName) as unknown as T
    const where2: Element = typeof where === 'string' ? document.querySelector(where) : where
    where2.appendChild(el)    
    return Object.assign(el, { loadPromise: () => waitForLoad(el) })
}

export function waitForLoad(el: HTMLElement) {
    return new Promise<void>((res, rej) => {
        const oldOnload = el.onload
        el.onload = (e: Event) => { try { res() } finally { oldOnload?.call(el, e) } }
        setTimeout(() => rej('The added element timed out while waiting to load: ' + (el as any).src), 10000)
    }) 
}

export function partition<T>(arr: T[], fn: (i: T) => boolean | number) {
    // Usage: const [trueOnes, falseOnes] = partition(arr, x => trueOrFalse)
    // Or:    const [one, two, three] = partition(arr, x => num)
    const ret: T[][] = [[], []]
    for (const i of arr) {
      const k = fn(i)
      const ind = typeof k === 'number' ? k : !!k ? 0 : 1
      while (ret.length < (ind + 1)) ret.push([])
      ret[ind].push(i)
    }
    return ret
}