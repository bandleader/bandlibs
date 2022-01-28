import * as VCP from '../vue-class-plus'
// Should work with either Vue 2 or 3
// TODO: remove dependency on VCP, and remove dependency on the template compiler (although that means we need separate functions for Vue 2 and 3, and also for Vue 3 render functions need to import Vue itself)
export default VCP.classComponent(class PromiseButton {
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