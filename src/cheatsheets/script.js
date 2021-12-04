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

app.directive('click-outside', {
  beforeMount: (el, binding) => {
    el.clickOutsideEvent = event => {
      // here I check that click was outside the el and his children
      if (!(el === event.target || el.contains(event.target))) {
        // and if it did, call method provided in attribute value
        binding.value()
      }
    }
    setTimeout(() => document.addEventListener('click', el.clickOutsideEvent), 100)
  },
  unmounted: el => {
    document.removeEventListener('click', el.clickOutsideEvent)
  },
})

app.mount('#app')
