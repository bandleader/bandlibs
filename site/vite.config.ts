import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import * as Vug from '../dist/vug.cjs'
import * as Vug from '../vug'

// https://vitejs.dev/config/
export default defineConfig({
  base: "/bandlibs",
  plugins: [Vug.ViteTransformPlugin({_tempLangVersion: 2}), vue()],
})
