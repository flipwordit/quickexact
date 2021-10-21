
function comparer(a, b) {
  return a < b
    ? -1 : (a > b
      ? 1 :
      0);
}
let comparerFunc = (get) => { return (a, b) => comparer(get(a), get(b)); };

let comparerCombine = (comparators) => {
  return (a, b) => {
    for (let i = 0; i < comparators.length; i++) {
      let result = comparerFunc(comparators[i])(a, b);

      if (result != 0)
        return result;
    }

    return 0;
  };
}

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

function secondRunImmediately(func, ms) {

  let savedArgs,
    savedThis;

  let timerId = null;
  function wrapper() {
    savedArgs = arguments;
    savedThis = this;

    if (timerId) {
      clearTimeout(timerId)

      func.apply(savedThis, savedArgs);
      savedArgs = savedThis = null;
    }
    else {
      timerId = setTimeout(function () {
        timerId = null;
        func.apply(savedThis, savedArgs);
        savedArgs = savedThis = null;
      }, ms);
    }
  }

  return wrapper;
}

function moveInArray(arr, fromIndex, toIndex) {
  var element = arr[fromIndex];
  arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, element);
}

function mergeArraysById(a1, a2, getId) {
  return [
    ...a1,
    ...a2.filter(el2 => a1.findIndex(el1 => getId(el1) === getId(el2)) < 0)];
}

function unique(array, getFieldValue) {
  return array.filter((value, index, self) => self.findIndex(el => getFieldValue(el) === getFieldValue(value)) === index)
}

function joinArrays(arrays, getValue) {

  for (let i = 0; i < arrays.length; i++) {
    arrays[i] = arrays[i].sort(comparerFunc(getValue));
  }

  let joinTags = [];
  let indexes = arrays.map(_ => 0);

  for (indexes[0] = 0; indexes[0] < arrays[0].length; indexes[0]++) {
    let value = getValue(arrays[0][indexes[0]]);

    let findCount = 0;
    for (j = 1; j < arrays.length && findCount === j - 1; j++) {
      let currentArray = arrays[j];
      let k = indexes[j];
      for (; k < currentArray.length; k++) {
        let nextArrayValue = getValue(currentArray[k]);

        if (value <= nextArrayValue) {
          findCount = findCount + (value === nextArrayValue ? 1 : 0);
          break;
        }
      }

      indexes[j] = k;
    }

    if (findCount === arrays.length - 1) {
      joinTags.push(arrays[0][indexes[0]]);
    }
  }

  return joinTags;
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

function getTabsByPattern(pattern) {
  return new Promise(r =>
    chrome.tabs.query({}, (tabs) => r(tabs))
  );
}

function getActiveTab() {
  return new Promise(r =>
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => r(tabs.length ? tabs[0] : null))
  );
}

function closeTabs(tabs) {
  return new Promise(r =>
    chrome.tabs.remove(tabs.map(el => el.id), r)
  );
}

function closeTabsByUrlIfOpen(tabsToClose) {
  let tabUrls = tabsToClose.map(tab => tab.url);

  getAllTabs()
    .then((tabs) => {
      let getTabsToClose = () => tabs.filter(tab => tabUrls.indexOf(tab.url) >= 0);
      closeTabs(getTabsToClose());

      let tabsToClose = getTabsToClose();

      if (tabsToClose.length === 1) {
        chrome.windows.remove(tabsToClose.map(tab => tab.windowId)[0]);
      }
    });
}

function redirectCurrentTab(url) {
  window.location.assign(url);
}

function createDefaultSession(tabs) {
  let now = new Date();
  let dateCreation = now.valueOf();

  let session = {
    date: dateCreation,
    query: now.toLocaleString({ year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric" }),
    tags: [],
    tabs: tabs
  };
  return session;
}

window.unique = unique;
window.comparerCombine = comparerCombine;
window.throttle = throttle;
window.secondRunImmediately = secondRunImmediately;

window.openTabs = openTabs;
window.openTabsInNewWindow = openTabsInNewWindow;
window.closeTabsByUrlIfOpen = closeTabsByUrlIfOpen;
window.redirectCurrentTab = redirectCurrentTab;
window.getActiveTab = getActiveTab;

window.createDefaultSession = createDefaultSession;