# vue-class-plus

Small implementation of vue-class-component with a few tricks (so may be worthwhile even though Vue 3 seems to have some support for class components out of the box).

# Features

- ✅ Compatible with Vue 2 and 3
- ✅ No dependencies
- ✅ Prop helper that offers full TypeScript typing: `propName = prop(defaultValue)` or `propName = propRequired<T>()`
- ✅ Pass any other Vue options using `static opts = { ... }`
- ✅ Add CSS styles to the document using `static css = "h1 { color: teal }"` (not scoped, just for co-location)

# Getting Started

### Via npm

```bash
npm install bandleader/bandlibs
```

```js
import { classComponent, prop, propRequired } from 'bandlibs/vue-class-plus'

export default classComponent(class {
    who = "world"
    hello = prop("Hello") // or: propRequired<string>()
    foo() { /* Do something */ }
    created() { /* Lifecycle hooks */ }
    get greeting() { return `Hello, ${this.who}!` }
    static opts = {
        // optionally pass any Vue options here
    }
    // In Vue SFCs, skip the template here and 
    // just put it in your <template> as usual
    static template = `
        <h3>{{greeting}}</h3>
    `
    // Basic support for adding styles to the document.
    // These styles are not scoped.
    // In Vue SFCs, use the <style> tag instead
    static css = `
        h3 { color: teal }
    `

})
```

### Via script tag / CDN

```html
<script src="https://cdn.jsdelivr.net/gh/bandleader/bandlibs/dist/vue-class-plus.browser.min.js"></script>
<script>
Vue.component('foo-component', VCP.classComponent(class {
    who = VCP.prop("world")
    template: `<h3>Hello, {{who}}!</h3>`
}))
</script>
```



# Roadmap

- [x] Support a property `css` which will be injected into the document on `create` (but only once). Can remove it if number of non-destroyed components goes back to zero, but not sure it's even worth it performance wise (as elements can be created/destroyed fast)
- [ ] Optionally patch `app.component` / `Vue.component` to call us first
- [ ] Optionally register special handlers for types of templates, i.e. `vug` can be compiled with Vug and then used as template
- [ ] Actual docs/spec
