<template>
  <span style="display: inline-block; width: 95%">
    Query:
    <select>
      <slot></slot>
    </select>
    <span style="display: inline-block"
      ><button id="clear-filter-tags-btn" @click.self="clearAllFilters">
        X
      </button></span
    >
  </span>
</template>

<script>
require("@/src_jq/libraries/jquery-3.6.0.min.js");
require("@/src_jq/libraries/select2.js");
require("@/src_jq/libraries/fuse.js");
require("@/src_jq/common/multiselectTags.js");
require("@/src_jq/common/mulitselectTagsHandlers.js");
require("@/src_jq/common/restrictionMap.js");
require("@/src_jq/common/rateTags.js");

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

    createMultiselectTags(
      this.selectList(),
      vm.$props.options,
      generateAdditionalTagsFunction(() => this.searchResults)
    )
      .val(vm.$props.modelValue)
      .trigger("change")
      .on("change", sendUpdateEvent);
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

      this.selectList().empty();

      createMultiselectTags(
        this.selectList(),
        options,
        generateAdditionalTagsFunction(() => this.searchResults)
      );
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
    selectList(){
      return $("select", this.$el);
    }
  },
};
</script>
<style>
@import "/src_jq/libraries/select2.min.css";
</style>
