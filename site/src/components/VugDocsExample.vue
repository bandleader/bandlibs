<script setup lang="ts">
import { ref, computed, onMounted, watch, getCurrentInstance } from 'vue'
import * as Vug from '../../../vug'
const props = defineProps<{ code?: string }>()
const input = computed(() => {
    const get = props.code || String(getCurrentInstance().slots.default()[0].children) 
    const lines = get.split('\n')
    const minIndent = Math.min(...lines.filter(x => x.trim().length).map(x => x.length - x.trimStart().length))
    return lines.map(x => x.slice(minIndent)).join("\n")
})
const output = computed(() => Vug.load(input.value, {_tempLangVersion: 2}).toVueTemplate(true))
</script>

<template>
    <div class="row">
        <div class="col-6">
            <div style="#AAA">Vug</div>
            <div class="code" style="color: #FFF" v-text="input" />
        </div>
        <div class="col-6">
            <div style="#AAA">HTML</div>
            <div class="code" style="color: rgb(200 200 255)" v-text="output" />
        </div>
    </div>
</template>

<style scoped>
    .code { width: 100%; padding: 0.5em; background: #333; font-family: 'Courier New', Courier, monospace; font-size: 0.8em; white-space: pre-wrap; }
</style>
