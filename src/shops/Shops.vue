<template>
  <div class="popup">
    <Navbar> </Navbar>
    <main>
      <br />
      Product name:
      <input id="productName" v-model="product" style="width: 500px" />
      <br /><br />
      <button @click.self="openInNewWindow">Open in new window</button>
      <button style="margin-left: 150px" @click.self="open">Open</button>
    </main>
  </div>
</template>

<script>
import Navbar from "@/popup/components/Navbar";

import {openTabsInNewWindow, openTabs } from "@/src_jq/common/commonFunctions"

export default {
  name: "Shops",
  components: {
    Navbar,
  },
  props: {
    product: String,
  },
  data() {
    return {};
  },
  beforeMount() {},
  mounted() {
    setTimeout(() => {
      $("#productName").focus();
      document.execCommand("paste");

      $("#productName").select();
    }, 0);

    var vm = this;
    $("#productName").on("keypress", (e) => {
      if (e.keyCode == 13) {
        vm.openInNewWindow();
      }
    });
  },
  computed: {},
  methods: {
    openInNewWindow() {
      let tabs = this.getTabs();

      tabs = tabs.map((el) => {
        el.url = el.url + this.product;

        return el;
      });
      openTabsInNewWindow(tabs);
    },
    open() {
      let tabs = this.getTabs();

      tabs = tabs.map((el) => {
        el.url = el.url + this.product;

        return el;
      });
      openTabs(tabs);
    },
    getTabs() {
      return [
        {
          url: "https://www.mvideo.ru/product-list-page?q=",
        },
        {
          url: "https://www.eldorado.ru/search/catalog.php?q=",
        },
        {
          url: "https://www.dns-shop.ru/search/?q=",
        },
        {
          url: "https://www.citilink.ru/search/?text=",
        },
        {
          url: "https://www.ozon.ru/search?from=OpenSearch&text=",
        },
      ];
    },
  },
};
</script>

<style lang="scss">
#speedDealHelp {
  font-size: 150%;
  font-weight: bold;
  display: none;
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
