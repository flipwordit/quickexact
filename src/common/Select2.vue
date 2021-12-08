<template>
  <span style="display: flex; width: 100%">
    <span class="clear-filter">
      <img src="/images/x.svg" @click.self="clearAllFilters" />
    </span>
    <select style="flex-grow: 1">
      <slot></slot>
    </select>
  </span>
</template>

<script>
import $ from 'jquery'
import { unique, throttle } from '@/src_jq/common/commonFunctions'
import {
  select2UpdateTags,
  generateAdditionalTagsFunction,
} from '@/src_jq/common/mulitselectTagsHandlers'

import registerRestrictionMap from '@/src_jq/common/restrictionMap'

import '@/src_jq/libraries/select2'

import createMultiselectTags from '@/src_jq/common/multiselectTags'

window.$ = $

export default {
  name: 'select2',
  props: {
    options: Object,
    modelValue: Object,
    searchResults: Array,
  },
  mounted: function () {
    console.log('mounted')
    let vm = this
    registerRestrictionMap()

    let sendUpdateEvent = throttle(() => vm.sendUpdateEvent(), 100)

    this.list = createMultiselectTags(
      this.selectList(),
      vm.$props.options,
      generateAdditionalTagsFunction(() => this.searchResults || []),
    )

    select2UpdateTags(this.list, vm.$props.modelValue)

    this.list.on('change', sendUpdateEvent)
  },
  watch: {
    modelValue: function (value) {
      let strVal = JSON.stringify(value)
      if (this.prevValue === strVal) return
      this.prevValue = strVal
      console.log('value' + strVal)

      if (Array.isArray(value)) {
        select2UpdateTags(this.selectList(), value)
      } else {
        // update value
        this.selectList().val(value).trigger('change')
      }
    },
    options: function (options) {
      console.log('options')
      let modelValue = this.selectList().val()
      this.selectList().empty()

      createMultiselectTags(
        this.selectList(),
        options,
        generateAdditionalTagsFunction(() => this.searchResults),
      )
      this.selectList().val(modelValue).trigger('change')
    },
  },
  destroyed: function () {
    this.selectList().off().select2('destroy')
  },
  computed: {
    selectedTags() {
      let result = { count: 0 }

      let filterTags = $(this.$el)
        .select2('data')
        .map((el) => el.text)

      let countTags = 0
      result = unique(result, (el) => el).map((tag) => {
        countTags += 1
        result[tag] = countTags

        return 0
      })

      result.count = countTags

      return filterTags
    },
  },
  methods: {
    sendUpdateEvent: function () {
      console.log('change')

      this.$emit('update:modelValue', this.selectList().select2('data'))
    },
    clearAllFilters() {
      this.selectList().val(null).trigger('change')
    },
    selectList() {
      return $('select', this.$el)
    },
  },
}
</script>
<style lang="scss" scoped>
@import "../src_jq/libraries/select2.min.css";

.clear-filter {
  margin: 5px 5px;

  width: 16px;
  height: 16px;
}
</style>
