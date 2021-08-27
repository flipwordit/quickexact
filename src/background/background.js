// for vuex sync
// import store from '../store/index'
console.log('background3')

let color = '#3aa757'

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ color })
  console.log('Default background color set to %cgreen', `color: ${color}`)
})
async function move(activeInfo) {
  console.log(activeInfo)
}

chrome.tabs.onActivated.addListener(activeInfo => move(activeInfo))

chrome.commands.onCommand.addListener((command) => {
  console.log('Command:' + command)
})

chrome.action.onClicked.addListener((tab) => {
  console.log('Tab:' + tab)
})
