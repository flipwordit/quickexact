<template>
  <nav class="nav">
    <div v-for="l in links" :key="l.url">
      <a :href="l.url" v-on:click.prevent="openTab(l.url)">{{ l.title }}</a>
    </div>
    <!-- <vue-tags-input
      v-model="tag"
      :tags="tags"
      :autocomplete-items="filteredItems"
      @tags-changed="newTags => tags = newTags"
    /> -->
    <!-- <vue-feather type="search" stroke="silver"/> -->
    <slot />
    <!-- <div class="actions">
      <div class="action"><vue-feather type="plus" stroke="white" /></div>
    </div> -->
  </nav>
</template>

<script>
//import VueTagsInput from '@johmun/vue-tags-input'

export default {
  components: {
    // VueTagsInput,
  },
  data() {
    return {
      links: [
        {
          url: '../src_jq/session/session.html',
          title: 'sessions',
        },
        {
          url: '../src_jq/cheatsheets/cheatsheet.html',
          title: 'cheat sheets',
        },
        {
          url: '../cheatsheets/page.html',
          title: 'cheat sheets(New)',
        },
      ],
      tag: '',
      tags: [],
      autocompleteItems: [
        {
          text: "Spain",
        },
        {
          text: "France",
        },
        {
          text: "USA",
        },
        {
          text: "Germany",
        },
        {
          text: "China",
        },
      ],
    };
  },
  // watch: {
  //   'tag': 'initItems',
  // },
  computed: {
    filteredItems() {
      return this.autocompleteItems.filter((i) =>
        i.text.toLowerCase().includes(this.tag.toLowerCase())
      );
    },
  },
  methods: {
    update(newTags) {
      this.tags = newTags;
    },
    openTab: function (url) {
      chrome.tabs.create({ url: url });
    },
  },
};
</script>

<style lang="scss">
.nav {
  height: 50px;
  display: flex;
  padding: 0 20px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  font-size: 1.125rem;
  box-shadow: 0 0 4px rgba($color: black, $alpha: 0.1);

  input {
    flex-grow: 1;
    border: none;
    font-size: 1.25rem;
    outline: none;
    padding-left: 10px;
    background: transparent;
    //  background: green;
    vertical-align: bottom;
  }

  .action {
    font-size: 2rem;
    padding: 2px;
    background: rgb(169, 255, 219);
    height: 35px;
    width: 35px;
    text-align: center;
    border-radius: 50vmin;
  }
}
</style>
