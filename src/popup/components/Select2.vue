<template>
  <select>
    <slot></slot>
  </select>
</template>

<script>
require("@/src_jq/libraries/jquery-3.6.0.min.js");
require("@/src_jq/libraries/select2.js");


export default {
  name: "select2",
  pprops: ["options2", "value"],
  mounted: function () {
    var vm = this;
    $(this.$el)
      // init select2
      .select2({ data: vm.$attrs.options2 })
      .val(vm.$attrs.value)
      .trigger("change")
      // emit event on change.
      .on("change", function () {
        vm.$emit("input", vm.$attrs.value);
      });
  },
  watch: {
    value: function (value) {
      // update value
      $(this.$el).val(value).trigger("change");
    },
    options2: function (options) {
      // update options
      $(this.$el).empty().select2({ data: options });
    },
  },
  destroyed: function () {
    $(this.$el).off().select2("destroy");
  },
};
</script>
