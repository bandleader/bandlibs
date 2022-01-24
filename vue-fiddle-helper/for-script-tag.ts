import * as Vue from 'vue/dist/vue.esm-browser'
import { initApp } from './main-helper'
import * as VCP from '../vue-class-plus'
import * as Vug from '../vug'

// Expose the included libraries globally
Object.assign(window, { VCP, Vug })

initApp(Vue)

