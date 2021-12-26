import axios from './axios'

export default {
  // TODO: rename login to password
  // lowercase url with proper route
  async login(email, login) {
    const { id } = chrome.runtime
    const { version } = chrome.runtime.getManifest()
    const { data } = await axios.put('/Main', {
      email,
      login,
      extId: id,
      version,
    })

    return data
  },

  async register(email, login) {
    const { id } = chrome.runtime
    const { version } = chrome.runtime.getManifest()
    const { data } = await axios.post('/Main', {
      email,
      login,
      extId: id,
      version,
    })

    return data
  },
}
