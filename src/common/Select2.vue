<template>
  <span style="display: inline-block; width: 95%">
    <select>
      <slot></slot>
    </select>
    <span
      style="
        display: inline-block;
        position: absolute;
        display: inline-block;
        margin: 5px 5px;
      "
      ><button id="clear-filter-tags-btn" @click.self="clearAllFilters">
        X
      </button></span
    >
  </span>
</template>

<script>
import $ from "jquery";
window.$ = $;

require("@/src_jq/libraries/select2.js");

window.Fuse = require("@/src_jq/libraries/fuse.js");

require("@/src_jq/common/multiselectTags.js");
import { select2UpdateTags } from "@/src_jq/common/mulitselectTagsHandlers";
import { unique, throttle } from "@/src_jq/common/commonFunctions";

import registerRestrictionMap from "@/src_jq/common/restrictionMap";

export default {
  name: "select2",
  props: {
    options: Object,
    modelValue: Object,
    searchResults: Array,
  },
  mounted: function () {
    console.log("mounted");
    var vm = this;
    registerRestrictionMap();

    let sendUpdateEvent = throttle(() => vm.sendUpdateEvent(), 100);

    let list = createMultiselectTags(
      this.selectList(),
      vm.$props.options,
      generateAdditionalTagsFunction(() => this.searchResults || [])
    );

    select2UpdateTags(list, vm.$props.modelValue);

    list.on("change", sendUpdateEvent);
  },
  watch: {
    modelValue: function (value) {
      if (this.modelValue === value) return;
      console.log("value" + value);
      // update value
      this.selectList().val(value).trigger("change");
    },
    options: function (options) {
      console.log("options");
      let modelValue = this.selectList().val();
      this.selectList().empty();

      createMultiselectTags(
        this.selectList(),
        options,
        generateAdditionalTagsFunction(() => this.searchResults)
      );
      this.selectList().val(modelValue).trigger("change");
    },
  },
  destroyed: function () {
    this.selectList().off().select2("destroy");
  },
  computed: {
    selectedTags() {
      let result = { count: 0 };

      let filterTags = $(this.$el)
        .select2("data")
        .map((el) => el.text);

      let countTags = 0;
      result = unique(result, (el) => el).map(
        (tag) => (result[tag] = ++countTags)
      );

      result.count = countTags;

      return filterTags;
    },
  },
  methods: {
    sendUpdateEvent: function () {
      console.log("change");

      this.$emit("update:modelValue", this.selectList().select2("data"));
    },
    clearAllFilters() {
      this.selectList().val(null).trigger("change");
    },
    selectList() {
      return $("select", this.$el);
    },
  },
};
</script>
<style>
@import "../src_jq/libraries/select2.min.css";
</style>
