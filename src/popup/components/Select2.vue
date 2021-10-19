<template>
  <span style="display: inline-block; width: 95%">
    Query:
    <select>
      <slot></slot>
    </select>
    <span style="display: inline-block"><button id="clear-filter-tags-btn">X</button></span>
  </span>
</template>

<script>
require("@/src_jq/libraries/jquery-3.6.0.min.js");
require("@/src_jq/libraries/select2.js");
require("@/src_jq/common/multiselectTags.js");

export default {
  name: "select2",
  props: {
    options: Object,
    modelValue: String,
  },
  mounted: function () {
    console.log("mounted");
    var vm = this;

    createMultiselectTags(this.$el, vm.$props.options)
      //.val(vm.$props.modelValue)
      .trigger("change")
      .on("change", function () {
        vm.$emit("update:modelValue", this.value);
      });
  },
  watch: {
    modelValue: function (value) {
      console.log("value" + value);
      // update value
      $(this.$el).val(value).trigger("change");
    },
    options: function (options) {
      // update options
      $(this.$el).empty().select2({ data: options });
    },
  },
  destroyed: function () {
    $(this.$el).off().select2("destroy");
  },
};
</script>
<style>
@import "/src_jq/libraries/select2.min.css";
</style>
