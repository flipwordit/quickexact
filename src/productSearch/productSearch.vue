<template>
  <div class="popup">
    <main>
      Product name:
      <input id="productName" v-model="product" />
      <button @click.self="find">Open in new window</button>
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

require("@/src_jq/common/commonFunctions.js");

export default {
  name: "ProductSearch",

  props: {
    product: String,
  },
  data() {
    return {};
  },
  beforeMount() {},
  mounted() {},
  computed: {},
  methods: {
    find() {
      let tabs = [
        {
          url: "https://www.ozon.ru/category/ruchki-18016/?from_global=true&text=",
        },
        { url: "https://www.mvideo.ru/product-list-page?q=" },
      ];

      tabs = tabs.map((el) => {
        el.url = el.url + this.product;

        return el;
      });
      openTabsInNewWindow(tabs);
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
