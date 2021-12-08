<template>
  <div>
    <div class="card">
      <div class="header">
        <div class="title">
          <span
            class="tag"
            v-for="tag in tags"
            :key="tag.id"
            @click="moveToTags(tag.id)"
            >{{ tag.text }}&nbsp;
          </span>
          <img
            class="expand ctrl-img"
            v-if="!showChildren"
            src="/images/arrow-down.svg"
            @click.self="showChildren = !showChildren"
          />
          <img
            class="collapse ctrl-img"
            v-if="showChildren"
            @click.self="showChildren = !showChildren"
            src="/images/arrow-up.svg"
          />
        </div>
        <!-- <img class="add" src="/images/plus-square.svg" @click="addCheatSheet" /> -->
        <!-- v-if="group.items.findIndex((el) => el.isNew) < 0" -->
      </div>
      <!-- group.items.slice(0, 2) -->
      <div class="content">
        <div class="row">
          <div
            v-for="cheatsheet in showChildren ? group.items : []"
            :key="cheatsheet.id"
          >
            <CheatSheet
              v-if="cheatsheet.type === 'cheatsheet'"
              :cheatsheet="cheatsheet"
              :commonTagsCount="group.commonTagsCount"
              :allTags="allTags"
              v-on:update-cheatsheet="$emit('update-cheatsheet', $event)"
              v-on:remove-cheatsheet="$emit('remove-cheatsheet', $event)"
              v-on:move-to-tags="$emit('move-to-tags', $event)"
            ></CheatSheet>

             <Session
              v-if="cheatsheet.type === 'session'"
              :session="cheatsheet"
              :commonTagsCount="group.commonTagsCount"
              :allTags="allTags"
              v-on:update-cheatsheet="$emit('update-session', $event)"
              v-on:remove-cheatsheet="$emit('remove-session', $event)"
              v-on:move-to-tags="$emit('move-to-tags', $event)"
            ></Session>
          </div>
        </div>
        <div class="row" v-if="group.groups.length > 0 && showChildren">
          <div class="column">
            <img class="ctrl-img" src="/images/corner-down-right.svg" />
          </div>
          <div class="column2">
            <CheatSheetGroup
              :level="level + 1"
              v-for="group in group.groups"
              :key="group.id"
              :group="group"
              :showAll="showAll"
              :showChildren="showAll"
              :allTags="allTags"
              v-on:update-cheatsheet="$emit('update-cheatsheet', $event)"
              v-on:remove-cheatsheet="$emit('remove-cheatsheet', $event)"
              v-on:move-to-tags="$emit('move-to-tags', $event)"
            ></CheatSheetGroup>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { takeWhile } from 'lodash'
import CheatSheet from './CheatSheet'
import Session from './Session'

export default {
  name: 'CheatSheetGroup',
  emits: ['update-cheatsheet', 'remove-cheatsheet', 'move-to-tags'],
  components: {
    CheatSheet,
    Session,
  },
  props: {
    group: {
      type: Object,
      default: () => {},
    },
    showChildren: {
      type: Boolean,
      default: () => false,
    },
    showAll: {
      type: Boolean,
      default: () => false,
    },
    allTags: {
      type: Array,
      default: () => [],
    },
    level: {
      type: Number,
      default: () => 0,
    },
  },
  data() {
    return {}
  },
  computed: {
    tags() {
      if (this.group.commonTagsCount === -1) {
        return []
      }

      let group = this.group
      while (!group.items.length > 0) {
        group = group.groups[0]
      }

      return group.items[0].tags.slice(0, this.group.commonTagsCount)
    },
    // isManyChildren() {
    //   return this.group.items.length > 0 || this.group.groups.length > 0
    // },
  },
  methods: {
    // addCheatSheet() {
    //   alert('заглушка')
    // },
    moveToTags(tagId) {
      let flag = true
      let tags = takeWhile(this.tags, (el) => {
        let prevValue = flag
        flag = el.id !== tagId

        return prevValue
      })

      this.$emit('move-to-tags', tags)
    },
  },
}
</script>

<style lang="scss" scoped>
@import "../../styles/variables";

$sky: #8ef7a0;

.content {
  margin-left: 15px;

  .column {
    float: left;
    display: inline;
  }
  .column2 {
    display: inline;
    float: left;
  }

  .row:after {
    content: "";
    display: table;
    clear: both;
  }
}

.ctrl-img {
  opacity: 0.5;
  filter: alpha(Opacity=50);
  opacity: 0.5;
}

.card {
  clear: both;
  border: 2px solid #e6f6fe;
  .header {
    background: #e6f6fe;
    font-size: 1.125rem;
    padding: 0 1rem;
    line-height: 1.125rem;
    display: flex;
    height: 2.5rem;
    justify-content: space-between;
    align-items: center;

    .title {
      line-height: 1.5rem;
      // background: violet;
      vertical-align: middle;
      font-weight: 500;
      color: #194c66;

      .expand,
      .collapse {
        display: inline-block;
      }

      .tag {
        cursor: pointer;
      }
    }
  }
}
</style>
