import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as Vug from '../dist/vug.cjs'

// https://vitejs.dev/config/
export default defineConfig({
  base: "/bandlibs",
  plugins: [Vug.ViteTransformPlugin({_tempLangVersion: 2}), vue()],
})
