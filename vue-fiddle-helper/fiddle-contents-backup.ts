VueHelper('home-page', class {
    asyncDemo = new Promise<string>((res) => setTimeout(() => res("this is a demo of that"), 3000))
    get asyncDemoUpperCase() { return this.asyncDemo.then(x => x.toUpperCase()) }
    testPromise() {
        return new Promise((res, rej) => setTimeout(() => {
            if (Math.random() > 0.3) res("Done")
            else rej("Ocassionally fail, just to show the error indicator")
        }, 1000))
    }
    static template = `
  <div>
    <h3>Fiddle home page</h3>
    <ul>
      <li>Typescript (built-in to JSitor)</li>
      <li>Vue 3</li>
      <li>Bootstrap 5.1.3 (<a href="https://bootswatch.com/lumen/">Lumen</a> theme from Bootswatch; switch to any theme you want in the JSitor settings)</li>
      <li>FontAwesome 6 (find icons <a href="https://fontawesome.com/v6.0/icons?m=free">here</a>)</li>
      <li>
        <code>VueHelper</code> function to define Vue components, register them, and start the app next tick
        <ul>
          <li>You can still get at the app instance and other things by calling <code>VueHelper().</code> -- see what Typescript options come up</li>
          <li>Class components (including support for props, computed, template, etc.), using the <code>vueClassPlus</code> function I took from Zip and extended here</li>
        </ul>
      </li>
      <li>Basic hash routing (but feel free to delete the conditionals in the main template and just put everything in one page)</li>
      <li>
        <code>&lt;async-value&gt;</code> component for easy consumption of Promises &mdash;
        <async-value :promise="asyncDemoUpperCase" v-slot="{value}">{{value}}</async-value>
      </li>
      <li>
        <code>&lt;promise-button&gt;</code> component for buttons that easily show feedback while their action is pending.
        <promise-button :action="() => testPromise()" class="btn btn-sm btn-primary">Try me</promise-button>
      </li>
    </ul>
  </div>
  `
})

VueHelper("fork-alert", class {
    person = propRequired<string>()
    forkWhat = prop("this fiddle")
    get greeting() { return "Hello, " + this.person }
    static template = `
      <p class="alert alert-success"><i class="fa fa-lightbulb" /> {{greeting}}! Please fork {{forkWhat}}.</p>
    `
})

VueHelper("nav-bar", class {
    links = prop<Record<string, string>>({}) // {href, title}
    heading = propRequired<string>({ type: String })
    collapse = true
    static template = `
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary fixed-top">
    <div class="container-fluid">
      <a class="navbar-brand" href="#home" @click="collapse=true">{{heading}}</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarColor01" aria-controls="navbarColor01" aria-expanded="false" aria-label="Toggle navigation" @click="collapse=!collapse">
        <span class="navbar-toggler-icon"></span>
      </button>
        <div class="navbar-collapse" :class="{collapse}">
        <ul class="navbar-nav me-auto">
          <li class="nav-item" v-for="(href,title) in links">
            <a class="nav-link" :class="{active: href===$root.hash}" :href="href" @click="collapse=true">{{title}}</a>
          </li>
        </ul>
        <slot />
      </div>
    </div>
  </nav>
  <div style="height:4.5rem" /><!-- Spacer to get over the fixed navbar. Yes, this is still the way in 2022: https://getbootstrap.com/docs/5.1/examples/navbar-fixed/ -->
  `
})


