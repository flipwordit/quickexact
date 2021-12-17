import { createApp } from 'vue'

import ElementPlus from 'element-plus'
import VueFeather from 'vue-feather'
import axios from 'axios'
import VueAxios from 'vue-axios'

import App from './Login'
import storage from '@/utils/storage'
import { redirectCurrentTab } from '@/src_jq/common/commonFunctions'


storage.get('app-uuid')
  .then((value) => {
    if (!value) {
      const app = createApp(App)

      app.use(ElementPlus)
      app.use(VueAxios, axios)
      app.component(VueFeather.name, VueFeather)

      app.mount('#app')
    } else {
      redirectCurrentTab('/cheatsheets/page.html')
    }
  })
