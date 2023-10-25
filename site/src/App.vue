<script setup lang="ts">
import MainPlayground from './components/MainPlayground.vue'
import VugDocs from './components/VugDocs.vue';
import { defineComponent } from 'vue';
import _NofTest from '../../nof'
const NofTest = defineComponent({ setup: () => (_NofTest(), () => null) })
</script>

<template lang="vug">
route path=/vug/playground > MainPlayground
route path=/vug > VugDocs
route path=/nof > NofTest
route path=/
  f:|cc h=100vh
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
