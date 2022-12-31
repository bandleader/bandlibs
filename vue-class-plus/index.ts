
export function prop<T>(def: T, moreOpts: { type?: any } = {}) {
    // Typescript-wise it returns a T, so you can use it from elsewhere within the component,
    // whereas at runtime it returns a prop object that VueClassPlus knows to put in the right place.
    // You can specify, `required`, `type`, etc. in moreOpts if you like..
    const o = moreOpts as any
    o.default = def
    o._isProp = true // This causes VueClassPlus to make it into a prop
    return o as T
}
export function propRequired<T>(moreOpts: { type?: any } = {}) {
    const o = moreOpts as any
    o.required = true
    o._isProp = true
    return o as T
}

export function computed<T>(getter: ()=>T) {
    ;(getter as any)._isComputed = true
    return getter
}

export default classComponent
export function classComponent(cl: any, opts?: Record<string, any>) {
    if (typeof cl === 'object') return cl // This is a regular Vue component, just return
    if (typeof cl !== 'function') throw "VueClassPlus: Expected a class, not " + typeof cl

    const propsToIgnore = ['prototype', 'length', 'name', 'caller', 'callee']

    const copyData = (source: Record<string, any>, target: Record<string, any>) => {
        const insPropsOnly = Object.getOwnPropertyNames(source).filter(x => !propsToIgnore.includes(x))
        for (const prop of insPropsOnly) target[prop] = source[prop]
    }
    // Allow `opts` to be specified as a method on the class, or as a static object
    if (!opts && typeof cl.prototype.opts === 'function') { opts = cl.prototype.opts(); propsToIgnore.push("opts") }
    if (!opts && typeof cl.opts === 'object') { opts = cl.opts; propsToIgnore.push("opts") }

    // Validate/default for opts
    opts = opts || {}
    if (typeof opts !== 'object') throw "VueClassPlus: `opts` must be an options object, not " + typeof opts

    // Create main object
    const coercePropsArrayToObj = (x: object) => Array.isArray(x) ? x.reduce((a, c) => (a[c] = {}, a), {}) : x
    const ret = {
        ...opts,
        name: cl.name,
        computed: { ...(opts.computed || {}) },
        methods: { ...(opts.methods || {}) },
        props: coercePropsArrayToObj(opts.props || {}),
        data() {
            const newInstance = new cl()
            var data = {}
            copyData(newInstance, data)
            return data
        },
    }

    const consumeProp = (obj: Record<string, any>, prop: string, ignoreOthers = false) => {
        if (propsToIgnore.includes(prop)) return;

        const getValue = () => obj[prop] // it's behind a function so that we don't call getters unnecessarily -- which will throw an error
        const descriptor = Object.getOwnPropertyDescriptor(obj, prop)
        if (['created', 'mounted', 'destroyed', 'template'].includes(prop)) {
            (ret as any)[prop] = obj[prop]
        } else if (prop==="css") {
            // Just add it right away. No scoping or waiting till the component is created for now. The point is colocation
            document.head.appendChild(Object.assign(document.createElement("style"), { type: "text/css", innerText: obj[prop] }))
        } else if (descriptor && descriptor.get) {
            ret.computed[prop] = {
                get: descriptor.get,
                set: descriptor.set
            }
        } else if (typeof getValue() === 'function') {
            if (getValue()._isComputed) ret.computed[prop] = getValue()
            else ret.methods[prop] = getValue()
        } else if (getValue() && getValue()._isProp) {
            ret.props[prop] = getValue()
        } else if (!ignoreOthers) {
            throw `VueClassPlus: Class prop \`${prop}\` must be a method or a getter`
        } else { // It's a data prop, from the "check instance properties" section below
            return; // Silently ignore it; it will be used in `data()` only
        }

        // If we were successful, ignore the prop in subsequent checks
        propsToIgnore.push(prop)
    }

    // Populate methods/computeds/props from the class's prototype
    for (const prop of Object.getOwnPropertyNames(cl.prototype)) consumeProp(cl.prototype, prop)

    // Experimental: check static properties
    for (const prop of Object.getOwnPropertyNames(cl)) consumeProp(cl, prop)

    // Experimental: check instance properties
    const dummyInstance = new cl()
    for (const prop of Object.getOwnPropertyNames(dummyInstance)) consumeProp(dummyInstance, prop, true)

    // Done!
    return ret
}

