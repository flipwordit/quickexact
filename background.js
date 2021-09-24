let color = '#3aa757';

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

  // switch (command) {
  //   case "open-search": {
  //     let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  //     //Current tab is this extension
  //     //TODO: relace to find if current extension open in tabs and make it active
  //     //Do we need many tabs with smartoteka? Many windows?
  //     if (tab.url === "chrome-extension://fkfammijpebbgdjblnmkkmobgenppkda/popup.html") {
  //       chrome.tabs.sendMessage(tab.id, "clear", function(response) {
  //         console.log(response);
  //       });
  //     } else {
        chrome.tabs.create({ url: "src/session/session.html" });
  //     }
  //   }
  // }
});

// chrome.action.onClicked.addListener((tab) => {
//   console.log("Tab:" + tab);
// });