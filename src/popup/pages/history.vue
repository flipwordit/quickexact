<template>
  <div class="page">
    <!-- <Navbar >
      <input type="search" placeholder="Search" v-model="query" @input="filterWindows">
    </Navbar> -->
    <section class="main">
      <Record v-for="record of records" :key="record.id" :record="record" />
    </section>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
// import tabsService from '@/services/tabs'
// import draggable from '@/vuedraggable'

// import Navbar from '@/popup/components/Navbar'
import Record from '@/popup/components/Record'

export default {
  name: 'tabs',
  components: {
    // Navbar,
    Record,
  },
  computed: {
    ...mapGetters({
      records: 'getRecords',
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
/* .main {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  position: fixed;
  top: 90px;
  width: 100%;
  height: calc(100% - 90px);
  overflow: auto;
  background: hsl(203deg, 34%, 95%);;
} */
</style>
