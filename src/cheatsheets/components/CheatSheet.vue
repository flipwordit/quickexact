<template>
  <div class="card">
    <div class="header">
      <div class="title">
         <span
          v-for="tag in cheatsheet.tags"
          :key="tag.id"
        >{{tag.text}}&nbsp;</span>
        
      </div>
      <!-- <div class="reference">vuemastery</div> -->
      <div class="dropdown" @click.self="toggleDropdown">
        <div class="btn" />
        <transition name="grow">
          <ul class="menu" v-if="showDropdown">
            <!-- <li>Edit Save</li> -->
            <li>src: <a href="vuemastery.com">vuemastery</a></li>
            <li>docs: <a href="vuejs.com">Directory search</a></li>
            <li>
              <div class="tags">
                <div class="tag">tag1</div>
                <div class="tag">tag2</div>
                <div class="tag">tag3</div>
                <div class="tag">tag69492</div>
                <div class="tag">tagio</div>
              </div>
            </li>
          </ul>
        </transition>
      </div>

    </div>
    <div class="content">
      <code>
        {{cheatsheet.content}}
      </code>
    </div>

  </div>
</template>

<script>
export default {
  name: 'CheatSheet',
  props: {
    cheatsheet: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      showDropdown: false,
    }
  },
  methods: {
    toggleDropdown() {
      this.showDropdown = !this.showDropdown
    },
    clickAway() {
      this.showDropdown = false
    },
  },
}
</script>

<style lang="scss" scoped>
@import '../../styles/variables';

$sky: #e6f6fe;
.page {
  height: 50rem;
  // background: oldlace;
}
.card {
  // padding: 12px 16px;
  z-index: 10;
  line-height: 1.25rem;
  background: white;
  font-size: 1rem;
  transition: all 0.2s;
  border-radius: 5px;
  margin: 0.5rem 0.5rem;
  // box-shadow: 0 1px 2px rgba(0, 0, 0,  20%);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
  text-align: left;
  color: $black;
  font-family: $roboto;
  overflow: visible;

  .header {
    background: #e6f6fe;
    font-size: 1.125rem;
    padding: 0 1rem;
    line-height: 1.125rem;
    display: flex;
    height: 2.5rem;
    justify-content: space-between;
    align-items: center;

    .version {
      // background: #9dd5f1;
      // line-height: 1rem;
      // padding: 1px 5px;
      display: inline-block;
      font-size: 0.875rem;
      // height: 1.5rem;
      // background: yellow;
      line-height: 0.875rem;
      vertical-align: super;
      // position:relative;
      // margin-top: -3px;
      color: #9dd5f1;
      // border-radius: 50vmin;
      // display: inline-block;
      // color: white;
      // text-align: center;
    }
    .title {
      line-height: 1.5rem;
      // background: violet;
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

    .dropdown {
      // position: absolute;
      // top: 7px;
      // right: 7px;
      position: relative;
      border-radius: 50vmin;
      padding: 5px;
      background: transparent;
      height: 1.5rem;
      width: 1.5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;

      &:hover{
        background: darken(#e6f6fe, 5);

        .menu {
          opacity: 1;
          display: flex;
        }
      }
      .btn {
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid #9dd5f1;
      }

      .menu {
        position: absolute;
        top: 9px;
        right: 11px;
        background: white;
        flex-direction: column;
        width: 10rem;
        font-size: 0.95rem;
        border: 1px solid #9dd5f1;
        border-radius: 5px ;
        display: flex;
        li{
          padding: 0.5rem;
          transition: all 0.1s;
          border-bottom:1px solid #e6f6fe;

          a {
            font-style: italic;
            color: darken(#9dd5f1,8);
            text-decoration: underline;
            text-underline-offset: 1px;
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
        background: #9dd5f1 ;
        color:white;
        border-radius: 50vmin;
        margin-right: 3px;
        margin-bottom: 3px;
      }
    }

  }

  .content {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;

    hr {
      // box-shadow: 0 0 1px 1px #9dd5f1;
      height: 1px;
      border: none;
    /* Set the hr color */
      color: #e6f6fe; /* old IE */
      background-color: #e6f6fe; /* Modern Browsers */
    }
  }

  code {
    font-family: $firacode;

    span {
      font-family: consolas, cursive;
      font-style: italic;
      font-size: 1rem;
      // font-size: 1.25rem;
      color: hsl(210deg, 10%, 70%);;
    }
  }
}
</style>
