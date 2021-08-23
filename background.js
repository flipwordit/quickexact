let color = '#3aa757';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ color });
  console.log('Default background color set to %cgreen', `color: ${color}`);
});


chrome.tabs.onActivated.addListener(activeInfo => move(activeInfo));

async function move(activeInfo) {
 console.log(activeInfo);
}

chrome.commands.onCommand.addListener((command) => {
  console.log("Command:"+command);
});

chrome.action.onClicked.addListener((tab) => {
    console.log("Tab:"+tab);
});