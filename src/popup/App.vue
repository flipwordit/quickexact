<template>
  <n-button @click="logger">naive-ui</n-button>
</template>

<script>
import { NButton } from 'naive-ui'

export default {
  name : 'Popup',
  components: {
      NButton
  },
  methods:{
    logger(){
      console.log('click')
    }
    
  }
}
</script>

<style>

</style>