<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import * as Vug from '../../../vug'
import { marked } from '../../../node_modules/marked/lib/marked.esm.js'
import VugDocsExample from './VugDocsExample.vue'

;(globalThis as any).convertMarkdownLine = (text: string) => { const ret: string = marked.parse(text); return ret.slice(3, ret.length - 5) }

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
      a.btn.btn-outline-light.btn-lg.px-4 type=button href=#documentation -- Docs
section.py-4 bg=#AAA
  h2.text-center -- Try it now!
  .container > VugDocsExample > pre
    -- .text-center.p-2 bg=green c=#FFF -- Hello from Vug!
    --   button.btn.btn-primary -- ♥ Like

.container.py-4#documentation
  css:[& aside] font-style=italic c=#777 d=inline
  h1 -- Documentation
  p -- Vug is a concise language for expressing DOM elements, inspired by <a href="https://pugjs.org">Pug</a>, <a href="https://imba.io/docs/tags">Imba Elements</a>, and <a href="https://tailwindcss.com">Tailwind CSS</a>.
  
  h3 -- Basics

  p -- Each element goes on its own line, and consists of the tag name, optionally followed by <code> -- </code> and any text content:
  VugDocsExample.mb-4 > pre
    -- h3 -- Welcome to Vug!
    -- p -- Let's describe Vug in a paragraph.
  
  p -- You can add comments after a <code>//&nbsp;</code>, like in Javascript:
    aside -- (make sure there's a space after the <code>//</code> -- this helps to disambiguate from things like <code>https://example.com</code>)
  VugDocsExample.mb-4 code=(commentExampleCode)



  p -- You can create nested structures of elements simply by indenting them appropriately:
  VugDocsExample.mb-4 > pre
    -- div
    --   p -- This paragraph is inside the div.
    --   p -- So is this one.
    -- p -- Here's a paragraph outside of the div.
    -- p
    --   -- Here's some plain text inside the paragraph,
    --   -- and another line of plain text.

  h3 -- Classes and IDs
  
  p -- You can add CSS classes to to the tag name using the <code>.</code> character, just like in CSS itself:
  VugDocsExample.mb-4 > pre -- div.fancy -- Hello there
  p -- Multiple classes work too:
  VugDocsExample.mb-4 > pre -- button.btn.btn-primary -- Save
  p -- Similarly, you can set the ID with the <code>#</code> character:
  VugDocsExample.mb-4 > pre -- div.bold#customerName -- ACME Industries
  p -- If the tag is <code>div</code>, you can just write classes and/or IDs, and skip the tag name:
  VugDocsExample.mb-4 > pre 
    -- .row
    --   .col-3 
    --   .col-9#mainColumn 
    -- #footer

  h3 -- Attributes and Inline Styles
  p -- You can set attributes on elements just like in HTML:
  VugDocsExample.mb-4 > pre -- input type="text" value="Hello there"
  p -- However, if the attribute value does not contain any spaces, you can skip the quotes
    aside -- (HTML also supports this, but in Vug, it fits in well with the language and is the idiomatic style):
  VugDocsExample.mb-4 > pre -- input type=text value="Multiple words still need quotes"
  p -- Like in HTML, you can specify an attribute without a value, which is equivalent to setting it to <code>&quot;&quot;</code>:
  VugDocsExample.mb-4 > pre -- input type=checkbox checked
  p -- You can also set CSS attributes directly on the element. In HTML, you are probably used to doing this in a <code>style</code> attribute:
  VugDocsExample.mb-4 > pre -- div style="font-size: 1.5em; font-weight: bold;"
  p -- But in Vug, we recognize all CSS property names, so you can set them directly on the element:
  VugDocsExample.mb-4 > pre -- div font-size=1.5em font-weight=bold
  // TODO link to shorthand etc, and to binding

  h3 -- CSS Shorthand
  // TODO

  h3 -- CSS Macros

  h3 -- Custom Tag Types
  p -- Including flex macros or arg

  h3
    -- Stylesheets
    s.badge.rounded-pill.bg-warning fs=0.4em -- Vue only
  p -- Including on the element itself

  h3 
    -- Binding to Expressions
    s.badge.rounded-pill.bg-warning fs=0.4em -- Vue only

  h3
    -- Special Directives
    s.badge.rounded-pill.bg-warning fs=0.4em -- Vue only
  
  h5 > code -- vg-each
  p -- Vug provides a more concise syntax for loops (compiles down to a regular <code>v-for</code>). You can access the element via the variable <code>it</code>, and the index (or key of an object) via <code>it_i</code>.
  VugDocsExample.mb-4 > pre -- div vg-each=items -- [[[[it.prop]]]]
  p -- If desired, you can customize the name of the iteration variables using an argument: 
  VugDocsExample.mb-4 > pre -- div vg-each:foo=items -- [[[[foo.prop]]]]

  h5 > code -- vg-let
  p -- Sets a new variable in the current scope. This is useful where you want to refer to it more than once (to be more DRY, or to save computing it twice).
    aside -- (This is accomplished by compiling to a <code>v-for</code> loop over a single-element array.)
  VugDocsExample.mb-4 > pre 
    -- div vg-each=customers
    --   .card vg-let:fullName=`${it.firstName} ${it.lastName}`
    --     .card-heading -- [[[[fullName]]]]
    --     // More elements here...
    --     .card-body > a -- Send a message to [[[[fullName]]]]

  h5 > code -- vg-do
  p -- Lets you run code on the element as soon as it is inserted. The element is available as <code>$el</code>.
    aside -- (accomplished using Vue's <a href="#">Function Refs</a> feature)
  VugDocsExample.mb-4 > pre 
    -- input vg-do=$el.focus() 
    -- div vg-do=customAnimationRoutine($el) 
  p -- It is sometimes helpful to access global functions in these handlers (i.e. to break out of Vue's sandbox). Vug provides <code>${{''}}win</code> for this:
    aside -- (accomplished using <code>Array.constructor('return window')()</code>)
    aside -- (you can do this in any Vug attribute, like in <code>@click</code> handlers)
  VugDocsExample.mb-4 > pre 
    -- input vg-do="${{''}}win.setTimeout(() => $el.focus(), 5000)"



</template>

<style scoped>
</style>
