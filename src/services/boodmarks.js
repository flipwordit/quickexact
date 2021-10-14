import browser from 'webextension-polyfill'

export default {
  async getTree() {
    const tree = await browser.bookmarks.getTree()
    return tree[0].children
  },

  async romove(id) {
    browser.bookmarks.remove(id)
  },

  // move

}

// chrome.windows.getAll({ populate: true }, function (window) {
//   window.forEach(function (window) {
//     window.tabs.forEach(function (tab) {
//       // collect all of the urls here, I will just log them instead
//       console.log(tab.url)
//     })
//   })
// })
