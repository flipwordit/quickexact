<template>
  <div class="popup">
    <Navbar>
      <input type="search" placeholder="Search" v-model="query" @input="fetchWindows"/>
      <div class="actions">

      </div>
    </Navbar>
    <main>
      <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane :label="tabsCount +' Tabs'" name="tabs">
        <tabs />
      </el-tab-pane>
      <el-tab-pane label="Sessions" name="sessions">
        <sessions />
      </el-tab-pane>
      <el-tab-pane label="Bookmarks" name="bookmarks">
        <bookmarks />
      </el-tab-pane>
      <el-tab-pane :label="recordsCount + ' History'" name="history">
        <history />
      </el-tab-pane>
    </el-tabs>
    </main>

    <footer class="recorder" v-if="false">
      <div class="name">Session</div>
    </footer>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import Navbar from '@/popup/components/Navbar'
import tabs from '@/popup/pages/tabs'
import sessions from '@/popup/pages/sessions'
import bookmarks from '@/popup/pages/bookmarks'
import history from './pages/history'

export default {
  name: 'Popup',
  components: {
    tabs,
    sessions,
    bookmarks,
    Navbar,
    history,
  },
  data() {
    return {
      activeName: 'sessions',
      query: '',
    }
  },
  mounted() {
    this.collectWindows()
    this.collectHistory()
    this.collectBookmarks()
  },
  computed: {
    ...mapGetters(['tabsCount', 'recordsCount']),
  },
  methods: {
    ...mapActions([
      'collectWindows', 'collectHistory', 'collectBookmarks',
    ]),

    fetchWindows() {
      console.log('fetchWindows')
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
 .recorder {
   position: fixed;
   bottom: 0;
   left: 0;
   width: 100%;
   height: 300px;
   background: white;
 }

 .main {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  position: fixed;
  top: 90px;
  width: 100%;
  height: calc(100% - 90px);
  overflow: auto;
  background: hsl(203deg, 34%, 95%);;
}
</style>
