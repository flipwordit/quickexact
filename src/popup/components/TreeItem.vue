<template>
  <li>
    <div
         :class="{folder: isFolder}"
         @click="toggle"
         @dblclick="makeFolder">
      <!-- <vue-feather v-if="isFolder" :type="isOpen ? 'chevron-down' : 'chevron-right'" /> -->
      <div class="title">{{ item.title }}</div>
      <div v-if="!isFolder" class="link">{{item.url}}</div>
      <div v-if="!isFolder" class="actions">O B L</div>
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

<style lang="scss">
.folder {
  font-weight: bold;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0.5rem;
  background: hsl(217deg, 29%, 89%);
  /* margin-bottom: .25rem; */
  border-radius: 4px 4px 0 0;
}
ul {
  /* padding-left: 1em;
  line-height: 1.5em;
  border-left: 1px solid silver; */
}

.tree-item:not(.tree-item > .folder) {
  /* display: flex;
  align-items: center;
  justify-content: flex-start; */
  list-style-type: none;
  padding: 0.625rem;
  padding-right: 0;
  border-left: 1px solid #d7e7ec;
  /* margin: 10px 0; */
  border-bottom: 1px solid #d7e7ec;
  border-right: 1px solid #d7e7ec;
  white-space: nowrap;
  text-overflow: ellipsis;

}

.tree-item > div {
  display: grid;
  grid-template: 20px 20px / 1fr 60px;

  .actions {
    grid-row: 1 / 3;
    grid-column: 2 / 3;
  }
}

</style>
