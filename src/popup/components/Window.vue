<template>
  <div class="card">
    <div class="bar" @click.self="toggle">
      <div :style="{'background': pattern}" :class="['bg', {'skip-filter ':meta.focused}]" @click.self="toggle"/>
      <div class="tab-count">{{tabs.length}}</div>
      <div class="title" contenteditable @input="titleChange">{{name}}</div>
      <div class="actions">
        <vue-feather type="anchor" stroke="slategrey" size="18"/>
        <vue-feather type="minimize-2" stroke="slategrey" @click.stop="minimizeWindow" size="18"/>
      </div>
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
    name() {
      const hostRegex = /(?:([^:]*):\/\/)?(?:([^:@]*)(?::([^@]*))?@)?(?:([^/:]*)\.(?=[^./:]*\.[^./:]*))?([^./:]*)(?:\.([^/.:]*))?(?::([0-9]*))?(\/[^?#]*(?=.*?\/)\/)?([^?#]*)?(?:\?([^#]*))?(?:#(.*))?/
      const hostsObj = this.tabs.reduce((acc, tab) => {
        const match = tab.url.match(hostRegex)
        const host = match[5]
        if (acc[host]) {
          acc[host] += 1
        } else {
          acc[host] = 1
        }
        return acc
      }, {})
      // console.log(hostsObj)
      const hosts = Object.keys(hostsObj)
      hosts.sort((a, b) => hostsObj[b] - hostsObj[a])
      const mostFrequent = hosts.slice(0, 2)
      const name = mostFrequent.join(', ') + (hosts.length > 2 ? ' ...' : '')
      return name
    },
  },
  created() {
    this.generateBackground()
    // console.log(this.meta)
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
      const samples = this.tabs.slice(0, 6).map(tab => tab.favIconUrl)
      this.pattern = samples.map((image, index) => `url(${image}) ${index * 60 + 40}px ${(index % 2 ? -2 : 28) + index * 20}px / 20px 20px no-repeat`).join(',')
    },
    titleChange(evt) {
      // console.log(evt.target.innerText)
    },
    minimizeWindow() {
      tabsService.minimizeWindow(this.meta.id)
    },

    chnageState() {

    },
    makeIncognito() {

    },
  },
}
</script>

<style lang="scss">
@import '../../styles/variables';

.card {
  overflow: hidden;
  border-radius: 3px;
  transition: 375ms cubic-bezier(0.4, 0.0, 0.2, 1);
  background: white;
  margin: 4px 5px;
  box-shadow: 1px 1px 1px 0px #bdcfdb;
  position: relative;

  .tab-count {
    position: absolute;
    left: 0;
    padding: 8px;
    width: 44px;
    text-align: center;
    border-right: 1px solid rgb(199, 208, 216);
  }

  .bar {
    height: 40px;
    padding: 0 10px 0 52px;
    color: rgb(64, 71, 79);
    display: flex;
    align-items: center;
    font-family: $worksans;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
    background:#e1e8ef;

    .bg {
      position: absolute;
      // border: 2px solid pink;
      z-index: 0;
      top: -50px;
      left: 100px;
      width: 369px;
      height: 200px;
      filter: grayscale(200%) sepia(47%) contrast(100%) hue-rotate(170deg) opacity(0.3);
      transform: rotate(-19deg);
    }
    .skip-filter {
      filter: none;
    }
    .title {
      outline: none;
      font-weight: 500;
      cursor: crosshair;
    }

    .actions {
      display: flex;

      i {
        margin-left: 10px;
      }
    }
  }

  section {
    transition: 375ms cubic-bezier(0.4, 0.0, 0.2, 1);
    max-height: 0;
  }
  .active {
    max-height: 1500px;
  }
}

</style>
