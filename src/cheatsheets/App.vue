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
        <!-- //TOdO: create!!!! -->
        <CheatSheetGroup
          v-for="group in groups"
          :key="group.id"
          :group="group"
          :showAll="groups.length === 1 || searchResults.length < 12"
          :allTags="options"
          v-on:update-cheatsheet="updateCheatSheet($event)"
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
import Navbar from "@/popup/components/Navbar";

import CheatSheet from "./components/CheatSheet";
import CheatSheetGroup from "./components/CheatSheetGroup";
import Select2 from "@/common/Select2.vue";

import { unique, getSmartotekaFabric } from '@/src_jq/common/commonFunctions'
import { cheatsheetsGroup } from '@/src_jq/common/cheatSheetsManage.js'
import registerRestrictionMap from '@/src_jq/common/restrictionMap'

export default {
  name: "App",
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
      sessions: [],
    };
  },
  beforeMount() {},
  mounted() {
    let vm = this;

    this.smartotekaFabric
      .queriesProvider()
      .getCheatSheets()
      .then((cheatsheets) => {
        vm.update(cheatsheets);
      });

    window.addEventListener(
      "keypress",
      (e) => {
        if (e.code === "Escape") {
          setTimeout(() => $(document.activeElement).blur());
          return;
        }

        if (
          document.activeElement.type === "textarea" ||
          document.activeElement.type === "text"
        )
          return;

        switch (e.key) {
          case "f":
            {
              setTimeout(() => $(".select2-search__field").focus(), 0);
            }
            break;
        }
      },
      false
    );
  },
  computed: {
    groups() {
      let cheatsheets = this.searchResults;
      let result = cheatsheetsGroup(cheatsheets);

      return result;
    },
    searchResults() {
      console.log("searchResults");
      let selectedTags = this.selected.map((el) => el.text);

      //TODO: if(selectedTabs.length===0)Вывести топ 10 самых часто используемых
      let filterTags = {};

      let countTags = 0;
      unique(selectedTags, (el) => el).map(
        (tag) => (filterTags[tag] = ++countTags)
      );
      filterTags.count = countTags;
      let filterByTags = getFilterByFilterTags(
        (el) => el,
        () => filterTags
      );

      return (this.sessions || []).filter(
        (session) => filterTags[session.query] || filterByTags(session)
      );
    },
    smartotekaFabric() {
      return getSmartotekaFabric();
    },
  },
  methods: {
    update(sessions) {
      this.sessions = sessions;

      let allTags = [];

      sessions.forEach(
        (el) =>
          (allTags = allTags
            .concat(el.tags)
            .concat([{ id: el.query, text: el.query }]))
      );

      this.options = unique(allTags, (el) => el.id);
    },
    updateCheatSheet(cheatsheet){
      this.smartotekaFabric.KBManager().updateCheatSheets([cheatsheet]);
    }
  },
};
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
