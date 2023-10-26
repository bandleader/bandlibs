/*
- [x] JSX support
- [x] For/If
- [x] Components that can be written for any app
- [x] Support for multiple components
  - [ ] How to give them access to App (if they're outside of where the app was created), which is `React` but which is scoped to app creator? Can store it globally but what about when we add stuff later?
- [ ] Server/Blazor apps:
  - [ ] SSR support (renderToString and remove commands).
  - [ ] Emit element IDs only if there are effects
  - [ ] Server app manager that prunes copies that are not in touch
  - [ ] And emit client stub
- [ ] Vug
- [x] CSS via stylesheet (ad-hoc CSS)
- [x] Fragments
- [x] Actual text nodes. Or at least if single child string, don't wrap in span, do innerText
- [ ] Transitions (for now can do in the For component)
- [ ] Teleport?
- [ ] Shorthands etc
  - [ ] Multiple classes
  - [ ] Custom tag types for flex, ib, etc.? Or just use "display" overloading, or the flex shorthand property in SP
- "Alpine" -- client-side stuff for Blazor mode:
  - [x] Run arbitrary JS when component (your element) is initialized. Return an object. Or make it a class?
    - [x] Shortcut for adding CSS to head ('style' element?)
    - [ ] Do a 'script' element as an easier way to do it
  - [x] Bind client-side events -- it should 'with' the object
  - [x] But how should it know which object? Nearest component? But there might be slots etc.
        Vug can do this because it knows about components, but otherwise...
        OK, alpine doesn't have components at all. So it's OK
  - [x] Run arbitrary JS when element is inserted (removed?): c@click, c@inserted, c@removed
*/

import * as SP from "./style-processing";

const randId = () => Math.random().toString(36).slice(2)
const comparer = (fn: (x: Cmd) => string|number) => (a: Cmd, b: Cmd) => { const x = fn(a), y = fn(b); return x === y ? 0 : x < y ? -1 : 1 }
const seqIder = () => { let id = 0; return () => String(id++) }


function set(el: HTMLElement, key: string, value: any) {
  // Pure frontend side
  if (key.startsWith("$$")) alpine(el, key.slice(2), value)
  else if (key[0] === '$' && key.endsWith("$")) sheetStyle(el, key.slice(1,-1), value)
  else if (key === 'css') adhocCss(el, value)
  else if (key[0] === '$') el.style[key.slice(1)] = value // supports both camelCase and kebab-case
  else if (key[0] === '_') el.classList.toggle(key.slice(1).replace(/_/g, '-'), !!value)
  else if (key.startsWith("on")) el.addEventListener(key.slice(2), value)
  else el[key] = value
}

function sheetStyle(el: HTMLElement, propAndModifiers: string, value: string) {
  /* Lets you do:
  $bg$="green"
  $bg:hover$="red"
  Uses adhocCss under the hood
  */
  const [prop, ...modifiers] =  propAndModifiers.split(":")
  adhocCss(el, `${prop}: ${value}`, modifiers.length ? `:${modifiers.join(':')}` : "")
}

function adhocCss(el: HTMLElement, css: string, suffix = "") {
  /* Supports: 
        css="body { color: blue }" (global)
        css="& { color: blue }" (anonymous selector)
        css="color: blue" (shorthand for above)
        css="color: blue; margin: 1em" (multiple is OK of course)
        css="&:hover { color: blue }" (of course modify the & as you wish)
        css:hover="color: red" (adds to the &. Supports active & focus too)
        css:hover="color: red" (adds to the &. Supports active & focus too)
        css:color="red" (cleaner)
        css:color_hover="red" (combination)
        css:color="red | green" (set regular/hover at once)
        css:color="red | green | blue" (set regular/hover/focus at once)
  - TODO can use a single stylesheet and just append to it? Or is that slower?
  - TODO more modifiers like from Vug and Tailwind
  - TODO remove when the element gets removed?
  */
  if (!css.includes('{')) css = `& { ${css} }` // allow shorthand of just the attributes, using the default selector
  if (css.includes('&')) { // TODO this should go by absolute note, not element inserted. i.e. if a component is inserted X times... but we can't do that without Vug
    const symb = "_a"
    let id = el.getAttribute(symb)
    if (!id) { id = adhocCss.ider(); el.setAttribute(symb, id) }
        
    css = css.replace(/&/g, `[${symb}="${id}"]${suffix}`)
  }
  if (adhocCss.cssAdded.includes(css)) return;
  adhocCss.cssAdded.push(css)
  document.head.appendChild(Object.assign(document.createElement('style'), { type: 'text/css', textContent: css })) // innerText was putting <br>s for linebreaks
}
adhocCss.cssAdded = [] as string[]
adhocCss.ider = seqIder()


