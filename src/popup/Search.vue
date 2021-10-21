<template>
  <div class="popup">
    <Navbar>
      <!-- <input type="search" placeholder="Search" v-model="query" @input="fetchWindows"/>
      <div class="actions">

      </div> -->
    </Navbar>
    <main>
      <div id="speedDealHelp"></div>

      <!-- <p>Selected: {{ selected }}</p> -->
      <select2
        :options="options"
        v-model="selected"
        :searchResults="searchResults"
      >
        <option disabled value="0">Select one</option>
      </select2>

      <div>
        <Session
          v-for="session in searchResults"
          :key="session.date"
          :session="session"
        />
      </div>

      <!-- <snippet /> -->
    </main>
  </div>
</template>

<script>
import Navbar from "@/popup/components/Navbar";
import tabs from "@/popup/pages/tabs";

import Snippet from "@/popup/components/Snippet";
import Session from "@/popup/components/Session";
import bookmarks from "@/popup/pages/bookmarks";
import history from "./pages/history";
import Select2 from "@/popup/components/Select2.vue";
import Button from "./components/Button.vue";

require("@/src_jq/common/SmartotekaFabricLocalStorage.js");
require("@/src_jq/common/commonFunctions.js");

export default {
  name: "Search",
  components: {
    Snippet,
    Session,
    tabs,
    bookmarks,
    Navbar,
    history,
    Select2,
    Button,
  },
  data() {
    return {
      activeName: "sessions",
      query: "",
      selected: [],
      options: [],
      sessions: [],
    };
  },
  beforeMount() {},
  mounted() {
    let vm = this;

    chrome.runtime.onMessage.addListener(function (
      request,
      sender,
      sendResponse
    ) {
      if (request === "clear") sendResponse("Cool clear!");

      registerSpeedDeal("#speedDealHelp", vm.smartotekaFabric);
    });
    registerSpeedDeal("#speedDealHelp", vm.smartotekaFabric);

    this.smartotekaFabric
      .queriesProvider()
      .getSessions()
      .then((sessions) => {
        vm.update(sessions);
      });
    // smartotekaFabric
    //   .queriesProvider()
    //   .getCheatSheets()
    //   .then((sessions) => {
    //     vm.sessions = sessions.map((el) => {
    //       return { date: el.date, title: el.content, tags: el.tags };
    //     });
    //   });

    // this.smartotekaFabric
    //   .queriesProvider()
    //   .getTags()
    //   .then((tags) => {
    //     this.options = tags;
    //   });

    chrome.storage.onChanged.addListener(function (changes, namespace) {
      const sessionsChanges = changes["Sessions"];
      if (sessionsChanges && sessionsChanges.newValue) {
        vm.update(sessionsChanges.newValue);
      }
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
          case "c":
            {
              registerSpeedDeal("#speedDealHelp", vm.smartotekaFabric);
            }
            break;
        }
      },
      false
    );
  },
  computed: {
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
      let filterByTags = getFilterByFilterTags((el) => el, filterTags);

      return (this.sessions || []).filter(
        (session) => filterTags[session.query] || filterByTags(session)
      );
    },
    smartotekaFabric() {
      return new SmartotekaFabricLocalStorage();
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
