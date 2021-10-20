<template>
<!-- <pre>{{bookmarks}}</pre> -->
<div class="page">
   <Tree v-for="bookmark in bookmarks" :key="bookmark.id" :treeData="bookmark" />
</div>

</template>

<script>
import { mapGetters } from 'vuex'
import Tree from '@/popup/components/Tree'

export default {
  name: 'Bookmarks',
  components: {
    Tree,
  },
  computed: {
    ...mapGetters({
      bookmarks: 'getBookmarks',
    }),
  },
}
</script>

<style lang="scss">
@import "../../styles/mixins";

.page {
  @include scrollbar;
  overflow: scroll;
}
</style>
