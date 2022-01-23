# Vug

Vug is a concise language for expressing DOM elements, inspired by [Pug](https://pugjs.org/) and [Imba Elements](https://imba.io/docs/tags).

A quick demo is available [here](https://jsitor.com/preview/lpF52jP-s).

# Features and Usage

TODO, but see the example below, as well as the demo linked above, and you can probably figure it out.

# Example / "Documentation"

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
  li -- size to set width and height to the same value
  li -- round to set border-radius to 100%
div -- For the 'display' (or 'd') property, we support b, i, and f for block, inline, flex. Similarly, ib and if for inline-block and inline-flex.

  
```


# Roadmap/TODO

- [ ] Fix quoting: braces with spaces don't work (although we may deprecate braces in favour of Vue's colon syntax), 2) perhaps we should make our own lexer
- [x] Experimental: `q` unit which is equal to 0.25rem
- [ ] Sugar for containers with a single element in them: Separate layers on the same line with `>`.
    - `.col-4 > .card > .card-body > p -- Some text inside it`
    - Can be implemented as a pass looking for word `>`, we keep pushing elements onto the stack, then we take our children and move them to the last element. That way no indentation magic has to happen
- [ ] Sugar to apply words to all children. I think `*` (if we're not using * for CSS):
    ```
    .row
        *.col-md-3 p=0.5em
        div
        div
        div
    ```
- [ ] How easily can this be integrated into Vite for use in `<template>` tags in Vue SFCs?
- CSS and syntax ideas
    - [x] Can we just auto-detect if an attribute is in a [list of all possible CSS attributes](https://www.w3.org/Style/CSS/all-properties.en.html) (or in [JSON](https://www.w3.org/Style/CSS/all-properties.en.json)) so he doesn't need a `*`? Can still use the `*` for new/obscure ones, and maybe `attr-width` to force non-CSS attribute
    - [ ] Can we do CSS-style syntax to avoid quotes -- p width: 100%; height: 100% -- foo. i.e. if using a colon, the value goes until the next semicolon (or `--` or comment of course) It's also great for pasting CSS. 
    - [ ] Should we allow `:` instead of `=`? For CSS I keep typing it that way out of force of habit. Perhaps even don't require `*`
- [ ] If use cases justify it: option to JSX-style render functions for React and Vue
    - `React.createElement(tagName, attrsObjInclExplode, ...childrenOrTextStrings)`
    -  For multiple root-level notes, create element of type `React.Fragment` (and for Vue what?)
    - Make sure to handle `v-if/else-if/else` `v-for` by converting to ternaries and `map`
    - Lowering passes should do the following:
        - [ ] Convert `v-show` to a style
        - [ ] Convert `v-on:click` and `@click` events to `onClick={$event => { %VALUE }}` (supported by both Vue and React)
            - [ ] If the value is a single word, add parens to call it
            - [ ] Add code to handle `.stop` and `.prevent`
            - [ ] use `onClickCapture` for the capturing phase (supported by both Vue and React)
            - [ ] Vue additionally supports `.passive`, and `.once`; see [here](https://v3.vuejs.org/guide/render-function.html#v-on)
    - How to handle scope? Depends on the use cases. If we're emitting a single render expression as text, then it's your responsibility. If we're emitting a full render function (or function expression) (either at build-time or at runtime), the function should just take a single arguments `props`, as is idiomatic for React and [Vue 3 setup too](https://v3.vuejs.org/guide/composition-api-setup.html) (since destructuring removes reactivity). For Vue, there's a second argument `context`.
    - [ ] Optionally we should put the whole function in a a `with(this)` for Vue and `with(props)` for React.
    - [ ] Tag names that begin with an uppercase letter or include a hyphen should be custom components (instead of a string); in React it has to be in scope so just convert it to a variable name, and for Vue (3) if it's a globally registered component it's `Vue.resolveDynamicComponent(name)`.
- [ ] Some sort of multiline HTML block
- [ ] Somehow split arguments onto more than one line. I think pug does `|` at the beginning of the next lines? Not sure it's so good. I would maybe do indent by >=8 spaces?
- [x] `//` unbuffered comments -- but the question is does it go before or after the innerHTML part. Either way make sure `--` is allowed in comments and `//` is allowed in html URLS -- maybe only ` //`? in HTML you sometimes have `://` and sometimes `"//foo"` or `'//foo'`
- [ ] Real playground app with Monaco and a few examples. And disambiguate between Vue mode and HTML mode...
- [ ] Allow real `style` static attribute? Combine with any of ours
