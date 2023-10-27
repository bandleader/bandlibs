/*

class El {
  children: El[] = []
  constructor(public tagName: string, public attrs: Record<string,any> = {}, ...children: (El|string)[]) {
    this.attrs = this.attrs ?? {}
    for (const c of children) c && this.children.push(typeof c === 'string' || typeof c === 'number' ? new El("TEXT", { textContent: String(c) }) : c) // TODO dynamic
    // Run the effects. For now only once
    for (const k in this.attrs) if (typeof this.attrs[k] === 'function' && !k.startsWith('on')) this.attrs[k] = this.attrs[k]()
  }
  toHtml() {
    if (this.tagName === "TEXT") return this.attrs.textContent || this.attrs.innerHTML || this.attrs.innerText || ""
    const childrenHtml = this.attrs.innerHTML || this.attrs.innerText || this.attrs.textContent || this.children.map(x => x.toHtml()).join("") // TODO html-encode
    return ['<', this.tagName, attrsToHtml(this.attrs), childrenHtml ? `>${childrenHtml}</${this.tagName}>` : '/>'].join('')
  }
}

const toHtml = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function attrsToHtml(attrs: Record<string,any>) {
  // includes space before
  const camelToKebabCase = str => str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
  const out = { ...attrs }
  for (const k in out) {
    if (k[0] === '$') { out.style = `${camelToKebabCase(k.slice(1))}: ${out[k]}` + (out.style ? `; ${out.style}` : ''); delete out[k] }
    else if (k[0] === '_') { out.class = (out.class ? `${out.class} ` : '') + k.slice(1); delete out[k] }
    else if (k === "innerText" || k === 'innerHTML' || k === 'textContent') delete out[k] // These are handled separately
    // else if (k.startsWith("on")) throw "Can't use events in SSR mode: " + k
  }
  return Object.keys(out).length ? ' ' + Object.keys(out).map(k => `${k}=${JSON.stringify(out[k])}`).join(" ") : ""
}

*/