
**chrome.tabs**

permission: [“tabs”]



V2 - callbacks
```
let tab = chrome.tabs.create({ url: '<url>', windowId:106, active:false, index:0, pinned:true}); //pinned – fast access. Tab on left
```

```
chrome.tabs.remove(<tabId>|[<tabId>]);
```
let tabs = chrome.tabs.getAllInWindow(<windowIdOrNullForCurrent>)

Inject script to page
```
let resultOfScript = await chrome.tabs.execute(<tabIdOrNullForAcitveTab>, {code:"return 1", runAt:"document_start" /*end, idle(default)"*/,file:"urlToJsOrCSSFile", allFrames:true /*or framesId:["frame1"]*/})})
```

[V3](https://developer.chrome.com/docs/extensions/mv3/intro/) -promises

```
let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
let tab = await chrome.tabs.getCurrent();
let tab = await chrome.tabs.getSelected(<windowIdOrNullForCurrent>);
let tab = await chorme.tabs.get(<tabId>);
await chrome.tabs.move(activeInfo.tabId, {index: 0});
V2: let tabs = chrome.tabs.getAllInWindow(<windowIdOrNullForCurrent>)


get current tab

V3: let tabs = chrome.tabs.query({windowId:<windowIdOrNullForCurrent>/*or currentWindow:true*/})
let tabs = await chrome.tabs.query({active:true, groupId:<1>, lastFocusedWindow:true, pinned:true, title:"title", ulr:"<url>"/*or ["url"]*/, windowId:<windowId>, windowType:"normal"/*"popup", "panel", "app", "devtools"*/});
```

```
V3: let [{frameId, resultOfScript}] = await chrome.scripting.executeScript({target:{tabId:<tabId>, allFrames:true /*or framesId:["frame1"]*/}, files:["urlToJsOrCSSFile"]/*or func: and agrs:*/ })
```
```
V2: chrome.tabs.insertCSS(<tabIdOrNullForAcitveTab>, {code:"return 1", runAt:"document_start" /*end, idle(default)"*/,file:"urlToCSSFile", allFrames:true /*or framesId:["frame1"]*/})}, callback)
```
V3: await chrome.scripting.insertCSS({target:{tabId:<tabId>, allFrames:true/*or framesId:["frame1"]*/}, files:["urlToCSSFile"]/*or css:"<cssrules>"*/ })

chrome.tabs.sendMessage(<tabId>,"message"/*or object {prop:value}*/,{frameId:1}, (responseOfHandler)=>{});
```


The <code>[runtime.onMessage](https://developer.chrome.com/docs/extensions/reference/runtime/#event-onMessage)</code> event is fired in each content script running in the specified tab for the current extension.


```
V2: chrome.tabs.sendRequest(<tabId>,"message"/*or object {prop:value}*/,{frameId:1}, (responseOfHandler)=>{});
```


The <code>[extension.onRequest](https://developer.chrome.com/docs/extensions/reference/extension/#event-onRequest)</code> event is fired in each content script running in the specified tab for the current extension.

<code>V3: chrome.[runtime.sendMessage](https://developer.chrome.com/docs/extensions/reference/runtime/#method-sendMessage)</code>.

```
let group = chrome.tabs.group({createProperties:{windowId:;windowIdOrNullForCurrent, groupId:groupId>, tabIds:[105]});
```

Highlights and focus on the first tab
```
let window = chrome.tabs.highlight({tabs:[104], windowId;`windowIdOrNullForCurrent`})
```

Events
```
chrome.tabs.onCreated.addListener(tab => {});
chrome.tabs.onUpdated.addListener((tabId, changeInfo/*how tab*/, tab) => {});
chrome.tabs.onRemoved.addListener((tabId,{isWindowClosing, windowId}) => {});

chrome.tabs.onActivated.addListener(activeInfo: {tabId, windowId} => {});
chrome.tabs.onDetached.addListener((tabId, {oldPosition, oldWindowsId})=>{});
chrome.tabs.onHighlighted.addListener({tabIds, windowId} => {});
chrome.tabs.onMoved.addListener((tabId, {fromIndex, toIndex, windowId}) => {});
```


<code>More examples </code>[mv2-archive/api/tabs](https://github.com/GoogleChrome/chrome-extensions-samples/tree/master/mv2-archive/api/tabs/)
