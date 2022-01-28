import * as Vue from 'vue/dist/vue.esm-browser'
import { initApp } from './'
import * as VCP from '../vue-class-plus'
import * as Vug from '../vug'

// Expose the included libraries globally
Object.assign(window, { VCP, Vug })

initApp(Vue)

