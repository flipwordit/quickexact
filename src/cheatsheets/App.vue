<template>
  <div class="popup">
    <Navbar :popup="popup">
      <img
        class="add ctrl-img"
        src="/images/plus-square.svg"
        @click="addCheatSheet"
        v-if="!newCheatSheet"
      />
    </Navbar>
    <main>
      <div id="speedDealHelp"></div>

      <addBlock v-if="newCheatSheet">
        <addModes class="selectElementInLine">
          <!-- .filter((el) => !el.isAllow || el.isAllow()) -->
          <div
            v-for="v in addModes"
            :key="v.title"
            @click="addMode = v.title"
            :class="
              'pointer ' + (v.title == addMode ? 'selected' : 'unselected')
            "
          >
            {{ v.title }}
          </div>
        </addModes>
        <CheatSheet
          :cheatsheet="newCheatSheet"
          :allTags="options"
          v-on:update-cheatsheet="saveNewCheatSheet"
          v-on:cancel-edit="cancelNewCheatSheet"
          :edit="true"
        ></CheatSheet>
      </addBlock>
      <search v-if="!newCheatSheet">
        <!-- <p>Selected: {{ selected }}</p> -->
        <select2
          :options="options"
          v-model="selected"
          :searchResults="searchResults"
        >
        </select2>
        <div class="selectElementInLine">
          <div
            v-for="v in selectVariants"
            :key="v.title"
            @click="v.handler()"
            class="pointer"
          >
            {{ v.title }}
          </div>
        </div>
        <div>
          <CheatSheetGroup
            v-for="group in groups"
            :key="group.id"
            :group="group"
            :showAll="
              false && (groups.length === 1 || searchResults.length < 4)
            "
            :showChildren="groups.length <= 2"
            :allTags="options"
            v-on:update-cheatsheet="updateCheatSheet($event)"
            v-on:remove-cheatsheet="removeCheatSheet($event)"
            v-on:move-to-tags="moveToTags($event)"
          />
        </div>
      </search>
    </main>
  </div>
</template>

<script>
import Navbar from '@/common/Navbar'

import CheatSheet from './components/CheatSheet'
import CheatSheetGroup from './components/CheatSheetGroup'
import Select2 from '@/common/Select2'

import { unique, getSmartotekaFabric, getActiveTab } from '@/src_jq/common/commonFunctions'
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
  props: {
    popup: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      selected: [],
      options: [],
      cheatSheets: [],
      newCheatSheet: null,
      addMode: 'Cheat Sheet',
      addModes: [
        { title: 'Cheat Sheet' },
        {
          title: 'Tab',
          isAllow: () => this.popup,
        },
        { title: 'Session' },
      ],
      selectVariants: [
        {
          title: 'All',
          handler: () => {
            this.refresh()
          },
        },
        {
          title: 'last created',
          handler: () => {
            this.refresh()
          },
        },
        {
          title: 'last finded',
          handler: () => {
            this.refresh()
          },
        },
        {
          title: 'last edited',
          handler: () => {
            this.refresh()
          },
        },
      ],
    }
  },
  beforeMount() {},
  mounted() {
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
  watch: {
    addMode: function (value) {
      switch (value) {
        case 'Cheat Sheet':
          break

        case 'Session':
          break
        case 'Tab':
          getActiveTab().then((tab) => {
            this.newCheatSheet.content = '![Icon]('
                  + tab.favIconUrl
                  + ')['
                  + tab.title
                  + ']('
                  + tab.url
                  + ')'
            this.newCheatSheet.link = tab.url
          })
          break
        default:
          throw new Error('Unexpected addMode' + value)
      }
    },
  },
  methods: {
    moveToTags(tags) {
      this.selected = tags
    },
    addCheatSheet() {
      let date = new Date().valueOf()
      this.newCheatSheet = {
        id: date,
        date: date,
        content: '',
        tags: this.selected,
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
    cancelNewCheatSheet() {
      this.newCheatSheet = null
    },
    refresh() {
      this.smartotekaFabric
        .queriesProvider()
        .getCheatSheets()
        .then((cheatsheets) => {
          this.refreshByData(cheatsheets)
          // cheatsheets.forEach((el) => {
          //   el.type = 'cheatsheet'
          // })
          // this.smartotekaFabric
          //   .queriesProvider()
          //   .getSessions()
          //   .then((sessions) => {
          //     let data = cheatsheets

          // cheatsheets.forEach((v) => (v.id = v.date))
          // sessions.map((session) => {
          //   let i = 0
          //   let tags = session.tags
          //   tags.push({ id: session.query, text: session.query })

          //   let cheatsheetsSession = session.tabs.map((tab) => {
          //     i += 1

          //     let id = parseInt(session.date + '' + i, 10)

          //     return {
          //       id: id,
          //       date: session.date,
          //       type: 'cheatsheet',
          //       link: tab.url,
          //       content:
          //         '![Icon]('
          //         + tab.favIconUrl
          //         + ')['
          //         + tab.title
          //         + ']('
          //         + tab.url
          //         + ')',
          //       tags: tags,
          //     }
          //   })

          //   data = data.concat(cheatsheetsSession)

          //   this.smartotekaFabric.KBManager().saveCheatSheets(data)
          //   return 0
          // })

          // this.refreshByData(data)
          // })
        })
    },
    refreshByData(cheatSheets) {
      this.cheatSheets = cheatSheets

      let allTags = []

      cheatSheets.forEach((el) => {
        allTags = allTags.concat(el.tags)

        return 0
      })

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

<style lang="scss" scoped>
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

.selected {
  color: green;
}

.unselected {
  color: inherit;
}

.pointer {
  cursor: pointer;
}
.selectElementInLine {
  display: flex;
  flex-direction: row;
  column-gap: 10px;
}
</style>
