<template>
  <div class="page">
    <Navbar />
    <main>
      <Snippet />
    </main>
  </div>
</template>

<script>
import Navbar from '@/popup/components/Navbar'
import Snippet from '@/popup/components/Snippet'

export default {
  name: 'Cheeatsheet',
  data() {
    return {
      backgroundColor: 'white',
    }
  },
  components: {
    Navbar,
    Snippet,
  },
  methods: {
    logger() {
      console.log('click31')
    },
  },
}
</script>

<style>
main {
    display: flex;
    flex-direction: column;
    margin: 6px
  }
</style>