class EffectsSystem {
  effects = new Map<HTMLElement, Function[]>()
  rerun() {
    console.log("RERUNNING", Array.from(this.effects.values()).length)
    for (const [el, fns] of this.effects) {
      if (!el.isConnected) this.effects.delete(el)
      else for (const fn of fns) {
        try {
          fn()
        } catch (err) {
          console.error("Error in effect:", err)
          throw err // Perhaps run other effects first, and then throw one at the end? Nah
        }
      }
    }
  }
  effect(el: HTMLElement, fn: Function) {
    if (!this.effects.has(el)) this.effects.set(el, [])
    this.effects.get(el)!.push(fn)
    fn() // TODO error handle. Actually: schedule a rerun if there isn't one
  }
}


function alpine(el: HTMLElement, key: string, value: string) {
  // Client-side alpine stuff
  const run = (code: string, scope: any = {}) => Function(...Object.keys(scope), code)(...Object.values(scope))
  const runEx = (code: string, scope: any = {}) => { if (!code.includes('return')) code = `return (\n${code}\n)`; if (scope.wif) { console.log("WIF:", scope.wif); code = `with (wif) {\n${code}\n} ` }; return run(code, scope) }
  const nearestScope = (): any => { // Find nearest parent with a scope
    let ret = el.nofClientSideScope, __el = el
    while (ret === undefined && __el.parentElement) { 
      __el = __el.parentElement
      ret = __el.nofClientSideScope
    }
    return ret || {}
  }
  if (key === "") { // just plain prefix
    const scope: any = runEx(value, { $el: el })
    el.nofClientSideScope = scope || undefined
    console.log("SCOPE", scope, el)
  } else if (key.startsWith("on")) {
    setTimeout(() => {
      console.log(key,"!!",value, nearestScope())
      if (key === "oninsert") runEx(value, { $el: el, wif: nearestScope() })
      else el.addEventListener(key.slice(2), (e: any) => (runEx(value, { $event: e, $el: el, wif: nearestScope() }), alpine.fx.rerun()))
    })
  } else if (key.startsWith(":")) {
    setTimeout(() => alpine.fx.effect(el, () => set(el, key.slice(1), runEx(value, { $el: el, wif: nearestScope() }))))
  } else {
    throw `Invalid alpine key: '${key}'`
  }
}
alpine.fx = new EffectsSystem()

