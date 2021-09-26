<template>
  <div class="page">
    <!-- <Navbar >
      <input type="search" placeholder="Search" v-model="query" @input="filterWindows">
    </Navbar> -->
    <section class="main">
      <Window v-for="window of windows" :key="window.id" :meta="window" />
    </section>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
// import tabsService from '@/services/tabs'
// import draggable from '@/vuedraggable'

// import Navbar from '@/popup/components/Navbar'
import Window from '@/popup/components/Window'

export default {
  name: 'tabs',
  components: {
    // Navbar,
    Window,
  },
  computed: {
    ...mapGetters({
      windows: 'getWindows',
    }),
    // filteredWindows() {
    //   if (this.query) {
    //     return this.windows.reduce((acc, window) => {
    //       const { tabs } = window
    //       const filteredTabs = tabs.filter(tab => tab.url.includes(this.query))
    //       if (filteredTabs.length) {
    //         const newWindow = { ...window, expanded: true, tabs: filteredTabs }
    //         return acc.concat(newWindow)
    //       }
    //       return acc
    //     }, [])
    //   }
    //   return this.windows
    // },
  },
}
</script>

<style>
.main {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  position: fixed;
  top: 90px;
  width: 100%;
  height: calc(100% - 90px);
  overflow: auto;
}
</style>
