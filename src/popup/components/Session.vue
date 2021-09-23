<template>
  <div class="session">
    <div class="header">
      <div class="title">Vue3</div>
      <div class="count">23</div>
    </div>
    <div class="body">
      <div class="row">
        <div class="link">Vue 3</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Session',
  data() {
    return {

    }
  },

  mounted() {
    this.getTabs()
  },
  methods: {
    async getTabs() {
      const tabs = await chrome.windows.getAll()
      console.log(tabs)
    },
  },

}
</script>

<style>

</style>
