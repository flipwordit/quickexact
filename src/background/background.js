// for vuex sync
// import store from '../store/index'

// chrome.runtime.onInstalled.addListener(() => {
//   chrome.storage.sync.set({ color });
//   console.log('Default background color set to %cgreen', `color: ${color}`);
// });

// chrome.tabs.onActivated.addListener(activeInfo => move(activeInfo));

// async function move(activeInfo) {
//   console.log(activeInfo);
// }

// TODO move to separate module
import storage from '@/utils/storage'

async function openPopup() {
  let popup = await storage.get('popup')
  if (popup) {
    chrome.windows.update(popup, { focused: true })
  } else {
    chrome.windows.create(
      {
        url: chrome.runtime.getURL('popup/popup.html#/'),
        type: 'popup',
        focused: true,
        height: 1000,
        width: 500,
        top: 0,
        left: 0,
        // alwaysOnTop: true,
      },
      async (evt) => {
        await storage.set({ popup: evt.id })
      },
    )
    // focus current open window
  }
}

chrome.commands.onCommand.addListener(async (command) => {
  console.log('Command:' + command)
  switch (command) {
    case 'search':
      openPopup()
      // let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      // Current tab is this extension
      // TODO: relace to find if current extension open in tabs and make it active
      // Do we need many tabs with smartoteka? Many windows?
      if (tab.url === 'chrome-extension://fkfammijpebbgdjblnmkkmobgenppkda/popup.html') {
        chrome.tabs.sendMessage(tab.id, 'clear', function (response) {
          console.log(response)
        })
      } else {
        chrome.tabs.create({ url: 'popup.html' })
      }
      break
    default: {
      console.log(command)
    }
  }
})

chrome.runtime.onInstalled.addListener(async (details) => {
  await storage.set({ popup: null })
})

chrome.browserAction.onClicked.addListener((tab) => {
  openPopup()
})

chrome.windows.onRemoved.addListener(async (windowId) => {
  let popup = await storage.get('popup')
  if (windowId === popup) {
    await storage.set({ popup: null })
  }
})

// chrome.action.onClicked.addListener((tab) => {
//   console.log("Tab:" + tab);
// });
