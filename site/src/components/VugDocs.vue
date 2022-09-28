y
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import * as Vug from '../../../vug'
import VugDocsExample from './VugDocsExample.vue'

const commentExampleCode = `h3 -- Welcome to Vug! // This is a comment\n// This is also a comment`

/* 
TODO:
- Syntax-highlight the HTML
- Syntax-highlight the left side
- Make the left side Monaco

To add to docs:
// - CSS shorthand
// - CSS macros
  - Flex macro
- CSS units
// - Custom tag types
- HTML on right side
- HTML on left side
// - Direct children
// - Binding to expression (incl styles)
  // - Conditional classes
  // - Objects/templates/numbers
- First-class stylesheets
  - (main point being co-location)
  - (and to refer to the current element by default without needing to dream up class names)
  - (but can also refer to on hover etc)
  - (or children)
  - Or express on the element itself using *

 */
</script>

<template lang="vug">
section.bg-dark.text-secondary.px-4.py-5.text-center bg=#222!important > .py-5
  .display-5.fw-bold.text-white -- Prototype at warp speed with real HTML
  .col-lg-6.mx-auto
    p
    p.fs-5.mb-4 c=#FFF -- Vug lets you write HTML so quickly, you can prototype at warp speed and push the code straight into production. Try it yourself: 
    .d-grid.gap-2.d-sm-flex.justify-content-sm-center
      a.btn.btn-outline-info.btn-lg.px-4.me-sm-3.fw-bold type=button -- Get started
      a.btn.btn-outline-light.btn-lg.px-4 type=button onclick=router.push('/docs') -- Docs
section.py-4 bg=#AAA
  h2.text-center -- Try it now!
  .container > VugDocsExample > pre
    -- .text-center.p-2 bg=green c=#FFF -- Hello from Vug!
    --   button.btn.btn-primary -- ♥ Like

