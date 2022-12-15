import * as VCP from '../vue-class-plus'
import * as Vug from '../vug'
import * as Utils from '../utils'
import AsyncValue from '../vue-async-value'
import PromiseButton from '../vue-promise-button'

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
        if (value.vug) { value.template = Vug.load(value.vug, {_tempLangVersion: 2}).toVueTemplate(); delete value.vug }
        old(name, value, ...args)
    })
    
    // Include some components
    w.app.component("async-value", AsyncValue)
    w.app.component("promise-button", PromiseButton)
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
            const waitingFor: Promise<any>[] = []
            if (this.bootstrap) {
                const href = this.bootstrap.startsWith("http") ? this.bootstrap 
                            : this.bootswatch ? `https://cdnjs.cloudflare.com/ajax/libs/bootswatch/${this.bootstrap}/${this.bootswatch}/bootstrap.min.css`
                            : `https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/${this.bootstrap}/js/bootstrap.min.js`
                waitingFor.push(Utils.addEl(document.head, "link", { rel: "stylesheet", href }).loadPromise())
            }
            if (this.fontawesome) {
                const href = this.fontawesome.startsWith("http") ? this.fontawesome                             
                            : `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/${this.fontawesome}/css/all.min.css`
                waitingFor.push(Utils.addEl(document.head, "link", { rel: "stylesheet", href }).loadPromise())
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
      
    function mountApp() {
        // Ensure DOM is ready before we append a div. Otherwise body will be null
        if (document.readyState == 'loading') {
            document.addEventListener('DOMContentLoaded', mountApp)
        } else {
            const div = document.createElement("div")
            document.body.appendChild(div)
            w.app.mount(div)
        }
    }
    setTimeout(mountApp) // Mount on next tick so all the components are ready
}
