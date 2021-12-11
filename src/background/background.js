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
import { getActiveTab, createDefaultSession, getSmartotekaFabric } from '@/src_jq/common/commonFunctions'

async function getOrCreatePopup(url, width, height) {
  let activateTab = async (tab) => {
    let value = {}
    value[url] = tab.id
    await storage.set(value)
  }

  let create = () => chrome.windows.create(
    {
      url: chrome.runtime.getURL(url),
      type: 'popup',
      focused: true,
      height: height,
      width: width,
      top: 0,
      left: 0,
      // alwaysOnTop: true,
    },
    activateTab,
  )

  let open = async () => {
    let popup = await storage.get(url)
    if (popup) {
      chrome.windows.update(popup, { focused: true },
        (openWindow) => {
          if (openWindow) {
            getActiveTab().then((tab) => {
              chrome.tabs.sendMessage(tab.id, 'clear', function (response) {
                console.log(response)
              })
            })
            return
          }

          create()
        })
    } else {
      create()
    }
  }

  chrome.windows.getCurrent(
    {},
    async (window) => {
      let value = {}
      value.windowId = window.id
      await storage.set(value)

      await open()
    },
  )
}

async function openPopup() {
  await getOrCreatePopup('popup/popup.html#/', 500, 1000)
}

chrome.commands.onCommand.addListener(async (command) => {
  console.log('Command:' + command)
  switch (command) {
    case 'search':
      openPopup()
      break
    case 'add-tab-to-session': {
      getActiveTab()
        .then(activeTab => {
          let smartotekaFabric = getSmartotekaFabric()
          smartotekaFabric.queriesProvider()
            .getSelectSession()
            .then(session => {
              if (session) {
                session.tabs.push(activeTab)

                smartotekaFabric.KBManager().updateSession(session)
                  .then(() => {
                    chrome.tabs.sendMessage(
                      activeTab.id,
                      {
                        message: "Added to '" + session.query + "'",
                      },
                      function (response) {
                        console.log(response.success)
                      },
                    )
                  })
              } else {
                session = createDefaultSession([activeTab])

                smartotekaFabric.KBManager()
                  .addSession(session)
                  .then(() => {
                    smartotekaFabric.KBManager().setSelectSession(session.id)

                    chrome.tabs.sendMessage(
                      activeTab.id,
                      {
                        message: "Added to '" + session.query + "'",
                      },
                      function (response) {
                        console.log(response.success)
                      },
                    )
                  })
              }
            })
        })
      break
    }
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