.container.py-4#documentation
  css:[& aside] font-style=italic c=#777 d=inline mx=1q
  # Documentation
  Vug is a concise language for expressing DOM elements, inspired by [Pug](https://pugjs.org), [Imba Elements](https://imba.io/docs/tags), and [Tailwind CSS](https://tailwindcss.com).
  
  // d bg=green width=40 height=50 -- foo
  
  ### Basics

  Each element goes on its own line, and consists of the tag name, optionally followed by <code> -- </code> and any text content:
  VugDocsExample.mb-4 > pre
    --raw-- h3 -- Welcome to Vug!
    --raw-- p -- Let's describe Vug in a paragraph.
  
  You can add comments after a <code>//&nbsp;</code>, like in Javascript:
    aside -- (make sure there's a space after the <code>//</code> -- this helps to disambiguate from things like <code>https://example.com</code>)
  VugDocsExample.mb-4 code=(commentExampleCode)



  You can create nested structures of elements simply by indenting them appropriately:
  VugDocsExample.mb-4 > pre
    --raw-- div
    --raw--   p -- This paragraph is inside the div.
    --raw--   p -- So is this one.
    --raw-- p -- Here's a paragraph outside of the div.
    --raw-- p
    --raw--   -- Here's some plain text inside the paragraph,
    --raw--   -- and another line of plain text.

  In the case where an element has only one child, you can express it on one line using `>` (syntax similar to the CSS direct-child operator):
  VugDocsExample.mb-4 > pre
    --raw-- .card > .card-body -- Contents
    --raw-- ul > li > span -- List with a single list item containing a span

  ### Classes and IDs
  
  You can add CSS classes to to the tag name using the `.` character, just like in CSS itself:
  VugDocsExample.mb-4 > pre -- div.fancy -- Hello there
  p -- Multiple classes work too:
  VugDocsExample.mb-4 > pre -- button.btn.btn-primary -- Save
  Similarly, you can set the ID with the `#` character:
  VugDocsExample.mb-4 > pre -- div.bold#customerName -- ACME Industries
  If the tag is `div`, you can just write classes and/or IDs, and skip the tag name:
  VugDocsExample.mb-4 > pre 
    --raw-- .row
    --raw--   .col-3 
    --raw--   .col-9#mainColumn 
    --raw-- #footer

  ### Attributes and Inline Styles
  You can set attributes on elements just like in HTML:
  VugDocsExample.mb-4 > pre -- input type="text" value="Hello there"
  However, if the attribute value does not contain any spaces, you can skip the quotes
    aside -- (HTML also supports this, but in Vug, it fits in well with the language and is the idiomatic style):
  VugDocsExample.mb-4 > pre -- input type=text value="Multiple words still need quotes"
  Like in HTML, you can specify an attribute without a value, which is equivalent to setting it to `""`:
  VugDocsExample.mb-4 > pre -- input type=checkbox checked
  You can also set CSS attributes directly on the element. In HTML, you are probably used to doing this in a `style` attribute:
  VugDocsExample.mb-4 > pre -- div style="font-size: 1.5em; font-weight: bold;"
  But in Vug, we recognize all CSS property names, so you can set them directly on the element:
  VugDocsExample.mb-4 > pre -- div font-size=1.5em font-weight=bold
  p -- You can also bind an attribute to a dynamically computed value. See [Binding to Expressions](#binding-to-expressions).
  p -- See also: [CSS Shorthand](#css-shorthand), [CSS Macros](#css-macros)

  ### CSS Shorthand
  Vug provides the shorthand versions of many CSS properties, same as [Imba](https://imba.io/docs/css/properties):
  .row vg-let:all=Object.entries({ ac: "align-content", ai: "align-items", as: "align-self", b: "bottom", bc: "border-color", bcb: "border-bottom-color", bcl: "border-left-color", bcr: "border-right-color", bct: "border-top-color", bd: "border", bdb: "border-bottom", bdl: "border-left", bdr: "border-right", bdt: "border-top", bg: "background", bga: "background-attachment", bgc: "background-color", bgclip: "background-clip", bcgi: "background-image", bgo: "background-origin", bgp: "background-position", bgr: "background-repeat", bgs: "background-size", bs: "border-style", bsb: "border-bottom-style", bsl: "border-left-style", bsr: "border-right-style", bst: "border-top-style", bw: "border-width", bwb: "border-bottom-width", bwl: "border-left-width", bwr: "border-right-width", bwt: "border-top-width", c: "color", cg: "column-gap", d: "display", e: "ease", ec: "ease-colors", eo: "ease-opacity", et: "ease-transform", ff: "font-family", fl: "flex", flb: "flex-basis", fld: "flex-direction", flf: "flex-flow", flg: "flex-grow", fls: "flex-shrink", flw: "flex-wrap", fs: "font-size", fw: "font-weight", g: "gap", ga: "grid-area", gac: "grid-auto-columns", gaf: "grid-auto-flow", gar: "grid-auto-rows", gc: "grid-column", gce: "grid-column-end", gcg: "grid-column-gap", gcs: "grid-column-start", gr: "grid-row", gre: "grid-row-end", grg: "grid-row-gap", grs: "grid-row-start", gt: "grid-template", gta: "grid-template-areas", gtc: "grid-template-columns", gtr: "grid-template-rows", h: "height", jac: "place-content", jai: "place-items", jas: "place-self", jc: "justify-content", ji: "justify-items", js: "justify-self", l: "left", lh: "line-height", ls: "letter-spacing", m: "margin", mb: "margin-bottom", ml: "margin-left", mr: "margin-right", mt: "margin-top", o: "opacity", of: "overflow", ofa: "overflow-anchor", ofx: "overflow-x", ofy: "overflow-y", origin: "transform-origin", p: "padding", pb: "padding-bottom", pe: "pointer-events", pl: "padding-left", pos: "position", pr: "padding-right", pt: "padding-top", r: "right", rd: "border-radius", rdbl: "border-bottom-left-radius", rdbr: "border-bottom-right-radius", rdtl: "border-top-left-radius", rdtr: "border-top-right-radius", rg: "row-gap", shadow: "box-shadow", t: "top", ta: "text-align", td: "text-decoration", tdc: "text-decoration-color", tdl: "text-decoration-line", tds: "text-decoration-style", tdsi: "text-decoration-skip-ink", tdt: "text-decoration-thickness", te: "text-emphasis", tec: "text-emphasis-color", tep: "text-emphasis-position", tes: "text-emphasis-style", ts: "text-shadow", tt: "text-transform", tween: "transition", us: "user-select", va: "vertical-align", w: "width", ws: "white-space", zi: "z-index" })
    template vg-let:colLength="Math.trunc(all.length+1) / 3"
      .col-md-3 vg-each:col=[0, 1, 2].map(i => all.slice(i * colLength, i * colLength + colLength))
        ul > li v-for="[k,v] in col" -- `{{k}}` => `{{v}}`

  ### CSS Macros
  Besides for the regular CSS properties, Vug also supports these custom properties (macros) that compile into other properties:
  - `mx`: horizontal margin; compiles to `margin-left` and `margin-right`.
  - `my`: vertical margin; compiles to `margin-top` and `margin-bottom`.
  - `px`: horizontal padding; compiles to `padding-left` and `padding-right`.
  - `py`: vertical padding; compiles to `padding-top` and `padding-bottom`.
  - `sz`: size; compiles to `width` and `height`.
  - `circ` (without value): compiles to `border-radius=100%`.

  ### Custom Tag Types
  // TODO flex arg (or as macro)
  - `d`: short for `div`
  - `s`: short for `span`
  - `ib`, `inline-block`: short for `<div style="display: inline-block" />`
  - `f`, `flex`: short for `<div style="display: flex" />`
  VugDocsExample.mb-4 > pre
    --raw-- d -- This is a div
    --raw-- s.badge.bg-primary -- This is a span
    --raw-- ib bg=yellow -- This is an inline-block
    --raw-- f -- This is a flexbox
    --raw-- f:cc h=5em bg=lightgreen -- Centered flexbox

  ### Markdown
    s.badge.rounded-pill.bg-danger fs=0.4em -- EXPERIMENTAL
  
  Being that Vug is all about conciseness, it seems natural to support Markdown directly in Vue templates. This is useful for text-heavy pages.
  VugDocsExample.mb-4 > pre
    --raw-- flex:cc bg=#222 p=5em mb=1em
    --raw--   .card > .card-body
    --raw--     # Heading 1
    --raw--     ## Heading 2
    --raw--     ### Heading 3
    --raw--     #### Heading 4
    --raw--     ##### Heading 5
    --raw--     ###### Heading 6
    --raw--     
    --raw--     | _Regular_ paragraphs of text must start with the pipe (`|`) character.
    --raw--     | Otherwise, they would be confused with regular elements.
    --raw--     | Each line is a new paragraph.
    
    --raw-- - You can of course use [Markdown Syntax](https://www.markdownguide.org/basic-syntax/) inside these lines. **Bold**, _italics_, [links](#), etc.
    --raw-- - Unordered lists work too.
    --raw--   1. As well as ordered ones.
    --raw--   2. Indentation works the usual way.
    --raw--   3. Everything should work.
    --raw--   // - Starting a line with <code>#</code>, <code>##</code>, ... <code>######</code> will turn that line into a heading.
    
    --raw-- d.alert.alert-primary
    --raw--   | You can mix regular elements and _Markdown_.
    --raw--   ##### No problem at all.
    --raw--     span.badge.bg-success -- back to elements again

  ### Stylesheets Rules
    s.badge.rounded-pill.bg-warning fs=0.4em -- Vue only
  
  VugDocsExample.mb-4 > pre
    --raw-- div -- I'm green, but yellow on hover
    --raw--   css bg=green fs=2em
    --raw--   css:hover bg=yellow

  On the element, prefix with `*`:
  VugDocsExample.mb-4 > pre
    --raw-- button fs=2em *bg=red *bg:hover=yellow
  
  #### Variants
  When writing stylesheet rules, you can use the following variants to modify when or to what they should be applied:
  // For selectors, preferably check that they exist and otherwise error...
  - Any CSS selector, like `:hover`, `:focus`, `:active`, etc.
  - CSS pseudo-selectors, like `::before`, `::after`, `::placeholder`, etc.
  - The following CSS selector shorthands:
    - `:even`, `:odd` (compiles to `:nth-child(even)` and `:nth-child(odd)`)
    - `:first`, `:last` (compiles to `:first-child` and `:last-child`)
  - The following special selectors provided by Vug:
    - Responsive screen-width breakpoints (this applies your style if the current screen width is equal to or GREATER than the selected breakpoint):
      s vg-each=("sm md lg xl 2xl".split(' ')) -- `:{{it}}`&nbsp;
    - `:motion-safe, :motion-reduce`
    - `:enabled` (compiles to `:not(:disabled)`)
    - `:next` -- targets the adjacent element. Compiles to [`~`](https://developer.mozilla.org/en-US/docs/Web/CSS/Adjacent_sibling_combinator). Useful for things like `input:invalid:next.label`
    - `:sibling` -- targets any adjacent element. Compiles to [`+`](https://developer.mozilla.org/en-US/docs/Web/CSS/General_sibling_combinator)
    - `:child` -- targets any adjacent element. Compiles to [`+`](https://developer.mozilla.org/en-US/docs/Web/CSS/General_sibling_combinator)
      // (See [here](https://tailwindcss.com/docs/hover-focus-and-other-states#styling-based-on-sibling-state)), not sure why the `.peer` class is important, they could have done `input:invalid:next.label`
      // This is nearly perfect:
      // input placeholder="Email address"
      //   css:[&:focus::placeholder] o='0'
      // div -- Email address
      //   css pos=relative top=-1.73em left=0.2em transition="all 0.3s" pointer-events=none visibility=hidden o='0.5'
      //   css:[input:not(:placeholder-shown) ~ &, input:focus ~ &] top=-3.25em visibility=initial o='1'
    - `.` rules that apply only when a class is applied (TODO might be `:.active` or maybe `:class.active` or `:class-active` to avoid dots)
    - `@` rules that create a block (TODO syntax incl custom ones. And maybe it should be `:@media...` or even the generic way `:[@media]`)...
    - `~`, `+`, `>`? Or use selectors `:descendant:tag-p:class`
    - Negation
  
  #### OLD
  .alert bg=#FEA c=#222
    div -- This section is under construction. There is confusion between actual `:selectors`, our custom ones, CSS modifiers like `.active`, our version of that `:.active`...
    - Maybe support all the CSS selectors, including `.active`

  - CSS selectors:
    ul > li vg-each=(["hover", "focus", "active", "focus-within", "focus-visible", "disabled", "visited", "checked"]) -- `:{{it}}`
  - Special CSS selectors:
    
    - `:.someClass`
    - `:@someAtDirective(someParameter: 12px)`
    template vg-let:brkpts=("sm md lg xl 2xl".split(' '))
      - Responsive breakpoints:
        
      - Less-than those breakpoints: 
        s vg-each=brkpts mr=2q -- `:<{{it}}`
    - Negation: `:!hover`, `:!.active`, etc.



  ### Binding to Expressions
    s.badge.rounded-pill.bg-warning fs=0.4em -- Vue only
  To bind an attribute to a dynamically computed expression, wrap the expression in parentheses:
  VugDocsExample.mb-4 > pre --raw-- input value=(someObj.someProp)
  These can contain spaces:
  VugDocsExample.mb-4 > pre --raw-- input value=(someObj.someProp + someVariable)
  You can also bind to a template string:
  VugDocsExample.mb-4 > pre // TODO this should work even if in one line! Problem is it runs before the directChild macro 
    --raw-- input value=`${firstName} ${lastName}`
  Or an object literal:
  VugDocsExample.mb-4 > pre --raw-- PersonCard person={name: "Fred", age: 40}
  Or a number literal: (i.e. it will be bound as a number rather than a string)
  VugDocsExample.mb-4 > pre --raw-- CustomTable lines=12
  But note that in all other cases (i.e without parens or the options above), the value will be interpreted as a string:
  VugDocsExample.mb-4 > pre
    --raw-- /{{''}}/ This will be bound to the string 'numLines', not a variable
    --raw-- CustomTable lines=numLines 
  
  ##### Style Binding
  The same thing can be done for inline styles:
  VugDocsExample.mb-4 > pre --raw-- div bg=(important ? 'red' : 'white')

  ##### Conditional Classes
  Classes can be applied conditionally. No need for parens here as it's necessarily an expression, but you can use it if there are spaces:
  VugDocsExample.mb-4 > pre --raw-- a.link .active=isActive
  VugDocsExample.mb-4 > pre --raw-- a.link .active=(curTab === 2)
  VugDocsExample.mb-4 > pre --raw-- a.link .active.bold=(curTab === 3)


  ### Special Directives
    s.badge.rounded-pill.bg-warning fs=0.4em -- Vue only
  
  ##### `vg-each`
  Vug provides a more concise syntax for loops (compiles down to a regular `v-for`). You can access the element via the variable `it`, and the index (or key of an object) via `it_i`.
  VugDocsExample.mb-4 > pre -- div vg-each=items -- [[[[it.prop]]]]
  If desired, you can customize the name of the iteration variables using an argument: 
  VugDocsExample.mb-4 > pre -- div vg-each:foo=items -- [[[[foo.prop]]]]

  ##### `vg-let`
  Sets a new variable in the current scope. This is useful where you want to refer to it more than once (to be more DRY, or to save computing it twice).
    aside -- (This is accomplished by compiling to a <code>v-for</code> loop over a single-element array.)
  VugDocsExample.mb-4 > pre 
    --raw-- div vg-each=customers
    --raw--   .card vg-let:fullName=`${it.firstName} ${it.lastName}`
    --raw--     .card-heading -- [[[[fullName]]]]
    --raw--     .card-body > a -- Send a message to [[[[fullName]]]]

  ##### `vg-do`
  Runs code on the element once, as soon as it is inserted. The element is available as `$el`.
    aside -- (accomplished by abusing Vue's <a href="https://vuejs.org/guide/essentials/template-refs.html#function-refs">Function Refs</a> feature)
  VugDocsExample.mb-4 > pre 
    --raw-- input vg-do=$el.focus() 
    --raw-- div vg-do=customAnimationRoutine($el) 
  It is sometimes helpful to access global functions in these handlers (i.e. to break out of Vue's sandbox). Vug provides `${{''}}win` for this:
    aside -- (accomplished using `Array.constructor('return window')()`)
    aside -- (you can do this in any Vug attribute, like in `@click` handlers)
  VugDocsExample.mb-4 > pre 
    --raw-- input vg-do="${{''}}win.setTimeout(() => $el.focus(), 5000)"

</template>

<style scoped>
</style>
