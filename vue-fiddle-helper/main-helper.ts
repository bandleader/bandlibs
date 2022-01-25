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
    w.app = Vue.createApp(mainInstance)
    
    // Support vue-class-plus
    const hook = (obj: any, prop: string, fn: Function) => { const old = obj[prop].bind(obj); obj[prop] = (...args: any[]) => fn.apply(obj, [old]).apply(obj, args) }
    hook(w.app, 'component', (old: Function) => (name: string, value: any, ...args: any[]) => old(name, VCP.classComponent(value), ...args))

    // Support vug
    hook(w.app, 'component', (old: Function) => (name: string, value: any, ...args: any[]) => {
        if (value.vug) { value.template = Vug.load(value.vug).toVueTemplate(); delete value.vug }
        old(name, value, ...args)
    })
    
    // Include some components
    w.app.component("async-value", class { 
        promise = VCP.propRequired<Promise<any>>()
        resolved = false
        value: any = null
        error: any = null
        created() { 
            this.promise.then(x => { this.value = x; this.resolved = true }, err => this.error = err)
        }            
        // TODO should make this use the included spinner (or rather include it here, so this doesn't need Bootstrap)
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
    w.app.component("use-styles", class {
        bootswatch = VCP.prop("lumen")
        bootstrap = VCP.prop("5.1.3")
        fontawesome = VCP.prop("6.0.0-beta3")
        static template = `<slot v-if=ready /><div v-else style="text-align: center; padding: 2em"><span class="super-simple-spinner" /></div>`
        static css = `
.super-simple-spinner {
    display: inline-block;
    width: 50px;
    height: 50px;
    border: 3px solid rgba(127,127,127,.5);
    border-radius: 50%;
    border-top-color: #fff;
    animation: super-simple-spinner-spin 1s ease-in-out infinite;
    -webkit-animation: super-simple-spinner-spin 1s ease-in-out infinite;
}
@keyframes super-simple-spinner-spin {
    to { -webkit-transform: rotate(360deg); }
}
@-webkit-keyframes super-simple-spinner-spin {
    to { -webkit-transform: rotate(360deg); }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
        `
        ready = false
        async created() {
            const addEl = (type: string, attrs: any) => new Promise(res => document.head.appendChild(Object.assign(document.createElement(type), attrs, { onload: res })))
            const waitingFor: Promise<any>[] = []
            if (this.bootstrap) {
                const href = this.bootstrap.startsWith("http") ? this.bootstrap 
                            : this.bootswatch ? `https://cdnjs.cloudflare.com/ajax/libs/bootswatch/${this.bootstrap}/${this.bootswatch}/bootstrap.min.css`
                            : `https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/${this.bootstrap}/js/bootstrap.min.js`
                waitingFor.push(addEl("link", { rel: "stylesheet", href }))
            }
            if (this.fontawesome) {
                const href = this.fontawesome.startsWith("http") ? this.fontawesome                             
                            : `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/${this.fontawesome}/css/all.min.css`
                waitingFor.push(addEl("link", { rel: "stylesheet", href }))
            }
            await Promise.all(waitingFor)
            this.ready = true
        }
    })
    w.app.component("nav-bar", class {
        links = VCP.prop<Record<string, string>>({}) // {href, title}
        heading = VCP.prop("Vue Fiddle")        
        collapse = true
        static template = `
<nav class="includedNavBar navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container-fluid">
    <a class="navbar-brand" href="#">{{heading}}</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarColor01" aria-controls="navbarColor01" aria-expanded="false" aria-label="Toggle navigation" @click="collapse=!collapse">
        <span class="navbar-toggler-icon"></span>
    </button>
        <div class="navbar-collapse" :class="{collapse}">
        <ul class="navbar-nav me-auto">
        <li class="nav-item" v-for="(href,title) in links">
            <a class="nav-link" :href="href">{{title}}</a>
        </li>
        </ul>
        <slot />
    </div>
    </div>
</nav>
        `
        css = `.includedNavBar .nav-link.active { background: rgba(0, 0, 40, 0.2); border-radius: 0.3em; }`
    })
      
    setTimeout(() => {
        const div = document.createElement("div")
        document.body.appendChild(div)
        w.app.mount(div)
    }) // Mount on next tick so all the components are ready
}
