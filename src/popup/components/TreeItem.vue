<template>
  <li>
    <div
         :class="{folder: isFolder}"
         @click="toggle"
         @dblclick="makeFolder">
      <vue-feather v-if="isFolder" :type="isOpen ? 'chevron-down' : 'chevron-right'" />
      {{ item.title }}
    </div>
    <ul v-show="isOpen" v-if="isFolder">
      <tree-item
         class="tree-item"
         v-for="(child, index) in item.children"
         :key="index"
         :item="child"
         @make-folder="$emit('make-folder', $event)"
         @add-item="$emit('add-item', $event)"
         ></tree-item>
      <!-- <li class="add" @click="$emit('add-item', item)">+</li> -->
    </ul>
  </li>
</template>

<script>
export default {
  name: 'TreeItem',
  props: {
    item: Object,
  },
  data: function () {
    return {
      isOpen: false,
    }
  },
  computed: {
    isFolder: function () {
      return this.item.children && this.item.children.length
    },
  },
  methods: {
    toggle: function () {
      if (this.isFolder) {
        this.isOpen = !this.isOpen
      }
    },
    makeFolder: function () {
      if (!this.isFolder) {
        this.$emit('make-folder', this.item)
        this.isOpen = true
      }
    },
  },
}
</script>

<style>
.folder {
  font-weight: bold;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 8px 0;
  margin-left: -11px;
  border-bottom: 1px solid silver;
}
ul {
  /* padding-left: 1em;
  line-height: 1.5em;
  border-left: 1px solid silver; */
}

.tree-item {
  /* display: flex;
  align-items: center;
  justify-content: flex-start; */
  list-style-type: none;
  padding: 4px;
}

</style>
