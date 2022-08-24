import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as Vug from '../dist/vug.cjs'

// Enable Markdown in Vug
import { marked } from '../node_modules/marked/lib/marked.esm' // Not sure why it fails when I just say 'marked'. This was on the GitHub runner: Cannot find module 'marked'
globalThis.convertMarkdownLine = (text: string) => { const ret: string = marked.parse(text); return ret.slice(3, ret.length - 5) }

// https://vitejs.dev/config/
export default defineConfig({
  base: "/bandlibs",
  plugins: [Vug.ViteTransformPlugin({_tempLangVersion: 2}), vue()],
})
