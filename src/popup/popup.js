import './popup.scss'
import 'element-plus/dist/index.css'
import Markdown from 'vue3-markdown-it'

import { createApp } from 'vue'

import ElementPlus from 'element-plus'
import VueFeather from 'vue-feather'
import clickOutside from '../utils/clickOutside'
import store from '@/store'

import App from './App'

const app = createApp(App)
app.directive('click-outside', clickOutside)
app.use(store)
app.use(Markdown)

app.use(ElementPlus)
app.component(VueFeather.name, VueFeather)

app.mount('#app')
