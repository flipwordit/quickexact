<template>
  <div>{{message}}</div>
</template>

<script>
import storage from '@/utils/storage'

export default {
  // props: {
  //   message: {
  //     type: String,
  //     default: 'test',
  //   },
  // },
  components: {},
  data() {
    return {
      message: '',
    }
  },
  mounted() {
    let today = new Date().toISOString().slice(0, 10)

    storage
      .get('check-update')
      .then(
        checkUpdate => {
          if (checkUpdate !== today) {
            storage
              .get('app-uuid')
              .then(uuid => {
                this.checkUpdate(uuid, today)
              })
          }
        },
      )
  },
  computed: {},
  methods: {
    checkUpdate(uuid, today) {
      this.axios
        .get('https://localhost:44383/Main', {
          params: { // TODO: put in config
            uuid: uuid,
            extId: chrome.runtime.id,
            version: 'version', // TODO: put in config. And make autogenerate
          },
        })
        .then((response) => {
          let data = response.data

          if (data.isSuccess) {
            storage
              .set({ 'check-update': today })
          }
          if (data.displayMessage) {
            this.message = data.displayMessage
          }
        })
        .catch((e) => {
          console.log(e)
        })
    },
  },
}
</script>

<style lang="scss">
</style>
