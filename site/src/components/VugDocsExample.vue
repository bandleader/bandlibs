<script setup lang="ts">
import { ref, computed, getCurrentInstance, h } from 'vue'
import * as Vug from '../../../vug'
const props = defineProps<{ code?: string }>()
const initialInput = (function() {
    const getCodeFromSlot = (children: any = getCurrentInstance().slots.default()[0].children): string => typeof children === 'string' ? children : children.children ? getCodeFromSlot(children.children) : Array.isArray(children) ? children.map(getCodeFromSlot).join("") : `Unknown children type: ${JSON.stringify(children)}`
    let get = props.code || getCodeFromSlot()
    get = get.replace(/\[\[/g,'{').replace(/\]\]/g,'}')
    const lines = get.split('\n')
    const minIndent = Math.min(...lines.filter(x => x.trim().length).map(x => x.length - x.trimStart().length))
    return lines.map(x => x.slice(minIndent)).join("\n")
})()
const input = ref(initialInput)
const output = computed(() => Vug.load(input.value, {_tempLangVersion: 2}).toVueTemplate(true))
const outputRenderFunc = computed(() => Vug.load(input.value, {_tempLangVersion: 2}).toRenderFunc().replace(/React\.createElement\(/g, 'h(')) 
const compiledVueComp = computed(() => { return { render: () => Function('h', `return (${outputRenderFunc.value})`)(h) } }) // purposely not precompiling because we don't want errors until you switch to that view. Although I found that even with the below line that does precompile, it won't cause problems because computed() is lazy
// const compiledVueComp = computed(() => { const render = Function('h', `return (${outputRenderFunc.value})`); return { render: () => render(h) } })
// note that you don't strictly need to call a Vue comp; you could output vnodes directly
const inputDiv = ref<HTMLElement>()
const tabChoices = ["HTML", "HTML Rendering", "Render Function", "Vue rendering"]
const tabIndex = ref(0)
setInterval(() => { if (inputDiv.value) input.value = inputDiv.value.innerText }, 500) // TODO optimize
</script>

<template>
    <div class="row">
        <div class="col-md-6">
            <div class="subtitle">Vug</div>
            <div contenteditable class="code" style="color: #FFF" v-text="initialInput" ref="inputDiv" />
        </div>
        <div class="col-md-6">
            <a href="javascript:void(0)" class="subtitle nonLink hoverable" title="Switch views" @click="tabIndex = (tabIndex + 1) % tabChoices.length" v-text="tabChoices[tabIndex]" />
            <div v-if="tabIndex===0" class="code" style="color: rgb(200 200 255)" v-text="output" />
            <div v-if="tabIndex===1" style="padding: 0.25em; background: #FFF; border: 1px solid #AAA" v-html="output" />
            <div v-if="tabIndex===2" class="code" style="color: rgb(200 200 255)" v-text="outputRenderFunc" />
            <div v-if="tabIndex===3" style="padding: 0.25em; background: #FFF; border: 1px solid #AAA"><component :is="compiledVueComp" /></div>
        </div>
    </div>
</template>

<style scoped>
    .code { width: 100%; padding: 0.5em; background: #333; font-family: 'Courier New', Courier, monospace; font-size: 0.8em; white-space: pre-wrap; text-align: left; }
    .subtitle { float: right; background: #AAA; border-radius: 0.2em; opacity: 0.7; padding: 0.07rem 0.15rem; font-size: 0.7em; }
</style>
