# Vug

Vug is a concise language for expressing DOM elements, inspired by [Pug](https://pugjs.org/) and [Imba Elements](https://imba.io/docs/tags).

# Getting Started

### Live Demo

A quick demo and playground is available [here](https://jsitor.com/preview/lpF52jP-s).

### Install via npm

```bash
npm install bandleader/bandlibs
```

```js
import * as Vug from "bandlibs/vug"
const code = "h1 -- Hello world!"
const result = Vug.load(code).toVueTemplate()
// VueTemplate can also be used as plain HTML.
// Vue is only required for calculated values, etc.
```

### Configure as a Vite plugin

```js
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as Vug from 'bandlibs/vue'

export default defineConfig({
  // Make sure Vug is BEFORE Vue
  plugins: [Vug.ViteTransformPlugin(), vue()] 
})
```

```html
<!-- Example.vue -->
<script>
  ...
</script>

<template lang="vug">
  h1 -- Hello world!
</template>
```

### Use via CDN
```html
<script src="https://cdn.jsdelivr.net/gh/bandleader/bandlibs/dist/vug.browser.min.js"></script>
<script>
const code = "h1 -- Hello world!"
const result = Vug.load(code).toVueTemplate()
</script>
```

# Features and Syntax

TODO, but see the example below, as well as the demo linked above, and you can probably figure it out.

# Example / "Documentation" (quick live demo [here](https://jsitor.com/preview/lpF52jP-s))

```
h3 -- Vug Basics
p -- In Vug, each HTML element is expressed as one clean, concise line of code.
p -- The left side of the '--' is the tag name, and the right side is any text content.
p -- 'Regular' HTML <b>tags</b> are allowed in this part -- it's actually called innerHTML).
-- This is a line of plain HTML that is not wrapped in a tag.
<p>Lines beginning with a '&lt;' are also interpreted as HTML.</p>
p -- Next is an empty paragraph; no need for the '--'.
p

h3 -- Attributes
p -- Here's an input with its 'type' attribute set to 'checkbox':
input type=checkbox
p -- This one has two attributes -- just separate with spaces:
input type=checkbox checked=checked
p -- Valueless attributes are fine too, just skip the '=':
input type=checkbox checked
p -- Longer attribute values can be quoted:
input value="long text here"
p -- Use braces to set a computed attribute, just like in JSX:
input value={toggle?'one':'two'}
button @click="toggle=!toggle" -- This is the toggle button

h3 -- Classes
p.text-success -- You can apply classes by appending them to the tag name with a 'dot' character, just like CSS. 
p.bg-primary.text-success -- Multiple classes are of course allowed.
p#fred -- This paragraph has an ID applied, again just like in CSS.
p#fred.text-success -- And similarly, this one has both a class and an ID. (The ID must be first.)
p -- If a class and/or ID is specified with no tag name, 'div' will be assumed. For example, the following two lines are equivalent:
div.text-success -- Great!
.text-success -- Great!
p -- You can apply classes conditionally. In this case, use them as a sort of attribute, separated from the tag name:
p .text-success={toggle} .text-info={!toggle} -- This depends on toggle state
button @click="toggle=!toggle" -- Here's the toggle button again

h3 -- Children
div.bg-info -- Children are expressed as additional lines indented 'beneath' their parent line, just like in Python.
  p -- For instance, this paragraph is inside the div.
div.bg-success -- And this is a new separate div.
  -- Here's some more plain HTML inside the second div.
  ul
    li -- This is a bulleted list inside the second div.
    li -- Another list item
div -- Now we're back to the top level.
<div style="background: #FFE">
  <div>Inline HTML tags are just HTML, so make sure to close them.</div>
  -- Similarly, any lines that don't start with a &lt; should be prefaced with --.
  span.text-danger -- Otherwise they'll be interpreted as Vug tags. Which is sometimes what you want.
</div>

h3 -- CSS properties
p -- You can use CSS properties just like HTML attributes; Vug ships with the full list of CSS properties so it knows which is which.
p font-weight=bold color=#00F -- Bold, blue text
p -- As before, longer attribute values can be quoted:
p border="1px dashed green" -- Nice border here
p -- And you can use braces to set a computed style property:
span background={toggle?'lightpink':'lightgreen'} -- This will depend on toggle state
button @click="toggle=!toggle" -- Here's the toggle button again

h3 -- More tricks
d -- div can be shortened to 'd'.
s.badge.bg-primary -- span can be shortened to 's'.
f -- 'div display: flex' can be shortened to 'f'. Experimental
d ml=1em bg=yellow -- We support more than 100 CSS shorthand properties, courtesy of Imba. See the code for the full list.
div -- We also support 6 macros:
ul
  li -- mx, my to set horizontal or vertical margins
  li -- px, py to set horizontal or vertical padding
  li -- sz to set width and height to the same value
  li -- circ to set border-radius to 100%
    span.ms-1 d=ib circ sz=1em bg=teal
div -- For the 'display' (or 'd') property, we support b, i, and f for block, inline, flex. Similarly, ib and if for inline-block and inline-flex.

  
```


# Roadmap/TODO

- [ ] Special if/else/for syntax? can be `if <expr or paren expr>: <element or indent>`
  - This would make render functions much easier, because the output of the actual element shouldn't change because of an if; that's on the parent.
  - Also v-if is stam awkward syntax and is only because HTML.
  - Use an "if" node which has children and also nullable "elseChildren" (which can be another if node). Or even a list of conditions and children, plus optionally elseChildren? That's more flat. 
  - Same for v-for: `for (x,i) in coll:` although coll can have a colon :( but we can say it has to be in parens?
  - [ ] Something should validate that the 2 latter follow a v-if or v-else-if
- [ ] Remaining work on render functions
    - [ ] Tag names that begin with an uppercase letter, or include a hyphen, should be custom components (instead of a string); in React it has to be in scope so just convert it to a variable name, and for Vue (3) if it's a globally registered component it's `Vue.resolveDynamicComponent(name)`. BUT how to handle that it can be a nameExpr OR a resolveDynamicComponent passing a string? We *could* do `typeof SomeComp === 'undefined' ? Vue.resolveDynamicComponent(name) : SomeComp`. Or perhaps resolveDynamicComponent returns undefined so we can `||` ? 
      - The truth is that Vue render functions are of secondary importance anyway.
  - [ ] Fragments: a function which takes a LIST of nodes, and if it's more than one node, emits React.Fragment (and for Vue what?).
  - These should perhaps be done in separate lowering passes: (can be called on the fly by the emitter though, to avoid walking trees)
    - [ ] Events: Convert `v-on:click` and `@click` events to `onClick={$event => { %VALUE }}` (supported by both Vue and React)
      - [ ] If it's just letters and dots (or maybe if it doesn't end with a right paren?) then DON'T wrap it in a function. Or the reverse -- add parens at the end.
    - [ ] Convert `v-show` to a style attr
    - [ ] Convert `v-model` to `:value=modelValue` and `update:modelValue`, but for HTML elements it's a bit harder
  - [ ] Handle v-bind plain as an explode into the attrs object (support multiple?)
  - [ ] if/else-if/else, once we finalize syntax. Compile to ternaries, with null if there's no v-else or v-else as next sibling
  - [ ] for loops
    - Vue 3 says to put the `key` on the `template v-for` tag itself, I'm not sure why. And we can't do that... I hope it's just sugar for putting it in on all the elements. The template compiler actually *does* throw an error: `<template v-for> key should be placed on the <template> tag.`, but I hope it's just to enforce convenience...
    - This actually also applies to keys on v-if, though it's less common
  - `template` tags should be rendered as a Fragment (they can have keys in Vue and hopefully also React); or if they have one child and no keys maybe just render the child
- [ ] Sugar for containers with a single element in them: Separate layers on the same line with `>`.
    - `.col-4 > .card > .card-body > p -- Some text inside it`
    - Can be implemented as a pass looking for word `>`, we keep pushing elements onto the stack, then we take our children and move them to the last element. That way no indentation magic has to happen
- [ ] Syntax for CSS rules, that allows shorthand. The main point is co-location. There should be a separate method that gets the total style text, and perhaps a method that adds it to the DOM, perhaps given a `window`.
    - `css .card:hover > .title -- bg=#FFF`
    - Perhaps children of these elements should also be interpreted as CSS rules but as children of these. A bit hard to parse everything properly...
      ```
      css .card
        .title -- bg=blue
        :hover -- .title -- bg=red
      ```      
- [ ] Fix quoting: braces with spaces don't work (although we may deprecate braces in favour of Vue's colon syntax), 2) perhaps we should make our own lexer
- [x] Experimental: `q` unit which is equal to 0.25rem
  - [ ] Perhaps for properties that only take a single measurement we can just make that the default. Like margin/padding (in all its directions), width/height (including max/min), etc 
