import { createStore } from 'vuex'
import { debounce } from 'lodash'
import tabsService from '@/services/tabs'
import historyService from '@/services/history'
import bookmarksService from '@/services/boodmarks'

const store = createStore({
  state() {
    return {
      windows: [],
      sessions: [],
      bookmarks: [],
      records: [],
    }
  },
  getters: {
    getQuery(state) {
      return state.query
    },
    tabsCount(state) {
      return state.windows.reduce((acc, item) => {
        acc += item.tabs.length
        return acc
      }, 0)
    },
    recordsCount(state) {
      return state.records.length
    },
    getBookmarks: (state) => state.bookmarks,
    getRecords: (state) => state.records,
    getWindows: (state) => state.windows,
  },
  mutations: {
    UPDATE_WINDOWS(state, payload) {
      state.windows = payload
    },
    UPDATE_RECORDS(state, payload) {
      state.records = payload
    },
    UPDATE_BOOKMARKS(state, payload) {
      state.bookmarks = payload
    },
  },
  actions: {
    async collectWindows({ commit }, query) {
      const allWindows = await tabsService.getWindows()

      if (query) {
        const windows = allWindows.filter(item => {
          item.tabs.filter(tab => tab.title.includes('-'))
          return Boolean(item)
        })
        console.log(windows.length)
        // console.log(windows)
        commit('UPDATE_WINDOWS', windows)
      } else {
        commit('UPDATE_WINDOWS', allWindows)
      }

      // const options = {
      //   includeScore: true,
      //   keys: ['tabs.title', 'tabs.url'],
      // }

      // if (query) {
      //   const fuse = new Fuse(allWindows, options)
      //   const windows = fuse.search(query)
      //
      // } else {
      //   commit('UPDATE_WINDOWS', allWindows)
      // }
    },
    collectSessions() {},
    async collectHistory({ commit }, query = '') {
      console.log(query)
      const records = await historyService.search(query)
      commit('UPDATE_RECORDS', records)
    },
    async collectBookmarks() {
      const bookmarks = await bookmarksService.getTree()
      console.log(bookmarks)
      this.commit('UPDATE_BOOKMARKS', bookmarks)
    },
  },
})

export default store