abstract class App {
  static sp = Object.assign(new SP.StyleProcessor(), { styleEmitPrefix: "$" })
  fx = new EffectsSystem()
  abstract h(tag: any, attrs: any, ...children: any[]): any
  createElement(tag: any, attrs: any = {}, ...children: any[]) { 
    children = children.map(x => this.transformChild(x))
    attrs = App.sp.wholeObject(attrs)
    return typeof tag === 'string' ? this.h(tag, attrs, ...children) :
      tag({...attrs, children })
  }
  private transformChild(x: any) { 
    return typeof x === 'string' ? this.h('text', { textContent: x }) : 
      Array.isArray(x) ? this.h('div', { $display: "contents" }, ...x.map(y => this.transformChild(y))) :
      x 
  }
  // To support React interface
  Fragment = (attrs: any) => this.createElement('fragment', {}, ...attrs.children)
  for<T>(lister: () => T[], elementor: (i: T) => any, keyer: (item: T, ind: number) => string|number = (_,i)=>i, tag = "fragment") {
    // TODO also re-order
    const el = this.createElement(tag)
    let existing = new Map<string, any>()
    this.fx.effect(el, () => {
      const items = lister(), toDelete = new Set(existing.keys())
      items.forEach((x, i) => {
        const key = String(keyer(x, i))
        toDelete.delete(key)
        if (!existing.has(key)) {
          const child = elementor(x)
          existing.set(key, child)
          el.appendChild(child)
        }
      })
      for (const key of toDelete) {
        const el = existing.get(key)
        el.remove()
        existing.delete(key)
      }
    })
    return el
  }
  if(cond: () => boolean, yes: () => any, no?: () => any) { return this.for(() => cond() ? [1] : no ? [0] : [], x => x ? yes() : no!(), x => String(x)) }
}

const docEl = (tag: string): Node => 
  tag === "text" ? document.createTextNode("") :
  tag === "fragment" ? createFragment() :
  document.createElement(tag)

function createFragment() {
  const el = document.createComment("fragment")
  // const el = document.createElement("div") // document.createComment("fragment")
  // el.style.display = "none" // Just a placeholder. Could use a comment node, but we can't assign an ID to it so can't find it. Later we can make a map of IDs
  // el.innerText = "fragment"
  const oldRemoveUs = el.remove.bind(el)
  const children: Element[] = []
  const el2 = Object.assign(el, {
    appendChild(x: any) { children.push(x); setTimeout(() => el.before(x)); return x },
    remove() { for (const x of children) x.remove(); oldRemoveUs() }
  })
  return el2
}

class SpaApp extends App {
  h(tag: any, attrs: any, ...children: any[]) {
    const el = docEl(tag)
    for (const key in attrs) this.clientSetEx(el, key, attrs[key])
    for (const child of children) el.appendChild(child)
    return el
  }
  clientSetEx(el: HTMLElement, key: string, value: any) {
    // Version that supports reactive values (effects)
    if (typeof value !== 'function') return set(el, key, value)
    if (key.startsWith("on")) return set(el, key, (e: any) => ((value as Function)(e), this.fx.rerun()))
    this.fx.effect(el, () => set(el, key, value()))
  }
}

class Cmd {
  constructor(public id: string, public key: string, public value: any) {}
}
class ServerElement {
  id = randId()
  isConnected = true
  constructor(public app: ServerApp, public tag: string) { this.id = app.nextId() }
  set(key: string, value: any) { this.app.cmds.push(new Cmd(this.id, key, value)) }
  remove() { this.app.cmds.push(new Cmd(this.id, "!REMOVE", null))}
  appendChild(child: ServerElement) {
    if (!(child instanceof ServerElement)) throw console.error("Only ServerElement can be appended", child)    
    
    const appender = new Cmd(this.id, "!APPENDCHILD", `${child.tag}|${child.id}`)
    // Insert it before the first command that has ID of this element
    const index = this.app.cmds.findIndex(x => x.id === child.id)
    if (index === -1) this.app.cmds.push(appender)
    else this.app.cmds.splice(index, 0, appender)
    // Better would be to insert it here:
    //      this.set("!APPENDCHILD", `${child.tag}|${child.id}`)
    // ...and then re-order the child stuff to be after us, but that won't work for grandchild stuff. Can do it recursively...
    // Naive approach:
    //      this.app.cmds.sort(comparer(x => x.id === child.id ? 1000 : 1)) 
    // Or:
    //      const others = this.app.cmds.filter(x => x.id === child.id)
    //      for (const cmd of others) { this.app.cmds.splice(this.app.cmds.indexOf(cmd), 1); this.app.cmds.push(cmd) }
  }
}
class ServerApp extends App {
  cmds: Cmd[] = []
  h(tag: any, attrs: any, ...children: any[]) {
    const el = new ServerElement(this, tag)
    for (const child of children) el.appendChild(child)
    for (const key in attrs) this.serverSetEx(el, key, attrs[key])
    return el
  }
  serverSetEx(el: ServerElement, key: string, value: any) { 
    if (typeof value !== 'function') return el.set(key, value)
    if (key.startsWith("on")) return el.set(key, (e: any) => ((value as Function)(e), this.fx.rerun())) // TODO won't actually work across network
    this.fx.effect(el, () => el.set(key, value()))
  }
  private _lastId = 0
  nextId() { return String(++this._lastId) }
}

