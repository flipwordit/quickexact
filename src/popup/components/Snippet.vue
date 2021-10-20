<template>
  <div class="card">
    <div class="header">
      <div class="title">Vue.Directives
        <span class="version">v3</span>
      </div>
      <!-- <div class="reference">vuemastery</div> -->
      <div class="dropdown" @click.stop="toggleDropdown">
        <div class="btn" />
        <ul class="menu" v-if="showDropdown" v-click-outside="toggleDropdown">
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
      </div>

    </div>
    <div class="content">
      <Markdown :source="source" />
    </div>

  </div>
</template>

<script>
export default {
  name: 'Snippet',
  data() {
    return {
      showDropdown: false,
      source: '# Hello World!  ## dkroifeoqieure',
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
$aqua:  #9dd5f1;

.page {
  height: 50rem;
}
.card {
  z-index: 10;
  line-height: 1.25rem;
  background: white;
  font-size: 1rem;
  transition: all 0.2s;
  border-radius: 5px;
  margin: 0.5rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
  text-align: left;
  color: $black;
  font-family: $roboto;
  overflow: visible;

  .header {
    background: $sky;
    font-size: 1.125rem;
    padding: 0 1rem;
    line-height: 1.125rem;
    display: flex;
    height: 2.5rem;
    justify-content: space-between;
    align-items: center;
    position: relative;

    .version {
      font-size: 0.875rem;
      line-height: 0.875rem;
      vertical-align: super;
      color: $aqua;
    }
    .title {
      line-height: 1.5rem;
      vertical-align: middle;
      font-weight: 500;
      color: #194c66;
    }

    .dropdown {
      position: relative;
      border-radius: 50vmin;
      background: transparent;
      height: 1.5rem;
      width: 1.5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;

      &:hover{
        background: darken( $sky, 5);

        // .menu {
        //   opacity: 1;
        //   display: flex;
        // }
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
        border: 1px solid $aqua;
        border-radius: 5px ;
        display: flex;
        li{
          padding: 0.5rem;
          transition: all 0.1s;
          border-bottom:1px solid $sky;

          a {
            font-style: italic;
            color: $aqua;
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
        padding: 0 0.5rem;
        background: $aqua;
        color:white;
        border-radius: 50vmin;
        margin: 2px;
      }
    }

  }

  .content {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;

    // hr {
    //   // box-shadow: 0 0 1px 1px #9dd5f1;
    //   height: 1px;
    //   border: none;
    // /* Set the hr color */
    //   color: $sky; /* old IE */
    //   background-color: $sky; /* Modern Browsers */
    // }
  }

  // code {
  //   font-family: $firacode;

  //   span {
  //     font-family: consolas, cursive;
  //     font-style: italic;
  //     font-size: 1rem;
  //     // font-size: 1.25rem;
  //     color: hsl(210deg, 10%, 70%);;
  //   }
  // }
}
</style>
