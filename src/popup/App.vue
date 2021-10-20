<template>
  <div class="popup">
    <Navbar>
      <!-- <input type="search" placeholder="Search" v-model="query" @input="fetchWindows"/>
      <div class="actions">

      </div> -->
    </Navbar>
    <main>
      <!-- <p>Selected: {{ selected }}</p> -->
      <select2
        :options="options"
        v-model="selected"
        :searchResults="searchResults"
      >
        <option disabled value="0">Select one</option>
      </select2>
      <!-- <snippet /> -->
      <div v-for="sr in searchResults" :key="sr.date">
        <li>{{ sr.title }}</li>
      </div>
    </main>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import Navbar from "@/popup/components/Navbar";
import tabs from "@/popup/pages/tabs";

import Snippet from "@/popup/components/Snippet";
import bookmarks from "@/popup/pages/bookmarks";
import history from "./pages/history";
import Select2 from "@/popup/components/Select2.vue";
import Button from "./components/Button.vue";

require("@/src_jq/common/SmartotekaFabricLocalStorage.js");
require("@/src_jq/common/commonFunctions.js");

export default {
  name: "Popup",
  components: {
    Snippet,
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
    let smartotekaFabric = new SmartotekaFabricLocalStorage();

    let that = this;

    smartotekaFabric
      .queriesProvider()
      .getCheatSheets()
      .then((sessions) => {
        that.sessions = sessions.map((el) => {
          return { date: el.date, title: el.content, tags: el.tags };
        });
      });

    smartotekaFabric
      .queriesProvider()
      .getTags()
      .then((tags) => {
        this.options = tags;
      });
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

      return (this.sessions || []).filter(
        getFilterByFilterTags((el) => el, filterTags)
      );
    },
  },
  methods: {
    handleClick(tab, event) {
      console.log(tab, event);
    },
  },
};
</script>

<style lang="scss">
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
