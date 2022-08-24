<script setup lang="ts">
import { getCurrentInstance } from 'vue';
import MainPlayground from './components/MainPlayground.vue'
import VugDocs from './components/VugDocs.vue';
const inst = getCurrentInstance()
window.addEventListener('popstate', () => inst!.update())
setTimeout(() => inst!.update(), 10)
</script>

<template lang="vug">
route path=/vug > VugDocs
route path=/
  f:|c.c h=100vh
    ### **Bandlibs**: a collection of libraries.
    | For more information, check the [README](//github.com/bandleader/bandlibs).
    | Some of the libraries have websites here:
    d
      a.btn.btn-primary v-for="x in 'Vug'.split(' ')" to-route=`/${x.toLowerCase()}` fs=2em -- {{x}}
      
</template>

<style>
  a.nonLink { color: inherit; text-decoration: none; }
  .hoverable:hover { background: #EEE; }
</style>
