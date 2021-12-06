<template>
  <nav class="nav">
    <div v-for="l in links" :key="l.url">
      <a :href="l.url" v-on:click.prevent="openTab(l.url)">{{ l.title }}</a>
    </div>
    <slot />

  </nav>
</template>

<script>

export default {
  components: {
  },
  data() {
    return {
      links: [
        {
          url: '../src_jq/session/session.html',
          title: 'sessions',
        },
        {
          url: '../cheatsheets/page.html',
          title: 'cheat sheets',
        },
      ],
      tag: '',
      tags: [],
    }
  },
  computed: {
  },
  methods: {
    openTab: function (url) {
      chrome.tabs.create({ url: url })
    },
  },
}
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