- [ ] Perhaps: Sugar to apply words to all children. I think `*` (if we're not using `*` for CSS):
    ```
    .row
        *.col-md-3 p=0.5em
        div
        div
        div
    ```
- [ ] Can we do CSS-style syntax to avoid quotes -- p width: 100%; height: 100% -- foo. i.e. if using a colon, the value goes until the next semicolon (or `--` or comment of course) It's also great for pasting CSS. 
- [ ] Should we allow `:` instead of `=`? For CSS I keep typing it that way out of force of habit. Although perhaps even don't require `*`
- [ ] Some sort of multiline HTML block
- [ ] Somehow split arguments onto more than one line. I think pug does `|` at the beginning of the next lines? Not sure it's so good. I would maybe do indent by >=8 spaces?
- [ ] Real playground app with Monaco and a few examples. And disambiguate between Vue mode and HTML mode...
- [ ] Support real `style` and `class` static attributes, combining with any of ours -- not simple for render functions
- [ ] So far we only handle the template/render function. If we eventually decide to emit a whole component, i.e. maybe do SFCs, then we need to think about scope. Vue does a whole bunch of tricks, but all you *really* need is to put the script in setup() and return the render function, which has access to the scope. (In React it's just a single render function, and run any setup code conditionally on first render (not built-in, but can useEffect with an array with a single dummy value so it never changes). For props in React we can make the function we're emitting take first arguments `({any, arg, names})` so they're in scope. But for Vue the render function takes no arguments; I think they're on `this`. Perhaps `with (this)` is necessary. What Vue SFC does is  I think that's legal in Vue render functions too (maybe even in setup functions?), just not Solid.js render functions as it will register a dependency for everything.)
- [ ]     - *(I think just use regular expressions, let them handle the rest, except obviously Vue SFCs where where just transform the template and Vue handles the rest)* How to handle scope? Depends on the use cases. If we're emitting a single render expression as text, then it's your responsibility. If we're emitting a full render function (or function expression) (either at build-time or at runtime), the function should just take a single arguments `props`, as is idiomatic for React and [Vue 3 setup too](https://v3.vuejs.org/guide/composition-api-setup.html) (since destructuring removes reactivity). For Vue, there's a second argument `context`.
      - [ ] Optionally we should put the whole function in a a `with(this)` for Vue and `with(props)` for React.    
