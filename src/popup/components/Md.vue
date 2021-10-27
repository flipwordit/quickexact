<template>
  <span class="markdown" v-html="html"></span>
</template>

<script>
import { micromark } from 'micromark'

export default {
  name: 'Md',
  props: {
    source: String,
  },
  computed: {
    html() {
      return micromark(this.source || '')
    },
  },
}
</script>

<style lang="scss">
@import '../../styles/variables';
$sky: #e6f6fe;
$aqua:  #9dd5f1;

.markdown {
  font-family: consolas, cursive;
  font-style: italic;
  font-size: 1rem;
  color: hsl(210deg, 10%, 70%);

  code {
    font-family: $firacode;
    font-style: normal;
    color: #20252a;
    font-size: 0.875rem;
  }

  em {
    font-weight: bold;
  }

  hr {
        // box-shadow: 0 0 1px 1px #9dd5f1;
        height: 1px;
        border: none;
      /* Set the hr color */
        color: $sky; /* old IE */
        background-color: $sky; /* Modern Browsers */
  }
}

</style>
