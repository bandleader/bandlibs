export function addEl<T extends HTMLElement = HTMLElement>(where: string|Element, tagName: string, attrs: Partial<T>|any = {}) {
    // Returns the newly created element, with a 'loaded' property set to a Promise.
    const el = document.createElement(tagName) as unknown as T
    const loaded = new Promise<void>((res, rej) => {
        Object.assign(el, attrs)
        if ('onload' in el) { // I think every element supports onload
            const oldOnload = el.onload
            el.onload = (e: Event) => { try { res() } finally { oldOnload?.call(el, e) } }
            setTimeout(() => rej('The added element timed out while waiting to load: ' + (attrs as any).src), 10000)
        } else { setTimeout(res) } // Resolve next tick
        const where2: Element = typeof where === 'string' ? document.querySelector(where) : where
        where2.appendChild(el)    
    })
    return Object.assign(el, { loaded })
}
