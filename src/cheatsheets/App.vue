<template>
  <div class="popup">
    <Navbar> </Navbar>
    <main>
      <div id="speedDealHelp"></div>

      <!-- <p>Selected: {{ selected }}</p> -->
      <select2
        :options="options"
        v-model="selected"
        :searchResults="searchResults"
      >
      </select2>

      <div>
        <img
          class="add"
          src="/images/plus-square.svg"
          @click="addCheatSheet"
          v-if="!newCheatSheet"
        />
        <CheatSheet
          v-if="newCheatSheet"
          :cheatsheet="newCheatSheet"
          :allTags="options"
          v-on:update-cheatsheet="saveNewCheatSheet"
          :edit="true"
        ></CheatSheet>

        <CheatSheetGroup
          v-for="group in groups"
          :key="group.id"
          :group="group"
          :showAll="true||groups.length === 1 || searchResults.length < 12"
          :allTags="options"
          v-on:update-cheatsheet="updateCheatSheet($event)"
          v-on:remove-cheatsheet="removeCheatSheet($event)"
        />

        <!-- <CheatSheet
          v-for="cheatsheet in searchResults"
          :key="cheatsheet.date"
          :cheatsheet="cheatsheet"
        /> -->
      </div>
    </main>
  </div>
</template>

<script>
import Navbar from '@/popup/components/Navbar'

import CheatSheet from './components/CheatSheet'
import CheatSheetGroup from './components/CheatSheetGroup'
import Select2 from '@/common/Select2'

import { unique, getSmartotekaFabric } from '@/src_jq/common/commonFunctions'
import { cheatsheetsGroup } from '@/src_jq/common/cheatSheetsManage'
import { getFilterByFilterTags } from '@/src_jq/common/mulitselectTagsHandlers'

export default {
  name: 'App',
  components: {
    CheatSheet,
    CheatSheetGroup,
    Navbar,
    Select2,
  },
  data() {
    return {
      selected: [],
      options: [],
      cheatSheets: [],
      newCheatSheet: null,
    }
  },
  beforeMount() {},
  mounted() {
    this.refresh()

    window.addEventListener(
      'keypress',
      (e) => {
        if (e.code === 'Escape') {
          setTimeout(() => $(document.activeElement).blur())
          return
        }

        if (
          document.activeElement.type === 'textarea'
          || document.activeElement.type === 'text'
        ) {
          return
        }

        // switch (e.key) {
        //   case 'f':
        //     {
        //       setTimeout(() => $('.select2-search__field').focus(), 0)
        //     }
        //     break
        // }
      },
      false,
    )
  },
  computed: {
    groups() {
      let cheatsheets = this.searchResults
      let result = cheatsheetsGroup(cheatsheets)

      return result
    },
    searchResults() {
      console.log('searchResults')
      let selectedTags = this.selected.map((el) => el.text)

      // TODO: if(selectedTabs.length===0)Вывести топ 10 самых часто используемых
      let filterTags = {}

      let countTags = 0
      unique(selectedTags, (el) => el).map((tag) => {
        countTags += 1
        filterTags[tag] = countTags
        return 0
      })

      filterTags.count = countTags
      let filterByTags = getFilterByFilterTags(
        (el) => el,
        () => filterTags,
      )

      return (this.cheatSheets || []).filter(
        (cheatsheet) => filterTags[cheatsheet.query] || filterByTags(cheatsheet),
      )
    },
    smartotekaFabric() {
      return getSmartotekaFabric()
    },
  },
  methods: {
    addCheatSheet() {
      this.newCheatSheet = {
        date: new Date().valueOf(),
        content: '',
        tags: [],
      }
    },
    saveNewCheatSheet(cheatsheet) {
      this.smartotekaFabric
        .KBManager()
        .addCheatSheet(cheatsheet)
        .then(() => {
          this.newCheatSheet = null

          this.refresh()
        })
    },
    refresh() {
      this.smartotekaFabric
        .queriesProvider()
        .getCheatSheets()
        .then((cheatsheets) => {
          this.refreshByData(cheatsheets)
        })
    },
    refreshByData(cheatSheets) {
      this.cheatSheets = cheatSheets

      let allTags = []

      cheatSheets.forEach(
        (el) => {
          allTags = allTags
            .concat(el.tags)
            .concat([{ id: el.query, text: el.query }])

          return 0
        },
      )

      this.options = unique(allTags, (el) => el.id)
    },
    updateCheatSheet(cheatsheet) {
      this.smartotekaFabric
        .KBManager()
        .updateCheatSheets([cheatsheet])
        .then(() => this.refresh())
    },
    removeCheatSheet(cheatsheet) {
      if (confirm('Are you sure?')) {
        this.smartotekaFabric
          .KBManager()
          .deleteCheatSheet(cheatsheet)
          .then(() => this.refresh())
      }
    },
  },
}
</script>

<style lang="scss">
#speedDealHelp {
  font-size: 150%;
  font-weight: bold;
  display: none;

  .values {
    color: green;
  }
}
.el-tabs__header {
  margin: 0;
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
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  position: fixed;
  top: 90px;
  width: 100%;
  height: calc(100% - 90px);
  overflow: auto;
  background: hsl(203deg, 34%, 95%);
}
</style>
