<template>
  <nav class="nav">
    <input type="search">
    <div class="actions">
      <button class="action">Add</button>
    </div>
  </nav>
</template>

<script>
import VueTagsInput from '@johmun/vue-tags-input'

export default {
  components: {
    VueTagsInput,
  },
  data() {
    return {
      tag: '',
      tags: [],
      autocompleteItems: [{
        text: 'Spain',
      }, {
        text: 'France',
      }, {
        text: 'USA',
      }, {
        text: 'Germany',
      }, {
        text: 'China',
      }],
    }
  },
  watch: {
    'tag': 'initItems',
  },
  methods: {
    update(newTags) {
      this.tags = newTags
    },
    filteredItems() {
      return this.autocompleteItems.filter(i => i.text.toLowerCase().indexOf(this.tag.toLowerCase()) !== -1)
    },
  },
}

</script>

<style lang="scss">
  .nav {
    padding: 14px;
    height: 40px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    background: white;
    font-size: 1.125rem;
    box-shadow: 0 0 4px rgba($color: black, $alpha: .1);

  //  input {
  //    flex-grow: 1;
  //   }

  //   actions
  }

</style>
