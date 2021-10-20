import { fromEventPattern } from 'rxjs'
import browser from 'webextension-polyfill'

function eventStream(event) {
  return fromEventPattern(
    (handler) => event.addListener(handler),
    (handler) => event.removeListener(handler),
  )
}

export default {
  async getWindows() {
    const windows = await browser.windows.getAll({ populate: true })
    return windows
  },

  async activateTab(id) {
    browser.tabs.update(id, { active: true })
  },

  async activateWindow(id) {
    browser.windows.update(id, { focused: true })
  },

  async minimizeWindow(id) {
    browser.windows.update(id, { state: 'minimized' })
  },
  async maximizeWindow(id) {
    browser.windows.update(id, { state: 'maximized' })
  },

  async drawAttention(id) {
    browser.windows.update(id, { drawAttention: true })
  },

  async closeTab(id) {
    browser.tabs.remove(id)
  },

  get createStream() {
    return eventStream(chrome.tabs.onCreated)
  },

}

// chrome.windows.getAll({ populate: true }, function (window) {
//   window.forEach(function (window) {
//     window.tabs.forEach(function (tab) {
//       // collect all of the urls here, I will just log them instead
//       console.log(tab.url)
//     })
//   })
// })
