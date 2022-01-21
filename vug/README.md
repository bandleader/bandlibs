# Vug

Vug is a concise language for expressing DOM elements, inspired by [Pug](https://pugjs.org/) and [Imba Elements](https://imba.io/docs/tags).

A quick demo is available [here](https://jsitor.com/preview/lpF52jP-s).

# Roadmap/TODO

- [ ] Properly handle quoted values with spaces in them. I prefer escaping quotes by doubling them up. [Some code here](https://stackoverflow.com/questions/4031900/split-a-string-by-whitespace-keeping-quoted-segments-allowing-escaped-quotes)
- [ ] How easily can this be integrated into Vite for use in `<template>` tags in Vue SFCs?
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
- [ ] Some sort of multiline HTML block
- [ ] Somehow split arguments onto more than one line. I think pug does `|` at the beginning of the next lines? Not sure it's so good. I would maybe do indent by >=8 spaces?
- [ ] Support tabs too (for now can just convert to spaces -- people shouldn't mix)
- [ ] Can we just auto-detect all possible list of CSS attributes so he doesn't need a `*`? Can still use the `*` for new/obscure ones, and maybe `attr-width` to force non-CSS attribute
- [ ] Can we do CSS-style syntax to avoid quotes -- p width: 100%; height: 100% -- foo. i.e. if using a colon, the value goes until the next semicolon (or `--` or comment of course)
- [ ] `//` unbuffered comments -- but the question is does it go before or after the innerHTML part
- [ ] Real playground app with Monaco and a few examples. And disambiguate between Vue mode and HTML mode...

# Example / "Documentation"

```
div -- Here's a div. It has some innerHtml.
div -- You can of course have <b>any tags</b> in your innerHtml.
-- Here's some HTML that's not in a div.
<div>Lines beginning with a &lt; are also interpreted as HTML.</div>
<!-- This can be useful for HTML comments. -->
-- Next you'll find an input element.
input

h3 -- Attributes
div -- Here's an input with its 'type' attribute set to 'checkbox':
input type=checkbox
div -- This one has two attributes -- just separate with spaces:
input type=checkbox checked=checked
div -- We also support valueless attributes:
input type=checkbox checked
div -- Longer attribute values can be quoted:
input value="longer"
div -- Use braces to set a computed attribute:
input value={toggle?'one':'two'}

h3 -- CSS style attribute
div -- Attributes beginning with an asterisk are interpreted as CSS style attributes.
span *background=yellow -- This should be yellow
div -- Multiple attributes are fine:
span *background=yellow *font-style=italic -- (and so are hyphenated attribute names)
div -- As before, longer attribute values can be quoted:
span *background="yellow" -- This should be yellow too
div -- And you can use braces to set a computed attribute:
span *background={toggle?'lightpink':'lightgreen'} -- This will depend on toggle state

h3 -- Classes
div .text-success -- Here's a div with a class applied.    
div.text-success -- You can also append classes with dots to the tag name,
div.text-success.ps-4 -- separating multiple classes with the dot character,
.text-success.ps-4 -- and you can even omit the tag name and 'div' will be assumed.
div .text-info=toggle -- Here's a div with a class conditionally applied. The value here is an expression (no need for braces because classes don't have values).
div .text-info={toggle} -- You can still use braces for longer expressions.

h3 -- Children
div.bg-secondary
    div -- This is a child of the div it's indented inside of.
    div -- Here is another child.
    -- Children can also be plain HTML,
    -- without a tag.
ul
    li -- Another example:
    li 
    -- This is a bulleted list.
    ul
        li -- And here's another level.
        li -- Yup, it works.
div -- All tags are closed automatically.
<div style="background: #FFE">
    <div>Inline HTML tags are just HTML, so make sure to close them.</div>
    -- Similarly, any lines that don't start with a &lt; should be prefaced with --.
    span.text-danger -- Otherwise they'll be interpreted as Vug tags. Which is often what you want.
</div>

h3 -- More involved demo
h5.text-success *font-style=italic -- Will this work?
div -- I think it will. -- Hope you saw the dashes
    <span style="color: red">This should be inside the paragraph.<br>
    <b>And this too</b>
    -- Also this
    </span>
    span.badge.bg-primary -- Badge
    br
    button.btn type=button .btn-primary={!toggle} .btn-success=toggle @click="toggle=!toggle" -- Click me
div -- You can have <b>HTML in middle of the text</b>.<br>Even linebreaks.
div style=color:red -- This should be red because I set a static attribute.
div style="color:red" -- This too.
div style={'color:'+(!toggle?'blue':'green')} -- This is a dynamic attribute and it should alternate between blue and green.
div.alert.alert-warning -- Watch yourself!
    -- What's happening?
```
