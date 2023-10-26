/*
- [x] JSX support
- [ ] For/If
- [ ] Server app that produces an element that can be serialized to HTML
- [ ] Components that can be written for any app
- [ ] Blazor apps:
  - [ ] Server support effects, just log when re-running
  - [ ] Server assign element IDs if there are any effects
  - [ ] Client stub to get latest changes from server
  - [ ] Server app manager that prunes copies that are not in touch
*/

function set(el: HTMLElement, key: string, value: any) {
  // Pure frontend side
  if (key[0] === '$') el.style[key.slice(1)] = value // supports both camelCase and kebab-case
  else if (key[0] === '_') el.classList.toggle(key.slice(1).replace(/_/g, '-'), !!value)
  else if (key.startsWith("on")) el.addEventListener(key.slice(2), value)
  else el[key] = value
}


class EffectsSystem {
  effects = new Map<HTMLElement, Function[]>()
  rerun() {
    console.log("REREUNNING", Array.from(this.effects.values()).length)
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

abstract class App {
  abstract h(tag: any, attrs: any, ...children: any[]): any
  createElement(tag: any, attrs: any, ...children: any[]) { return this.h(tag, attrs, ...children.map(x => this.transformChild(x))) }
  private transformChild(x: any) { 
    return typeof x === 'string' ? this.h('span', { innerText: x }) : 
      Array.isArray(x) ? this.h('div', { $display: "contents" }, ...x.map(y => this.transformChild(y))) :
      x 
  }
}

class SpaApp extends App {
  fx = new EffectsSystem()
  h(tag: any, attrs: any, ...children: any[]) {
    const el = document.createElement(tag)
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

const randId = () => Math.random().toString(36).slice(2)
const comparer = (fn: (x: Cmd) => string|number) => (a: Cmd, b: Cmd) => { const x = fn(a), y = fn(b); return x === y ? 0 : x < y ? -1 : 1 }

class Cmd {
  constructor(public id: string, public key: string, public value: any) {}
}
class ServerElement {
  id = randId()
  isConnected = true
  constructor(public app: ServerApp, public tag: string) { this.id = app.nextId() }
  set(key: string, value: any) { this.app.cmds.push(new Cmd(this.id, key, value)) }
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
  fx = new EffectsSystem()
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
  setUp(el: ServerElement) {
    const main = document.createElement(el.tag)
    main.setAttribute('_n', el.id)
    document.body.appendChild(main)
  }
  doCmd(cmd: Cmd) {
    const el = document.querySelector(`[_n="${cmd.id}"]`) as HTMLElement
    if (!el) throw console.error("Element not found", cmd)
    if (cmd.key === "!APPENDCHILD") {
      const [tag, id] = cmd.value.split('|')
      const child = document.createElement(tag)
      child.setAttribute("_n", id)
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
    return  <main>
              <h1 $color="green">Todo list</h1>,
                <ul>
                  {...todos.map(todo => 
                    <li $opacity={() => todo.done ? 0.5 : 1}>
                      <input type="checkbox" _me_1 checked={() => todo.done} onclick={() => todo.done = !todo.done} />
                      <span innerText={todo.text} $textDecoration={() => todo.done ? "line-through" : "none"} />
                    </li>
                  )}
                </ul>
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
    app.cmds.forEach(cmd => client.doCmd(cmd))
  } else {
    document.body.appendChild(root)
  }
}
testSpaApp()

export default testSpaApp