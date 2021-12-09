// eslint-disable-next-line import/no-unresolved
import 'windi.css'
import './styles.scss'
import 'element-plus/dist/index.css'

import { createApp } from 'vue'

import ElementPlus from 'element-plus'
import VueFeather from 'vue-feather'
import store from '@/store'

import App from './App'

const app = createApp(App)
app.use(store)

app.use(ElementPlus)
app.component(VueFeather.name, VueFeather)

app.mount('#app')
