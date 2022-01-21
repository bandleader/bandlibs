
function _createVueHelper(appOpts: any) {
    const hooks: Function[] = []
    const hook = (fn: (app: any) => void) => { hooks.push(fn) }
    const comp = (name: string, obj: any) => hook(x => x.component(name, vueClassPlus(obj)))
    // Initialize the app on next tick so that all the components are registered
    const w = window as any
    const Vue = w.Vue
    let vm = Vue.createApp(appOpts)
    w.vm = vm
    setTimeout(() => {
        for (const h of hooks) h(vm)
        vm.mount('#app')
    })
    return { hook, comp, vm, Vue }
}
export function VueHelper(): ReturnType<typeof _createVueHelper>
export function VueHelper(componentName: string, optsOrClass: any): ReturnType<typeof _createVueHelper>
export function VueHelper(a?: any, b?: any): ReturnType<typeof _createVueHelper> {
    // Create a singleton instance
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
        }
    }
    const helper: ReturnType<typeof _createVueHelper> = w.vueHelper = w.vueHelper || _createVueHelper(mainInstance)
    // Create component if that overload was used
    if (a) helper.comp(a, b)
    return helper
}
