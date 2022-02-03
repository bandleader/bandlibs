<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import * as Vug from '../../../vug'
import React from 'react'
import ReactDOM from 'react-dom'
import Monaco from './Monaco.vue'

function genHooksComponent(txt: string, renderFuncText: string) {
  const useState = React.useState  
  const ref = function<T>(deflt: T) {  // Just expirementing with supporting Vue-style refs in React
    const [gett,sett] = useState(deflt)
    return { 
      get value() { return gett },
      set value(v) { sett(v) }
    }
  }
  return eval(txt.replace('%%%', renderFuncText))
}

const classNames = (...objs: any[]) => {
  const ret = new Set<string>()
  for (const arg of objs) {
    if (typeof arg === 'string') {
      ret.add(arg)
    } else {
      for (const key in arg) {
        if (arg[key]) ret.add(key)
      }
    }
  }
  return Array.from(ret).join(" ")
}

// Earlier we used class components
// class Hello extends React.Component {
//   render() { 
//     try {
//       return eval(output.value)
//     } catch (error) {
//       return React.createElement("p", null, String(error))
//     }
//   }
// }


const functionText = ref('(function Example() {\n  const [count, setCount] = useState(0)\n  return vugReact`\n    div bg=#EEE p=0.5em\n      h5 fw=bold -- Hello from Vug in React!\n      p -- You clicked {{count}} times\n      button @click="() => setCount(count+1)" -- Increment\n`\n})')
const outputComponentCode = computed(() => Vug.transformVugReact(functionText.value))
const outputComponent = computed(() => genHooksComponent(outputComponentCode.value, "not supposed to happen")) // genHooksComponent(functionText.value, output.value))

function refresh() {
  ReactDOM.render(React.createElement(outputComponent.value, { /*props*/ }), document.getElementById('preview'))
}
onMounted(() => {
  refresh()
  watch(() => outputComponent.value, refresh)
})

</script>

<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-6">
        <h3>React component function</h3>
        <Monaco v-model="functionText" />
      </div>
      <div class="col-6">
        <h3>Running component</h3>
        <div id="preview">Loading</div>
        <br>
        <h5>Generated expression</h5>
        <textarea :value="outputComponentCode" style="height: 10em" />
      </div>
    </div>
  </div>
</template>

<style scoped>
  textarea { width: 100%; height: 20em; font-family: monospace; font-size: 0.85rem }
</style>
