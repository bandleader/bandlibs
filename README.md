# BandLibs

A collection of small utilities, mostly for Javascript/Typescript/Vue, that I would like to make available.

The goal is to have one repo and maintain one script to build them all. 

**NOTE**: At the moment, if you need a built version, you will need to build it yourself (using roll-your-lib).

### Libraries you'll find here in the source (no docs yet):
- **vug** -- concise language for expressing HTML (or Vue templates), similar to [Pug](https://pugjs.org/). (I would really like to set this up for use in Vue SFCs as well.) Inspired in part by [Imba Elements](https://imba.io/docs/tags)
- **vue-fiddle-helper** -- reduced boilerplate for quick Vue fiddles. Includes navbar, routing, vue-promise-button, vue-async-value, vue-class-plus, Bootstrapm, FontAwesome
- **vue-class-plus** -- small implementation of vue-class-component with a few tricks (so may be worthwhile even though Vue 3 seems to have some support for class components out of the box).
- **ferry** -- WIP -- two-way-sync arbitrary Javascript objects -- changes are streamed as patches which the other side applies

### Libraries I hope to post here soon:
- **reveal** -- animate HTML elements when they come into view (including easy Vue directive)
- **node-quick-control** -- a script to easily control. Even easier if you run through npx
- **roll-your-lib** -- one line to compile your Typescript library for use as a CommonJS module, an ES6 module, or via a script tag. Designed for running as an npm script or via npx
- **vue-promise-button** -- button component for Vue that shows feedback while its action is pending
- **vue-async-value** -- component for easy consumption of async data or async computed properties in Vue templates
- **vue-item-list** -- Vue component to show a list of items, allow selecting them, and perform actions on them
- **utils** -- miscallaneous helper functions; might not even be worth the dependency, but you can copy them into your projects