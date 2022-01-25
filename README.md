# BandLibs

A collection of small utilities, mostly for Javascript/Typescript/Vue, that I would like to make available.

### Libraries you'll find here in the source:
- **[vug](vug/)** -- concise language for expressing HTML (or Vue templates), inspired by [Pug](https://pugjs.org/) and [Imba Elements](https://imba.io/docs/tags)
- **[vue-class-plus](vue-class-plus/)** -- small implementation of vue-class-component with a few tricks (so may be worthwhile even though Vue 3 seems to have some support for class components out of the box)
- **[vue-fiddle-helper](vue-fiddle-helper/)** -- reduced boilerplate for quick Vue fiddles. Includes navbar, routing, vue-promise-button, vue-async-value, vue-class-plus, Bootstrap, FontAwesome

### Libraries I hope to post here soon:
- **[ferry](ferry/)** -- WIP -- two-way-sync arbitrary Javascript objects -- changes are streamed as patches which the other side applies
- **reveal** -- animate HTML elements when they come into view (including easy Vue directive)
- **vue-promise-button** -- button component for Vue that shows feedback while its action is pending
- **vue-async-value** -- component for easy consumption of async data or async computed properties in Vue templates
- **node-quick-control** -- a script to easily control a server. Even easier if you run through npx
- **roll-your-lib** -- one line to compile your Typescript library for use as a CommonJS module, an ES6 module, or via a script tag. Designed for running as an npm script or via npx
- **vue-item-list** -- Vue component to show a list of items, allow selecting them, and perform actions on them
- **[utils](utils/)** -- miscallaneous helper functions; might not even be worth the dependency, but you can copy them into your projects
