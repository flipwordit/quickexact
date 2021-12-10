<template>
  <div class="dropdown">
    <div class="btn" @click="toggleDropdown($event)" />
    <transition name="grow">
      <div class="menu" v-if="showDropdown" v-click-outside="closeDropdown">
        <img
          v-for="el in elements"
          :key="el.image"
          class="edit"
          :src="el.image"
          @click="el.handler"
        />
      </div>
    </transition>
  </div>
</template>

<script>
import ClickOutsideEvent from '@/common/directives/ClickOutside'

export default {
  name: 'CheatSheet',
  components: {},
  directives: {
    'click-outside': ClickOutsideEvent,
  },
  props: {
    elements: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      showDropdown: false,
    }
  },
  methods: {
    toggleDropdown(event) {
      this.showDropdown = !this.showDropdown
      event.stopPropagation()
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
</style>
