<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import * as Vug from '../../../vug'
import { marked } from '../../node_modules/marked/lib/marked.esm.js'
import VugDocsExample from './VugDocsExample.vue'

;(globalThis as any).convertMarkdown = (text: string) => marked.parse(text)

const commentExampleCode = `h3 -- Welcome to Vug! // This is a comment\n// This is also a comment`

/* 
TODO:
- Syntax-highlight the HTML
- Syntax-highlight the left side
- Make the left side Monaco

To add to docs:
- CSS shorthand
- CSS macros
  - Flex macro
- CSS units
- Custom tag types
- HTML on right side
- HTML on left side
- Direct children
- Binding to expression (incl styles)
  - Conditional classes
  - Objects/templates/numbers
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
  - Saves you **plenty** of time
  - Works well
  
  ### Basics

  Each element goes on its own line, and consists of the tag name, optionally followed by <code> -- </code> and any text content:
  VugDocsExample.mb-4 > pre
    raw -- h3 -- Welcome to Vug!
    raw -- p -- Let's describe Vug in a paragraph.
  
  You can add comments after a <code>//&nbsp;</code>, like in Javascript:
    aside -- (make sure there's a space after the <code>//</code> -- this helps to disambiguate from things like <code>https://example.com</code>)
  VugDocsExample.mb-4 code=(commentExampleCode)



  You can create nested structures of elements simply by indenting them appropriately:
  VugDocsExample.mb-4 > pre
    raw -- div
    raw --   p -- This paragraph is inside the div.
    raw --   p -- So is this one.
    raw -- p -- Here's a paragraph outside of the div.
    raw -- p
    raw --   -- Here's some plain text inside the paragraph,
    raw --   -- and another line of plain text.

  ### Classes and IDs
  
  You can add CSS classes to to the tag name using the `.` character, just like in CSS itself:
  VugDocsExample.mb-4 > pre -- div.fancy -- Hello there
  Multiple classes work too:
  VugDocsExample.mb-4 > pre -- button.btn.btn-primary -- Save
  Similarly, you can set the ID with the `#` character:
  VugDocsExample.mb-4 > pre -- div.bold#customerName -- ACME Industries
  If the tag is `div`, you can just write classes and/or IDs, and skip the tag name:
  VugDocsExample.mb-4 > pre 
    raw -- .row
    raw --   .col-3 
    raw --   .col-9#mainColumn 
    raw -- #footer

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
  // TODO link to shorthand etc, and to binding

  ### CSS Shorthand
  // TODO

  ### CSS Macros

  ### Custom Tag Types
  Including flex macros or arg

  ### Markdown
    s.badge.rounded-pill.bg-danger fs=0.4em -- EXPERIMENTAL
  
  Being that Vug is all about conciseness, it seems natural to support Markdown directly in Vue templates. This is useful for text-heavy pages.
  VugDocsExample.mb-4 > pre
    raw -- flex:c.c bg=#222 p=5em mb=1em
    raw --   .card > .card-body
    raw --     # Heading 1
    raw --     ## Heading 2
    raw --     ### Heading 3
    raw --     #### Heading 4
    raw --     ##### Heading 5
    raw --     ###### Heading 6
    raw --     
    raw --     | _Regular_ paragraphs of text must start with the pipe (`|`) character.
    raw --     | Otherwise, they would be confused with regular elements.
    raw --     | Each line is a new paragraph.
    
    raw -- - You can of course use [Markdown Syntax](https://www.markdownguide.org/basic-syntax/) inside these lines. **Bold**, _italics_, [links](#), etc.
    raw -- - Unordered lists work too.
    raw --   1. As well as ordered ones.
    raw --   2. Indentation works the usual way.
    raw --   3. Everything should work.
    raw --   // - Starting a line with <code>#</code>, <code>##</code>, ... <code>######</code> will turn that line into a heading.
    
    raw -- d.alert.alert-primary
    raw --   | You can mix regular elements and _Markdown_.
    raw --   ##### No problem at all.
    raw --     span.badge.bg-success -- back to elements again

  ### Stylesheets
    s.badge.rounded-pill.bg-warning fs=0.4em -- Vue only
  Including on the element itself

  ### Binding to Expressions
    s.badge.rounded-pill.bg-warning fs=0.4em -- Vue only

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
    raw -- div vg-each=customers
    raw --   .card vg-let:fullName=`${it.firstName} ${it.lastName}`
    raw --     .card-heading -- [[[[fullName]]]]
    raw --     /{{''}}/ More elements here...
    raw --     .card-body > a -- Send a message to [[[[fullName]]]]

  ##### `vg-do`
  Runs code on the element once, as soon as it is inserted. The element is available as `$el`.
    aside -- (accomplished using Vue's <a href="https://vuejs.org/guide/essentials/template-refs.html#function-refs">Function Refs</a> feature)
  VugDocsExample.mb-4 > pre 
    raw -- input vg-do=$el.focus() 
    raw -- div vg-do=customAnimationRoutine($el) 
  It is sometimes helpful to access global functions in these handlers (i.e. to break out of Vue's sandbox). Vug provides `${{''}}win` for this:
    aside -- (accomplished using `Array.constructor('return window')()`)
    aside -- (you can do this in any Vug attribute, like in `@click` handlers)
  VugDocsExample.mb-4 > pre 
    raw -- input vg-do="${{''}}win.setTimeout(() => $el.focus(), 5000)"

</template>

<style scoped>
</style>
