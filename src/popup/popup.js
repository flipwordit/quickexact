// eslint-disable-next-line import/no-unresolved
import 'windi.css'
import './popup.scss'
import 'element-plus/dist/index.css'

import { createApp } from 'vue'

import ElementPlus from 'element-plus'
import VueFeather from 'vue-feather'

import App from './App'

const app = createApp(App)

app.use(ElementPlus)
app.component(VueFeather.name, VueFeather)

app.mount('#app')
