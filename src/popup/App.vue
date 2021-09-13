<template>
  <div class="popup">
  <Navbar />
  </div>
</template>

<script>
import storage from '@/utils/storage'
import Navbar from './components/Navbar'

export default {
  name: 'Popup',
  data() {
    return {
      backgroundColor: 'white',
    }
  },
  components: {
    Navbar,
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
    },
  },
}
</script>
<style lang="scss">
</style>
