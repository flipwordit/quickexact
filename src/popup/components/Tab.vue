<template>
  <div class="tab" @click="activate">
    <img class="favicon" :src="tab.favIconUrl"/>
    <div class="title">{{tab.title}}</div>
    <div class="url">{{url}}</div>
    <div class="actions">
      <vue-feather type="x" stroke="silver" @click.stop="closeTab"/>
    </div>
  </div>
</template>

<script>
import tabsService from '@/services/tabs'

export default {
  name: 'Tab',
  props: {
    tab: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    url() {
      const match = this.tab.url.match(/(?:^https?:\/\/([^/]+)(?:[/,]|$)|^(.*)$)/)
      return match[0]
    },
  },
  methods: {
    activate() {
      this.$emit('activate')
      tabsService.activateTab(this.tab.id)
    },
    closeTab() {
      // fold in effec
      tabsService.closeTab(this.tab.id)
    },
  },
}
</script>

<style lang="scss">
@import '../../styles/variables';
.tab {
  display: grid;
  grid-template: 20px 18px / 50px 1fr 80px;
  align-items: center;
  border-bottom: 1px solid rgb(240, 246, 244);
  border-top: 1px solid rgba(227, 227, 227, 0.619);
  padding: 6px 0;
  font-family: $roboto;
  transition: all 0.2s;

  &:hover {
    background: hsl(210deg, 16%, 95%);
    cursor: pointer;
  }

  .title {
    width: 95%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: $black;
  }
  .favicon {
    height: 1.5rem;
    width: 1.5rem;
    justify-self: center;
    grid-row: 1 / 3;
    grid-column: 1 / 2;
  }
  .url {
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.875rem;
    font-style: italic;
    color: rgba(97, 103, 103, 0.784);
    grid-row: 2 / 3;
    grid-column: 2 / 3;
  }

  .actions {
    grid-row: 1 / 3;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
