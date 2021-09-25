
function throttle(func, ms) {

  let savedArgs,
    savedThis;

  let timerId = null;
  function wrapper() {
    savedArgs = arguments;
    savedThis = this;

    if (timerId)
      clearTimeout(timerId)

    timerId = setTimeout(function () {
      timerId = null;
      func.apply(savedThis, savedArgs);
      savedArgs = savedThis = null;
    }, ms);
  }

  return wrapper;
}

function openTabs(tabs, windowId) {
  windowId = windowId || chrome.windows.WINDOW_ID_CURRENT;

  tabs.forEach(tab => chrome.tabs.create({ url: tab.url, windowId }));
}

function openTabsInNewWindow(tabs) {
  if (!tabs.length) {
    return;
  }

  createWindow(tabs[0].url)
    .then(window => {
      tabs.splice(0, 1);

      openTabs(tabs, window.id);
    });
}

function createWindow(url) {
  return new Promise(r => {
    chrome.windows.create({ url: url }, window => r(window));
  });
}

function getAllTabs() {
  return new Promise(r =>
    chrome.tabs.query({}, (tabs) => r(tabs))
  );
}

function closeTabs(tabs) {
  return new Promise(r =>
    chrome.tabs.remove(tabs.map(el=>el.id), r)
  );
}