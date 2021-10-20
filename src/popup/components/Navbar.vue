<template>
  <nav class="nav">
    <!-- <vue-tags-input
      v-model="tag"
      :tags="tags"
      :autocomplete-items="filteredItems"
      @tags-changed="newTags => tags = newTags"
    /> -->
    <vue-feather type="search" stroke="#83a0af"/>
    <slot />
    <div class="actions">
      <div class="action">
        <vue-feather type="plus" stroke="#83a0af" />
      </div>
    </div>
  </nav>
</template>

<script>

export default {
  name: 'Navbar',
}

</script>

<style lang="scss">
  .nav {
    // height: 42px;
    display: flex;
    padding: .25rem 1rem;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    font-size: 1.125rem;
    border-bottom: 1px solid #dee8ed;
    // box-shadow: 0 0 4px rgba($color: black, $alpha: .1);
    ::-webkit-input-placeholder { /* Edge */
      color: #83a0af;
    }

    :-ms-input-placeholder { /* Internet Explorer 10-11 */
      color: #83a0af;
    }

    ::placeholder {
      color: #83a0af;
    }

   input {
     flex-grow: 1;
     border: none;
     font-size: 1.25rem;
     outline: none;
     padding: 0.75rem 0.5rem 0.5rem 0.5rem;
     background: transparent;
    //  background: green;
     vertical-align: bottom;
    }

    .action {
      font-size: 2rem;
      padding: 2px;
      height: 35px;
      width: 35px;
      text-align: center;
      border-radius: 50vmin;
    }
  }

</style>
