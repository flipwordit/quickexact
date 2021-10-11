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
      // let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      // //Current tab is this extension
      // //TODO: relace to find if current extension open in tabs and make it active
      // //Do we need many tabs with smartoteka? Many windows?
      // if (tab.url === "chrome-extension://fkfammijpebbgdjblnmkkmobgenppkda/popup.html") {
      //   chrome.tabs.sendMessage(tab.id, "clear", function(response) {
      //     console.log(response);
      //   });
      // } else {
      chrome.tabs.create({
        url:
          //"src/cheatsheets/cheatsheet.html"
          "src/session/session.html"
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
                        { message: "Added to '" + session.query + "'" }, function (response) {
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
                        { message: "Added to '" + session.query + "'" }, function (response) {
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