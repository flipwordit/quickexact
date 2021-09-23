<template>
  <div class="page">
    <Navbar >
      <input type="search" placeholder="Search" v-model="query" @input="filterWindows">
    </Navbar>
    <section class="main">
      <Window v-for="window of filteredWindows" :key="window.id" :meta="window" />
    </section>
  </div>
</template>

<script>
import tabsService from '@/services/tabs'

import Navbar from '@/popup/components/Navbar'
import Window from '@/popup/components/Window'

export default {
  name: 'tabs',
  components: {
    Navbar,
    Window,
  },
  data() {
    return {
      windows: [],
      query: '',
    }
  },
  computed: {
    filteredWindows() {
      if (this.query) {
        return this.windows.reduce((acc, window) => {
          const { tabs } = window
          const filteredTabs = tabs.filter(tab => tab.url.includes(this.query))
          if (filteredTabs.length) {
            const newWindow = { ...window, expanded: true, tabs: filteredTabs }
            return acc.concat(newWindow)
          }
          return acc
        }, [])
      }
      return this.windows
    },
  },
  async mounted() {
    this.windows = await tabsService.getWindows()
  },
}
</script>

<style>
.main {
  position: fixed;
  top: 90px;
  width: 100%;
  height: calc(100% - 90px);
  overflow: auto;
}
</style>
