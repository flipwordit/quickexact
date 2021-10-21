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

    chrome.windows.update(popup, { focused: true },
      (openWindow) => {
        getActiveTab().then((tab) => {
          chrome.tabs.sendMessage(tab.id, "clear", function (response) {
            console.log(response);
          });
        });
      });
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
      break
    case "add-tab-to-session": {
      getActiveTab()
        .then(activeTab => {

          smartotekaFabric.queriesProvider()
            .getSelectSession()
            .then(session => {
              if (session) {
                session.tabs.push(activeTab);

                smartotekaFabric.KBManager().updateSession(session)
                  .then(() => {
                    chrome.tabs.sendMessage(
                      activeTab.id,
                      {
                        message: "Added to '" + session.query + "'"
                      },
                      function (response) {
                        console.log(response.success);
                      });
                  });
              }
              else {

                let session = createDefaultSession([activeTab]);

                smartotekaFabric.KBManager()
                  .addSession(session)
                  .then(() => {
                    smartotekaFabric.KBManager().setSelectSession(session.date);

                    chrome.tabs.sendMessage(
                      activeTab.id,
                      {
                        message: "Added to '" + session.query + "'"
                      },
                      function (response) {
                        console.log(response.success);
                      });
                  });
              }
            })
        });
      break;
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
