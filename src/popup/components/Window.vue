<template>
  <div class="card">
    <div class="bar" @click.self="toggle">
      <div :style="{'background': pattern}" class="bg" @click.self="toggle"/>
      <div class="tab-count">{{tabs.length}}</div>
      <div class="title" contenteditable @input="titleChange">{{name}}</div>
      <div class="actions">
        <!-- <vue-feather type="anchor" stroke="slategrey" size="18"/> -->
        <vue-feather type="minimize-2" stroke="slategrey" @click.stop="minimizeWindow" size="18"/>
      </div>
      <div class="minimized">
        <vue-feather type="arrow-up-right" stroke="slategrey" size="18"/>
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
      this.pattern = samples.map((image, index) => `url(${image}) ${index * 60 + 40}px ${(index % 2 ? -2 : 40) + index * 20}px / 20px 20px no-repeat`).join(',')
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
  margin: 5px;
  box-shadow: 0 1px 3px 0px hsl(205deg, 31%, 85%);
  position: relative;

  .tab-count {
    position: absolute;
    left: 0;
    padding: 8px;
    width: 44px;
    color: hsl(200deg, 22%, 60%);
    text-align: center;
    border-right: 1px solid hsl(200deg, 30%, 90%);;
  }

  .bar {
    height: 52px;
    padding: 0 10px 0 52px;
    color: hsl(200deg, 22%, 60%);
    display: flex;
    align-items: center;
    font-family: $worksans;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
    // background: linear-gradient(to right bottom, hsl(197deg, 60%, 99%), hsl(199deg, 50%, 98%));
    background: hsl(200deg, 50%, 99%);
    box-shadow: 0 1px 1px #e7f0f5;

    .bg {
      position: absolute;
      // border: 2px solid pink;
      z-index: 0;
      top: -50px;
      left: 60px;
      width: 369px;
      height: 200px;
      filter: sepia(100%) contrast(100%) hue-rotate(190deg) opacity(0.2);
      transform: rotate(-19deg);
      transition: all 0.35s;

      &:hover {
        filter: none;
      }
    }
    .skip-filter {
      filter: none;
    }
    .title {
      outline: none;
      font-weight: 500;
      cursor: crosshair;
      color: #5b7187
    }

    .actions {
      display: flex;

      i {
        margin-left: 10px;
      }
    }
  }

  .minimized {
    position: absolute;
    top: 0;
    right: 0;
    border-style: solid;
    box-shadow: 0px 0px 5px hsl(205deg, 31%, 85%);
    // width: 0;
    border-width: 23px;
    border-color: rgb(238, 243, 247) rgb(238, 243, 247) #FFF #FFF;
    border-radius: 0 0 0 3px;
    transition: border-width .2s;

    i {
      position: absolute;
      right: 0;
    }
  }
  button:hover {
    border-radius: 5px;
    transition-delay: .1s;
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
