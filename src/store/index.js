import { createStore } from 'vuex'
import Fuse from 'fuse.js'
import { debounce } from 'lodash'
import tabsService from '@/services/tabs'

const store = createStore({
  state() {
    return {
      tabs: [],
      sessions: [],
      bookmarks: [],
      history: [],
    }
  },
  getters: {
    getQuery(state) {
      return state.query
    },
    getWindows: (state) => state.windows,
  },
  mutations: {
    UPDATE_WINDOWS(state, payload) {
      state.windows = payload
    },
  },
  actions: {
    async collectWindows({ commit }, query) {
      const allWindows = await tabsService.getWindows()
      const options = {
        includeScore: true,
        keys: ['tabs.title', 'tabs.url'],
      }

      if (query) {
        const fuse = new Fuse(allWindows, options)
        const windows = fuse.search(query)
        commit('UPDATE_WINDOWS', windows)
      } else {
        commit('UPDATE_WINDOWS', allWindows)
      }
    },
    collectSessions() {},
    collectHistory() {},
    collectBookmarks() {},
  },
})

export default store
