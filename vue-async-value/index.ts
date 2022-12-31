// Should work with either Vue 2 or 3
// TODO: remove dependency on the template compiler? (although that means we need separate functions for Vue 2 and 3, and also for Vue 3 render functions need to import Vue itself)
export default {
    props: ['promise'],
    data: () => ({ resolved: false, value: null, error: null }),
    watch: { // supported by both Vue 2 and 3
        immediate: true,
        handler() { 
            this.resolved = false
            this.error = null
            this.promise.then(x => { this.value = x; this.resolved = true }, err => this.error = err) }
    },
    // TODO should make this use the included spinner (or rather include it here, so this doesn't need Bootstrap)
    template: `<slot v-if="resolved" v-bind="{value}" /><span v-else-if="error" class="text-danger"><i class="fa fa-exclamation-triangle" /> {{String(error)}}</span><span v-else class="text-primary spinner-border spinner-border-sm" role="status"></span>`,
}