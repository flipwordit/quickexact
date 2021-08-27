<template>
  <div class="page" :style="{backgroundColor}">
    <n-button @click="changeColor">naive-ui</n-button>
  </div>
</template>

<script>
import { NButton } from 'naive-ui'
import storage from '../utils/chromeStorage'

export default {
  name: 'Popup',
  data() {
    return {
      backgroundColor: 'white',
    }
  },
  components: {
    NButton,
  },
  methods: {
    logger() {
      console.log('click')
    },
    async changeColor() {
      const backgroundColor = await storage.get(['color'])
      console.log(backgroundColor)
      this.backgroundColor = backgroundColor
      // The body of this function will be execuetd as a content script inside the
      // current page
      async function setPageBackgroundColor() {
        const color = await storage.get(['color'])
        console.log(color)
        document.body.style.backgroundColor = color
      }
      // When the button is clicked, inject setPageBackgroundColor into current page
      let [tab] = chrome.tabs.query({ active: true, currentWindow: true })

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: setPageBackgroundColor,
      })
    },
  },
}
</script>
