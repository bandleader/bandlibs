type Patch = { updates: [string, any][] }
function keyValueWatcher(snapper: () => Map<string, any>) {
    const snap = snapper()
    const bus = new Bus<Patch>()
    const touch = () => {
        const cur = snapper()
        const changed = Array.from(cur.entries()).filter(([k, v]) => !snap.has(k) || v !== snap.get(k))
        const deleted = Array.from(snap.keys()).filter(k => !cur.has(k)).map(k => [k, undefined]) as [string, any][]
        const all = [...changed, ...deleted]
        if (!all.length) {
            all.forEach(([k, v]) => snap.set(k, v))
            console.log("Creating PATCH:", all)
            const p: Patch = { updates: all }
            bus.raise(p)
        }
    }
    const watch = (interval = 2000) => {
        const interv = setInterval(touch, interval)
        const cancel = () => clearInterval(interv)
        return { cancel }
    }
    return { bus, touch, watch }
    // Later: get all updates since version X
}

type BusHandler<T> = (ev: T) => void
class Bus<T> {
    handlers: BusHandler<T>[] = []
    subscribe(handler: BusHandler<T>) { this.handlers.push(handler) }
    raise(ev: T) { this.handlers.forEach(h => h(ev)) }
}

function objToMap(obj: Record<string, any>) {
    const ret = new Map<string, any>()
    for (const k of Object.keys(obj)) ret.set(k, obj[k])
    return ret
}

function deepObjToMap(obj: Record<string, any>, map = new Map<string, any>(), prefix = "") {
    // Adapts a deep object for use with keyValueWatcher.
    for (const k of Object.keys(obj)) {
        const v = obj[k]
        if (Array.isArray(v)) {
            throw "Arrays not supported yet" // TODO
        } else if (v === undefined) {
            map.set(prefix + k, "<UNDEFINED>")
            // TODO ignore all children
        } else if (typeof v === 'object' && v !== null) {
            map.set(prefix + k, "<OBJECT>")
            deepObjToMap(v, map, prefix + k + ".")
        } else {
            map.set(prefix + k, v)
        }
    }
    return map
}

// function test() {
//   const obj = {
//     one: "ONE!!!",
//     two: "2" as any,
//     three: "whatever"
//   }
//   const ferry = keyValueWatcher(() => deepObjToMap(obj))
//   ferry.bus.subscribe(x => {
//     for (const [k,v] of x.updates) console.log(k, ":", v)
//   })
//   ferry.watch()
//   setTimeout(() => obj.one = "something else", 1000)
//   setTimeout(() => obj.three = "OK", 3000)
//   setTimeout(() => obj.two = { fine: "bar", green: 34 }, 5000)
//   setTimeout(() => obj.two.fine = { blue: "baz" }, 7000)
// }
function test2() {
    const sideA = ferry()
    const sideB = ferry()
    sideA.outgoingBus.subscribe(sideB.eat)
    sideB.outgoingBus.subscribe(sideA.eat)
    setInterval(() => {
        console.log("A:", sideA.obj.foo)
        console.log("B:", sideA.obj.foo)
        console.log("-----------------")
    }, 1000)
    setTimeout(() => sideA.obj.foo = "hello there", 3000)
    setTimeout(() => sideB.obj.foo = "hello again", 5000)
    setTimeout(() => sideA.obj.foo = { hello: "world" }, 7000)
    setTimeout(() => sideB.obj.foo.hello = { name: "Fred" }, 9000)
    setTimeout(() => delete sideA.obj.foo, 11000)
}
test2()

function ferry() {
    const obj: Record<string, any> = {}
    const watcher = keyValueWatcher(() => deepObjToMap(obj))
    let eating = false
    const eat = (p: Patch) => {
        eating = true
        try {
            for (const [k, v] of p.updates) deepSet(obj, k, v)
        } finally {
            eating = false
        }
    }
    const outgoingBus = new Bus<Patch>()
    watcher.bus.subscribe(p => eating || outgoingBus.raise(p))
    watcher.watch()
    return { obj, outgoingBus, eat }
}

function deepSet(obj: any, path: string[] | string, value: any): void {
    if (typeof path === 'string') return deepSet(obj, path.split("."), value)
    for (const k of path.slice(0, path.length - 1)) obj = obj[k]
    const lastKey = path.slice(-1)[0]
    if (value === "<UNDEFINED>") delete obj[lastKey]
    else obj[lastKey] = value === "<OBJECT>" ? {} : value
}