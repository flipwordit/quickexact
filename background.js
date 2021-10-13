let smartotekaFabric =
  //new SmartotekaFabricDGraph("https://blue-surf-390018.us-east-1.aws.cloud.dgraph.io/")
  new SmartotekaFabricLocalStorage();

//let color = '#3aa757';

// chrome.runtime.onInstalled.addListener(() => {
//   chrome.storage.sync.set({ color });
//   console.log('Default background color set to %cgreen', `color: ${color}`);
// });


// chrome.tabs.onActivated.addListener(activeInfo => move(activeInfo));

// async function move(activeInfo) {
//   console.log(activeInfo);
// }

chrome.commands.onCommand.addListener(async (command) => {
  console.log("Command:" + command);

  switch (command) {
    case "open-search": {
      const urlSessionPage = "src/session/session.html";

      getActiveTab()
        .then(activeTab => {
          if (activeTab.url.indexOf(chrome.runtime.id) >= 0) {
            chrome.tabs.update(activeTab.id, { url: urlSessionPage })
          } else {
            chrome.tabs.query({ currentWindow: true, url: "chrome-extension://" + chrome.runtime.id + "/" + urlSessionPage },
              (tabs) => {
                if (tabs.length) {
                  chrome.tabs.update(tabs[0].id, { highlighted: true },
                    () => {
                      chrome.tabs.reload();
                    });
                } else {
                  chrome.tabs.create({
                    url:
                      //"src/cheatsheets/cheatsheet.html"
                      urlSessionPage
                  });
                }
              });
          }
        });
      break;
    }
    case "add-tab-to-session": {
      chrome.tabs
        .query({ active: true, currentWindow: true },
          (tabs) => {
            var activeTab = tabs[0];

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
                  let now = new Date();
                  let dateCreation = now.valueOf();

                  let session = {
                    date: dateCreation,
                    query: now.toLocaleString({ year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric" }),
                    tags: [],
                    tabs: [activeTab]
                  };

                  smartotekaFabric.KBManager().addSession(session)
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
  }
});

// chrome.action.onClicked.addListener((tab) => {
//   console.log("Tab:" + tab);
// });