<template>
  <div class="card">
    <div class="bar" @click="toggle" :style="{'background': pattern, 'background-color': '#E2E6E6'}">
      <div class="title">{{meta.id}}</div>
      <div class="tab-count">{{tabs.length}}</div>
    </div>
    <section :class="{'active': active}">
      <Tab v-for="tab in tabs" :key="tab.id" :tab="tab" @activate="activate" />
    </section>
  </div>
</template>

<script>
import tabsService from '@/services/tabs'
import Tab from './Tab'

export default {
  name: 'Window',
  components: {
    Tab,
  },
  props: {
    meta: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      active: false,
      pattern: '',
    }
  },
  computed: {
    tabs() {
      return this.meta.tabs
    },
  },
  created() {
    this.generateBackground()
    console.log(this.meta)
    this.active = this.meta.expanded
  },
  methods: {
    toggle() {
      this.active = !this.active
      if (this.active) {
        tabsService.drawAttention(this.meta.id)
      }
    },
    activate() {
      tabsService.activateWindow(this.meta.id)
    },
    generateBackground() {
      const samples = this.tabs.slice(0, 5).map(tab => tab.favIconUrl)
      this.pattern = samples.map((image, index) => `url(${image}) ${index * 60 + 100}px ${index % 2 ? -13 : 25}px / 28px 28px no-repeat`).join(',')
    },
    chnageState() {

    },
    makeIncognito() {

    },
  },
}
</script>

<style lang="scss">
.card {
  overflow: hidden;
  border-radius: 3px;
  transition: 375ms cubic-bezier(0.4, 0.0, 0.2, 1);
  background: white;
  margin: 4px 5px;
  box-shadow: 1px 1px 2px 0 rgb(227, 227, 227);

  .bar {
    background-color: rgb(237, 230, 215);
    background-position: 100px, left top;
    // background-repeat: no-repeat, repeat;
    // background-size: 10px;
    // background-clip: content-box;
    // background-size: 50%;
    width: 100%;
    height: 40px;
    padding: 0 10px;
    color: rgb(64, 71, 79);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  section {
    transition: 375ms cubic-bezier(0.4, 0.0, 0.2, 1);
    height: 0;
  }
  .active {
    height: auto;
  }
}

</style>