VueHelper("async-value", class {
    promise = propRequired<Promise<any>>(); resolved = false; value: any = null; error: any = null; created() { this.promise.then(x => { this.value = x; this.resolved = true }, err => this.error = err) };
    static template = `<slot v-if="resolved" v-bind="{value}" /><span v-else-if="error" class="text-danger"><i class="fa fa-exclamation-triangle" /> {{String(error)}}</span><span v-else class="text-primary spinner-border spinner-border-sm" role="status"></span>`
})
VueHelper("promise-button", class {
    action = propRequired<((ev: Event) => Promise<any>)>(); pending = false; success = false; error: any = null; errorClicked() { alert(this.error) }; go(ev: Event) { ; this.pending = true; this.error = null; this.success = false; this.action(ev).then(x => { ; this.pending = false; this.success = true; setTimeout(() => this.success = false, 2000) }, e => { this.pending = false; this.error = e }) };
    static template = `<button @click="go" :disabled="pending"><slot /><transition name="fade"><span v-if="pending||error||success"><div v-if="pending" class="spinner-border spinner-border-sm ms-2" style="font-size: 0.7em" role="status" /><span v-else-if="error" :title="String(error)" @click.stop="errorClicked">⚠</span><span v-else-if="success">✅</span></span></transition></button>`
})

  
  // --------------------------------------------------------------------------------------------------------------
  // Vue Helper minified code
  // Usage: VueHelper('component-name', component options object or class component)
  // Or: VueHelper(). and see the options that come up.
  // App is mounted on next tick so that all components are registered.
  // --------------------------------------------------------------------------------------------------------------
  function _createVueHelper(e){const t=[],o=e=>{t.push(e)},n: any=window,s=n.Vue;let p=s.createApp(e);return n.vm=p,setTimeout(()=>{for(const e of t)e(p);p.mount("#app")}),{hook:o,comp:(e,t)=>o(o=>o.component(e,vueClassPlus(t))),vm:p,Vue:s}}
  function VueHelper(): ReturnType<typeof _createVueHelper>; function VueHelper(componentName: string, optsOrClass: any): ReturnType<typeof _createVueHelper>; function VueHelper(e?: any, t?: any): ReturnType<typeof _createVueHelper>{
    const o: any = window, p = { data: () => ({ hash: window.location.hash }), created() { window.addEventListener("hashchange", () => { this.hash = window.location.hash === '#home' ? '' : window.location.hash; window.scrollTo(0,0)})}},n=o.vueHelper=o.vueHelper||_createVueHelper(p);return e&&n.comp(e,t),n}function prop<T>(def: T, moreOpts: {type?: any} = {}){const t=moreOpts; (t as any).default = def;return (t as any)._isProp=!0,t} function propRequired<T>(moreOpts: {type?: any} = {}) { const o = moreOpts as any; o.required = true; o._isProp = true; return o as T }
  function vueClassPlus(e,t?){if("object"==typeof e)return e;if("function"!=typeof e)throw"VueClassPlus: Expected a class, not "+typeof e;const o=["prototype","length","name","caller","callee"];if(t||"function"!=typeof e.prototype.opts||(
  t=e.prototype.opts(),o.push("opts")),t||"object"!=typeof e.opts||(t=e.opts,o.push("opts")),"object"!=typeof(t=t||{}))throw"VueClassPlus: `opts` must be an options object, not "+typeof t;
  const n=Object.assign(Object.assign({},t),{name:e.name,computed:Object.assign({},t.computed||{}),methods:Object.assign({},t.methods||{}),
  props:(e=>Array.isArray(e)?e.reduce((e,t)=>(e[t]={},e),{}):e)(t.props||{}),data(){var t={};return((e,t)=>{const n=Object.getOwnPropertyNames(e).filter(e=>!o.includes(e));for(const o of n)t[o]=e[o]})(new e,t),t}}),s=(e,t,s=!1)=>{if(o.includes(t))return;
  const p=()=>e[t],r=Object.getOwnPropertyDescriptor(e,t);if(["created","mounted","destroyed","template"].includes(t))n[t]=e[t];else if(r&&r.get)n.computed[t]={get:r.get,set:r.set};else if("function"==typeof p())n.methods[t]=p();else{if(!p()||!p()._isProp){if(s)return;
  throw`VueClassPlus: Class prop \`${t}\` must be a method or a getter`}n.props[t]=p()}o.push(t)};for(const t of Object.getOwnPropertyNames(e.prototype))s(e.prototype,t);for(const t of Object.getOwnPropertyNames(e))s(e,t);const p=new e;for(const e of Object.getOwnPropertyNames(p))s(p,e,!0);return n}

