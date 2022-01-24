import * as VCP from '../vue-class-plus'
import * as Vug from '../vug'

export function initApp(Vue = (window as any).Vue) {
    const w: any = window
    const mainInstance = {
        data: () => ({
            hash: window.location.hash
        }),
        created() {
            window.addEventListener('hashchange', () => {
                this.hash = window.location.hash === '#home' ? '' : window.location.hash // special handling because navigating to # breaks the JSitor IDE; it brings your app preview to the top of the screen
                window.scrollTo(0, 0)
            })
        },
        template: "<main-app />",
    }
    const div = document.createElement("div")
    document.body.appendChild(div)
    w.app = Vue.createApp(mainInstance)
    
    // Support vue-class-plus
    const hook = (obj: any, prop: string, fn: Function) => { const old = obj[prop].bind(obj); obj[prop] = (...args: any[]) => fn.apply(obj, [old]).apply(obj, args) }
    hook(w.app, 'component', (old: Function) => (name: string, value: any, ...args: any[]) => old(name, VCP.vueClassPlus(value), ...args))

    // Support vug
    hook(w.app, 'component', (old: Function) => (name: string, value: any, ...args: any[]) => {
        if (value.vug) { value.template = Vug.load(value.vug).toVueTemplate(); delete value.vug }
        old(name, value, ...args)
    })
    
    // Include two components
    w.app.component("async-value", class { 
        promise = VCP.propRequired<Promise<any>>()
        resolved = false
        value: any = null
        error: any = null
        created() { 
            this.promise.then(x => { this.value = x; this.resolved = true }, err => this.error = err)
        }            
        static template = `<slot v-if="resolved" v-bind="{value}" /><span v-else-if="error" class="text-danger"><i class="fa fa-exclamation-triangle" /> {{String(error)}}</span><span v-else class="text-primary spinner-border spinner-border-sm" role="status"></span>`
    })
    w.app.component("promise-button", class {
        action = VCP.propRequired<((ev: Event) => Promise<any>)>()
        pending = false
        success = false
        error: any = null
        errorClicked() { 
            alert(this.error) 
        }
        go(ev: Event) {
            this.pending = true
            this.error = null
            this.success = false
            this.action(ev).then(x => {
                this.pending = false
                this.success = true
                setTimeout(() => this.success = false, 2000)
            }, e => { this.pending = false; this.error = e })
        }
        static template = `<button @click="go" :disabled="pending"><slot /><transition name="fade"><span v-if="pending||error||success"><div v-if="pending" class="spinner-border spinner-border-sm ms-2" style="font-size: 0.7em" role="status" /><span v-else-if="error" :title="String(error)" @click.stop="errorClicked">⚠</span><span v-else-if="success">✅</span></span></transition></button>`
    })
    setTimeout(() => w.app.mount(div)) // Mount on next tick so all the components are ready
}
