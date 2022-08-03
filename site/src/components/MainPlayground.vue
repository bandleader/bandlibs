<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import * as Vug from '../../../vug'
import * as Vug2 from '../../../vug/parsing'


const vugSource = ref('div bg=#EEE p=0.5em\n      h5 fw=bold -- Hello from Vug in React!\n      p -- You clicked {{count}} times\n      button @click="() => setCount(count+1)" -- Increment')
const output = computed(() => Vug2.compile(vugSource.value))
</script>

<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-6">
        <h3>React component function</h3>
        <!-- <Monaco v-model="functionText" /> -->
        <textarea v-model="vugSource" style="height: 40em" />
      </div>
      <div class="col-6">
        <!-- <h3>Running component</h3>
        <div id="preview">Loading</div>
        <br> -->
        <h5>AST</h5>
        <textarea :value="output.toAstJson()" style="height: 40em" />

        <h5>Vue template</h5>
        <textarea :value="output.toVueTemplate()" style="height: 40em" />

        <h5>HTML preview</h5>
        <div v-html="output.toVueTemplate()" />
      </div>
    </div>
  </div>
</template>

<style scoped>
  textarea { width: 100%; height: 20em; font-family: monospace; font-size: 0.85rem }
</style>
