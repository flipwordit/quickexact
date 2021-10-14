<template>
  <div class="record" @click="open">
    <!-- <img class="favicon" :style="{'background': `url(${favicon})`}"/> -->
    <div class="title">{{record.title}}</div>
    <div class="url">{{url}}</div>
    <div class="lastVisit">{{lastVisit}}</div>
    <div class="actions">
      <vue-feather type="external-link" stroke="silver" @click.stop="openLink"/>
      <vue-feather type="x" stroke="silver" @click.stop="deleteRecord"/>
    </div>
  </div>
</template>

<script>
import { DateTime } from 'luxon'

export default {
  name: 'Tab',
  props: {
    record: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    url() {
      const match = this.record.url.match(/(?:^https?:\/\/([^/]+)(?:[/,]|$)|^(.*)$)/)
      return match[0]
    },
    favicon() {
      return 'chrome://favicon2/?size=24&scale_factor=1x&page_url=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fvue2-daterange-picker&allow_google_server_fallback=0'
    },
    lastVisit() {
      return DateTime.now().toLocaleString()
    },
  },
  methods: {
    openLink() {
      console.log('open')
    },
    deleteRecord() {
      console.log('delete')
    },
  },
}
</script>

<style lang="scss">
@import '../../styles/variables';
.record {
  display: grid;
  grid-template: 20px 18px / 2fr 1fr 60px ;
  align-items: center;
  box-shadow: 0px -1px 1px 0px white, 0px 1px 1px 0 hsl(207deg, 36%, 75%);
  padding: 8px 12px;
  font-family: $roboto;
  transition: all 0.2s;
  margin-bottom: 2px;

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
    grid-column: 1 / 3;
  }
  // .favicon {
  //   height: 1.5rem;
  //   width: 1.5rem;
  //   justify-self: center;
  //   grid-row: 1 / 3;
  //   grid-column: 1 / 2;
  // }
  .url {
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.875rem;
    font-style: italic;
    color: rgba(97, 103, 103, 0.784);
    grid-row: 2 / 3;
    grid-column: 1 / 3;
  }

  .lastVisit {
    grid-row: 2 / 3;
    grid-column: 2 / 3;
    font-size: 0.875rem;
    font-style: italic;
    color: rgba(97, 103, 103, 0.784);
    text-align: right;
    padding-right: 10px;
  }
  .actions {
    grid-row: 1 / 3;
    display: flex;
    justify-content: space-between;
  }
}
</style>
