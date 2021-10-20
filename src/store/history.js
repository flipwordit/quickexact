import historyService from '@/services/history'

export default {
  state: () => ({
    records: [],
  }),
  getters: {
    recordsCount(state) {
      return state.records.length
    },
    getRecords: (state) => state.records,
  },

  mutations: {
    UPDATE_RECORDS(state, payload) {
      state.records = payload
    },
  },

  actions: {
    bindListener({ dispatch }) {
      console.log('history listener')
      historyService.removedStream.subscribe(removed => {
        console.log(removed)
      })
      // chrome.history.onVisitRemoved.addListener((removed) => {
      //   console.log(removed)
      // })
    },
    async collectHistory({ commit }, query = '') {
      console.log(query)
      const records = await historyService.search(query)
      commit('UPDATE_RECORDS', records)
    },

  },
}
