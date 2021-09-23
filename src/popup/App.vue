<template>
  <div class="popup">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="Tabs" name="tabs">
        <tabs />
      </el-tab-pane>
      <el-tab-pane label="Sessions" name="sessions">
        <sessions />
      </el-tab-pane>
      <el-tab-pane label="Bookmarks" name="bookmarks">
        <snippets />
      </el-tab-pane>
      <el-tab-pane label="History" name="history">
        <snippets />
      </el-tab-pane>
      <el-tab-pane label="Incognito" name="incognito">
        <snippets />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import tabs from '@/popup/pages/tabs'
import sessions from '@/popup/pages/sessions'
import snippets from '@/popup/pages/snippets'

export default {
  name: 'Popup',
  components: {
    tabs,
    sessions,
    snippets,
  },
  data() {
    return {
      activeName: 'tabs',
    }
  },
  methods: {
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
