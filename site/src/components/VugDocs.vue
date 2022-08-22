<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import * as Vug from '../../../vug'
import VugDocsExample from './VugDocsExample.vue';
</script>

<template lang="vug">
.bg-dark.text-secondary.px-4.py-5.text-center bg=#222!important > .py-5
  .display-5.fw-bold.text-white -- Prototype at warp speed with real HTML
  .col-lg-6.mx-auto
    p
    p.fs-5.mb-4 c=#FFF -- Vug lets you write HTML so concisely, you can prototype at warp speed and push the code straight into production. Try it yourself: 
    .d-grid.gap-2.d-sm-flex.justify-content-sm-center
      button.btn.btn-outline-info.btn-lg.px-4.me-sm-3.fw-bold type=button -- Get started
      button.btn.btn-outline-light.btn-lg.px-4 type=button -- Docs
.container.py-4
  h2 -- Vug documentation
  p -- Vug is a concise language for expressing DOM elements, inspired by <a href="https://pugjs.org">Pug</a>, <a href="https://imba.io/docs/tags">Imba Elements</a>, and <a href="https://tailwindcss.com">Tailwind CSS</a>.
  
  h3 -- Basics

  p -- Each element goes on its own line, and consists of the tag name, optionally followed by <code> -- </code> and any text content:
  VugDocsExample.mb-4 > pre
    -- h3 -- Welcome to Vug!
    -- p -- Let's describe Vug in a paragraph.

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
    i c=#777 -- (HTML also supports this, but in Vug, it fits in well with the language and is the idiomatic style):
  VugDocsExample.mb-4 > pre -- input type=text value="Multiple words still need quotes"



</template>

<style scoped>
</style>
