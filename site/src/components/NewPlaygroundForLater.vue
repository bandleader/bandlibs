<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import * as Vug from '../../../vug'
import * as Vug2 from '../../../vug/parsing'
import VugDocsExample from './VugDocsExample.vue'

const vugSource = ref('div bg=#EEE p=0.5em\n      h5 fw=bold -- Hello from Vug in React!\n      p -- You clicked {{count}} times\n      button @click="() => setCount(count+1)" -- Increment')
const output = computed(() => Vug2.compile(vugSource.value))
</script>

<template lang="vug">
d.text-center w=calc(100% - 1rem)
  VugDocsExample code=(vugSource) p=0.5rem
    css:[& .code] h=calc(100vh - 3rem)
</template>

<style scoped>
</style>
