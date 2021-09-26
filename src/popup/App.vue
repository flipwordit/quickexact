<template>
  <div class="popup">
    <Navbar><input type="search" placeholder="Search" v-model="query" @input="fetchWindows"/></Navbar>
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="Tabs" name="tabs">
        <tabs />
      </el-tab-pane>
      <el-tab-pane label="Sessions" name="sessions">
        <sessions />
      </el-tab-pane>
      <el-tab-pane label="Bookmarks" name="bookmarks">
        <bookmarks />
      </el-tab-pane>
      <el-tab-pane label="History" name="history">
        <bookmarks />
      </el-tab-pane>
      <el-tab-pane label="Incognito" name="incognito">
        <bookmarks />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import Navbar from '@/popup/components/Navbar'
import tabs from '@/popup/pages/tabs'
import sessions from '@/popup/pages/sessions'
import bookmarks from '@/popup/pages/bookmarks'

export default {
  name: 'Popup',
  components: {
    tabs,
    sessions,
    bookmarks,
    Navbar,
  },
  data() {
    return {
      activeName: 'tabs',
      query: '',
    }
  },
  mounted() {
    this.collectWindows()
  },
  methods: {
    ...mapActions(['collectWindows']),
    fetchWindows() {
      this.collectWindows(this.query)
    },
    handleClick(tab, event) {
      console.log(tab, event)
    },

  },
}
</script>
<style lang="scss">
 .el-tabs__header {
   margin:0;
 }
 .el-tabs__nav {
    width: 100% !important;
    display: flex;
    justify-content: space-evenly;
 }
</style>
