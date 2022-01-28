# vue-fiddle-helper

Use Vue to write small apps in fiddles with nearly no boilerplate. [Demo on JSitor](https://jsitor.com/gArbbhQYcC)

A single script file includes Vue 3, sets `window.app` to a new Vue app that you can add components to, and mounts your app to a new div on next tick. All you have to do is define a component called `main-app`:

```html
<script src="https://cdn.jsdelivr.net/gh/bandleader/bandlibs@5e4913a/dist/vue-fiddle-helper.browser.min.js"></script>
<script>
    app.component("main-app", {
        data: () => ({
            who: "world"
        }),
        template: "<h3>Hello {{who}}!</h3>"
    })
</script>
```

### Additional goodies:

- ✅ Includes [vue-class-plus](../vue-class-plus) for Typescript-friendly class components. No setup required -- vue-fiddle-helper patches your app's `.component()` method. (vue-class-plus is also exposed as `window.VCP` in case you need)
    - You may want to add the line `const { prop, propRequired } = window.VCP` so you can define props type-safely and easily. See vue-class-plus docs
- ✅ Includes [vug](../vug) for concise, powerful templates. No setup required, just replace `template: "..."` with `vug: "..."`. (vue-class-plus is also exposed as `window.Vug` in case you need)
- ✅ You can include Bootstrap and FontAwesome using the included `<use-styles />` component. You can also prevent your app from rendering by nesting it within that component. (Customizing the versions as well as the Bootswatch theme is possible, see the source code)
- ✅ Add a navigation bar using the `<nav-bar />` component. Props: `heading` (string), and optionally `links` (an object where the keys are link text and the values are URLs).
- ✅ Includes useful components `<async-value />`, `<promise-button />` (see source code for usage)
- For Typescript, adding the line `const { app, Vue } = window as any` may be useful to avoid errors

# Roadmap / TODO
- [x] Create a version for simple inclusion via a script tag, that doesn't have TS support, but that's fine (the components are still TS classes so that's fine)
- [ ] Create a simple script to build minified TS that can be pasted into a fiddle
    - TS can be minified for now simply by removing linebreaks and whitespace
- [x] Have our script initialize the app (unless a setting is set), even adding a `div#app` if it doesn't exist, running a component called called `<home-page>` or `<main-app>`, or the first component initialized otherwise
- [x] Include Vug? I think so; for script-tag use it's useful
- [ ] I think automatically load FontAwesome and Bootswatch (unless a setting is set somehow)
- [ ] Write up some basic docs
