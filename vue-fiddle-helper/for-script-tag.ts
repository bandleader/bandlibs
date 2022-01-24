import * as Vue from '../../TableSeater4/frontend/node_modules/vue/dist/vue.esm-browser'
import { initApp } from './main-helper'
import * as VCP from '../vue-class-plus'
import * as Vug from '../vug'

// Expose the included libraries globally
Object.assign(window, { VCP, Vug })

initApp(Vue)

