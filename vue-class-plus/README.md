# vue-class-plus

Small implementation of vue-class-component with a few tricks (so may be worthwhile even though Vue 3 seems to have some support for class components out of the box).

# Features

✅ Compatible with Vue 2 and 3
✅ No dependencies
✅ Prop helper that offers fully TS typing: `propName = prop(defaultValue)` or `propName = propRequired<T>()`
✅ Pass any other Vue options using `static opts = { ... }`

# Roadmap

- [ ] Support a property `css` which will be injected into the document on `create` (but only once). Can remove it if number of non-destroyed components goes back to zero, but not sure it's even worth it performance wise (as elements can be created/destroyed fast)
- [ ] Optionally patch `app.component` / `Vue.component` to call us first
- [ ] Optionally register special handlers for types of templates, i.e. `vug` can be compiled with Vug and then used as template
- [ ] Actual docs/spec
