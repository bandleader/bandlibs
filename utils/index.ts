export function addEl(where: string|Element, type: string, attrs: any) {
    return new Promise<void>((res,rej) => {
        const el = document.createElement(type)
        Object.assign(el, attrs)
        if (attrs.src && !attrs.onload && (type === 'style' || type === 'script')) {
            el.onload = () => res()
            setTimeout(() => rej('The added element timed out while waiting to load: ' + attrs.src), 10000)
        }
        const where2: Element = typeof where === 'string' ? document.querySelector(where) : where
        where2.appendChild(el)    
    })
}