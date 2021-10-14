<template>
  <ul>
    <tree-item
      class="list-item"
      :item="treeData"
      @make-folder="makeFolder"
      @add-item="addItem"
      />
  </ul>
</template>

<script>
import TreeItem from './TreeItem'

export default {
  name: 'Tree',
  components: {
    TreeItem,
  },
  props: {
    treeData: {
      type: Object,
      default: () => ({ children: [], title: 'loading' }),
    },
  },
  // data() {
  //   return {
  //     treeData: {
  //       name: 'My Tree',
  //       children: [
  //         { name: 'hello' },
  //         { name: 'wat' },
  //         {
  //           name: 'child folder',
  //           children: [
  //             {
  //               name: 'child folder',
  //               children: [{ name: 'hello' }, { name: 'wat' }],
  //             },
  //             { name: 'hello' },
  //             { name: 'wat' },
  //             {
  //               name: 'child folder',
  //               children: [{ name: 'hello' }, { name: 'wat' }],
  //             },
  //           ],
  //         },
  //       ],
  //     },
  //   }
  // },
  methods: {
    makeFolder: function (item) {
      item.children = []
      this.addItem(item)
    },
    addItem: function (item) {
      item.children.push({
        name: 'new stuff',
      })
    },
  },
}
</script>

<style>
.list-item {
  cursor: pointer;
  list-style-type: none;
  padding: 0.5rem;
  background: white;
}
ul {
  /* padding-left: 1em;
  line-height: 1.5em;
  list-style-type: dot; */
}
</style>
