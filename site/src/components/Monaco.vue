<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { addEl } from '../../../utils'
const props = defineProps<{modelValue: string, language: string, theme: string}>()
const emit = defineEmits(['update:modelValue'])
const monacoContainer = ref<HTMLElement>(null as any)
// TODO: Update Monaco when our modelValue changes

async function initMonaco() {
  await addEl(document.head, 'script', { src: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.26.1/min/vs/loader.min.js" })
  const w: any = window
  w.require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.26.1/min/vs' }})
  w.require(["vs/editor/editor.main"], () => {
    const ed = w.monaco.editor.create(monacoContainer.value, {
      value: props.modelValue,
      language: props.language || 'javascript',
      theme: props.theme || 'vs-light',
      minimap: { enabled: false },
      automaticLayout: true
    })
    ed.getModel().onDidChangeContent((event: any) => {
      emit('update:modelValue', ed.getValue())
    })
  })
}
onMounted(initMonaco)
</script>

<template>
  <div ref="monacoContainer" style="height:400px;border:1px solid black" />
</template>

<style scoped>
  textarea { width: 100%; height: 20em; font-family: monospace; font-size: 0.85rem }
</style>
