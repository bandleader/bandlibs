<script setup lang="ts">
import { ref, computed, onMounted, watch, getCurrentInstance } from 'vue'
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
const render = ref(false)
const output = computed(() => Vug.load(input.value, {_tempLangVersion: 2}).toVueTemplate(true))
const inputDiv = ref<HTMLElement>()
setInterval(() => { if (inputDiv.value) input.value = inputDiv.value.innerText }, 500) // TODO optimize
</script>

<template>
    <div class="row">
        <div class="col-6">
            <div class="subtitle">Vug</div>
            <div contenteditable class="code" style="color: #FFF" v-text="initialInput" ref="inputDiv" />
        </div>
        <div class="col-6">
            <a href="javascript:void(0)" class="subtitle nonLink hoverable" title="Switched to rendered output" @click="render = !render" v-text="render ? 'Rendered' : 'HTML'" />
            <div v-if="render" style="padding: 0.5em; border: 1px solid #AAA" v-html="output" />
            <template v-else>
                <div class="code" style="color: rgb(200 200 255)" v-text="output" />
            </template>
        </div>
    </div>
</template>

<style scoped>
    .code { width: 100%; padding: 0.5em; background: #333; font-family: 'Courier New', Courier, monospace; font-size: 0.8em; white-space: pre-wrap; }
    .subtitle { float: right; background: #AAA; border-radius: 0.2em; opacity: 0.7; padding: 0.07rem 0.15rem; font-size: 0.7em; }
</style>