class ServerClient {
  els = new Map<string, Node>() // TODO prune if element is removed. Or can weakmap help? But need an object key
  setUp(el: ServerElement) {
    const main = document.createElement(el.tag)
    this.els.set(el.id, main)
    document.body.appendChild(main)
  }
  doCmd(cmd: Cmd) {
    const el = this.els.get(cmd.id)
    if (!el) throw console.error("Element not found", cmd)
    if (cmd.key === "!REMOVE") {
      el.remove()
    } else if (cmd.key === "!APPENDCHILD") {
      const [tag, id] = String(cmd.value).split('|')
      const child = docEl(tag)
      this.els.set(id, child)
      el.appendChild(child)
    } else set(el, cmd.key, cmd.value)
  }
}

function testSpaApp() {
  const app = true ? new ServerApp : new SpaApp, React = app
  const todoApp = () => {
    const todos = [
      { text: "Buy milk", done: false },
      { text: "Buy eggs", done: true },
      { text: "Buy bread", done: false },
    ]
    const Todo = ({todo}: { todo: typeof todos[0]}) => 
      <li $opacity={() => todo.done ? 0.5 : 1}>
        <input type="checkbox" _me_1 checked={() => todo.done} onclick={() => todo.done = !todo.done} />
        <span innerText={todo.text} $textDecoration={() => todo.done ? "line-through" : "none"} />
      </li>
    return  <main>
              <h1>Todo list</h1>
              <ul>
                {app.for(() => todos, todo => <Todo todo={todo} />)}
              </ul>
              {/* demo of 'alpine' feature */}
              <div $$="{shown: false}" $padding="0.5em">
                <h4 $$onclick="shown=!shown">Click for detail</h4>
                <p $$:$display="shown ? '' : 'none'">This is detail</p>
              </div>
              <input $$="$el.focus()" value="Should be focused"></input>
              <h3 _mt-4>Fragment test: make sure the following divs are parallel to me</h3>
              <>
                <div>1</div>
                <div>2</div>
                <div>3</div>
              </>
              <h3>CSS Test</h3>
              <div bg="purple" c="white">Shorthand Inline</div>
              <div css="background: blue; color: white">Ad-hoc CSS shorthand</div>
              <div css="& { background: purple; color: white } &:hover { background: green }">Ad-hoc CSS long form with hover</div>
              <div bg$="blue" c$="white" bg:hover$="green">Sheet styles</div>
              <div bg="purple | green" c="white">Combined form</div>
              <h3 _mt-4>If Test</h3>
              {React.if(() => ifTest, () => <div>Yes</div>, () => <div>No</div>)}
              {React.if(() => ifTest, () => <div>Shown</div>)}
            </main>
  }
  // destroy existing
  for (const el of document.getElementsByTagName('main')) el.remove()
  // create new
  const root = todoApp()
  if (app instanceof ServerApp) {
    const client = new ServerClient()
    client.setUp(root as ServerElement)
    console.log(app.cmds)
    app.fx.effect(root, () => { for (const cmd of app.cmds) client.doCmd(cmd); app.cmds = [] })
  } else {
    document.body.appendChild(root)
  }
}

export default testSpaApp