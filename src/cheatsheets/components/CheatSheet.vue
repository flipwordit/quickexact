<template>
  <div class="cheatsheet">
    <div
      class="content"
      @mouseenter="mouseFocus = true"
      @mouseleave="showDropdown = mouseFocus = false"
    >
      <div class="tags" v-if="!editMode">
        <span v-for="tag in tags" :key="tag.id" @click="moveToTags(tag.id)"
          >{{ tag.text }}&nbsp;</span
        >
      </div>
      <div class="tags" v-if="editMode">
        <select2 :options="allTags" v-model="editTags"> </select2>
      </div>
      <div class="code">
        <Editor
          ref="editor"
          v-if="editMode"
          :initialValue="cheatsheet.content"
        />
        <Viewer v-if="!editMode" :initialValue="content" :content="content" />
      </div>

      <div class="edit-buttons" v-if="editMode">
        <img src="/images/save.svg" class="save" @click="save" />
        <img src="/images/x.svg" class="close" @click="cancel" />
      </div>
      <div class="dropdown" v-if="mouseFocus && !editMode">
        <div class="btn" @click.self="toggleDropdown" />
        <transition name="grow">
          <div class="menu" v-if="showDropdown" v-click-outside="closeDropdown">
            <img class="edit" src="/images/edit.svg" @click="toEditMode" />
            <img
              class="edit"
              src="/images/trash.svg"
              @click="removeCheatSheet"
            />
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import '@toast-ui/editor/dist/toastui-editor.css' // Editor's Style

import $ from 'jquery'
import { takeWhile } from 'lodash'
import Viewer from './Viewer'
import Editor from './Editor'
import Select2 from '@/common/Select2'

window.$ = $

export default {
  name: 'CheatSheet',
  emits: ['move-to-tags', 'cancel-edit'],
  components: {
    Select2,
    Editor,
    Viewer,
  },
  props: {
    cheatsheet: {
      type: Object,
      default: () => {},
    },
    commonTagsCount: {
      type: Number,
      default: () => 0,
    },
    allTags: {
      type: Array,
      default: () => [],
    },
    edit: {
      type: Boolean,
      defautl: () => false,
      writable: true,
    },
  },
  data() {
    return {
      showDropdown: false,
      editTags: [],
      editorOptions: {
        usageStatistics: false,
      },
      mouseFocus: false,
      editMode: false,
    }
  },
  beforeMount: function () {
    this.editMode = this.edit
  },
  mounted: function () {
    this.addButtonsToCodeBlocks()
  },
  updated: function () {
    if (this.editMode) this.updateEditTags()
    else this.addButtonsToCodeBlocks()
  },
  computed: {
    tags() {
      this.updateEditTags()

      return this.cheatsheet.tags.slice(this.commonTagsCount)
    },
    content() {
      return this.cheatsheet.content
    },
  },
  methods: {
    moveToTags(tagId) {
      let flag = true
      let tags = takeWhile(this.cheatsheet.tags, (el) => {
        let prevValue = flag
        flag = el.id !== tagId

        return prevValue
      })

      this.$emit('move-to-tags', tags)
    },
    addButtonsToCodeBlocks() {
      $('.code .copy', this.$el).remove()
      let codeEls = $('.code code', this.$el).parent()

      codeEls.append(
        '<img class="copy" style="display:none" src="/images/copy.svg" data-v-2d0b1742="">',
      )
      codeEls.css('position', 'relative')

      codeEls.on('mouseleave', function () {
        $('img', this).hide()
      })
      codeEls.on('mouseenter', function () {
        $('img', this).show()
      })

      $('img.copy', codeEls).on('click', function () {
        let text = $(this).parent().text()

        if (!navigator.clipboard) {
          fallbackCopyTextToClipboard(text)
          return
        }
        navigator.clipboard.writeText(text).then(
          function () {
            console.log('Async: Copying to clipboard was successful!')
          },
          function (err) {
            console.error('Async: Could not copy text: ', err)
          },
        )
      })
    },
    updateEditTags() {
      this.editTags = this.cheatsheet.tags.slice(0)
    },
    toEditMode() {
      this.editMode = true
    },
    removeCheatSheet() {
      this.closeDropdown()
      this.$emit('remove-cheatsheet', this.cheatsheet)
    },
    save() {
      this.editMode = false
      this.mouseFocus = false
      let tags = this.editTags.map((el) => ({ id: el.id, text: el.text }))

      this.cheatsheet.tags = this.editTags.slice(0)
      this.cheatsheet.content = this.$refs.editor.editor.getMarkdown()

      let saveCheatSheet = {
        content: this.cheatsheet.content,
        date: this.cheatsheet.date,
        tags: tags,
        id: this.cheatsheet.id,
        link: this.cheatsheet.link,
      }

      this.$emit('update-cheatsheet', saveCheatSheet)
    },
    cancel() {
      this.editMode = false
      this.mouseFocus = false
      this.updateEditTags()
      this.$emit('cancel-edit')
    },
    copyContent() {
      let text = this.cheatsheet.content
      navigator.clipboard.writeText(text).then(
        function () {
          console.log('Async: Copying to clipboard was successful!')
        },
        function (err) {
          console.error('Async: Could not copy text: ', err)
        },
      )
    },
    toggleDropdown() {
      this.showDropdown = !this.showDropdown
    },
    closeDropdown() {
      this.showDropdown = false
    },
    clickAway() {
      this.showDropdown = false
    },
  },
}
</script>

