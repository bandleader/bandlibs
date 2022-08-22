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
  VugDocsExample > pre
    -- p -- Hello there!
    -- p -- I think it's fine
</template>

<style scoped>
</style>