<style lang="scss" scoped>
@import "../../styles/variables";

$sky: #e6f6fe;

.cheatsheet {
  float: left;
  display: inline;
  z-index: 10;
  background: white;
  font-size: 1rem;
  transition: all 0.2s;
  border-radius: 5px;
  margin: 0.5rem 0.5rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
  text-align: left;
  color: $black;
  font-family: $roboto;
  overflow: visible;
  border: 1px solid #bbfdc6;

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
      vertical-align: middle;
      font-weight: 500;
      color: #194c66;
    }

    .reference {
      font-size: 1rem;
      margin-top: auto;
      font-style: italic;
      font-weight: lighter;
      align-items: baseline;
      padding-bottom: 0.125rem;
    }
  }

  .tags {
    font-size: 0.875rem;
    color: #6d88df;
    margin-right: 20px;
    span {
      cursor: pointer;
    }
  }
  .content {
    position: relative;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    display: grid;
    row-gap: 4px;

    .code {
      position: relative;
      margin-right: 20px;
    }

    .edit-buttons {
      height: 30px;
      position: relative;
      margin-right: 20px;

      .close {
        position: absolute;
        right: 5px;
        cursor: pointer;
      }

      .save {
        position: absolute;
        right: 40px;
        cursor: pointer;
      }
    }
    hr {
      height: 1px;
      border: none;
      /* Set the hr color */
      color: #e6f6fe; /* old IE */
      background-color: #e6f6fe; /* Modern Browsers */
    }

    .dropdown {
      position: absolute;
      right: 5px;
      top: 5px;

      padding: 5px;
      background: transparent;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;

      .btn {
        width: 10px;
        height: 10px;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid #9dd5f1;
      }

      .menu {
        min-width: 40px;
        min-height: 2em;
        position: absolute;
        top: 9px;
        left: 0px;
        background: white;
        flex-direction: column;
        font-size: 0.95rem;
        border: 1px solid #9dd5f1;
        border-radius: 5px;
        display: grid;
        grid-template-columns: repeat(auto-fill, 20px);
        grid-column-gap: 5px;
        img {
          margin: 2px 2px;
          width: 32px;
          &:hover {
            background: darken(#e6f6fe, 5);
          }
        }
      }
    }

    .tags {
      display: flex;
      font-size: 0.75rem;
      flex-wrap: wrap;
      .tag {
        text-transform: lowercase;
        font-weight: 500;
        padding: 0 8px;
        background: #9dd5f1;
        color: white;
        border-radius: 50vmin;
        margin-right: 3px;
        margin-bottom: 3px;
      }
    }
  }

  code {
    font-family: $firacode;

    span {
      font-family: consolas, cursive;
      font-style: italic;
      font-size: 1rem;
      color: hsl(210deg, 10%, 70%);
    }
  }
}
</style>
