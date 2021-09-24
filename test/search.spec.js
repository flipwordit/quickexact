const { expect } = require('chai');


class SmartotekaStub {

  constructor(queryToLinks) {
    this._queryToLinks = queryToLinks || {};
    this._currentQuery = null;
  }

  isUsefulLink(url) {//TODO: May be it needs fuzzy logic, not boolean, for compare urls.
    return this._queryToLinks.indexOf(url) >= 0;
  }

  add(query, url) {
    const links = this._queryToLinks[query];
    links[url] = 1;//Useful
  }

  add(url) {
    if (!this._currentQuery) {
      throw new Error("You should init current query before use it");
    }
  }

  setCurrentQuery(query) {
    let links = this._queryToLinks[query];

    if (!links) {
      links = this._queryToLinks[query] = {};
    }

    this.currentQuery = query;
  }

  addToCurrentQuery(query) {

  }
}

describe("smartoteka search", () => {

  it("should find useful link", () => {
    const link = "https://github.com/dotnet/corefx/blob/master/src/System.IO.MemoryMappedFiles/tests/MemoryMappedFile.CrossProcess.cs#L13";
    const smartoteka = new SmartotekaStub([link]);

    const isUseful = smartoteka.isUsefulLink(link);

    expect(isUseful).to.be.eq(true);
  });

  it("should notfind unuseful link", () => {
    const link = "https://github.com/dotnet/corefx/blob/master/src/System.IO.MemoryMappedFiles/tests/MemoryMappedFile.CrossProcess.cs#L13";
    const smartoteka = new SmartotekaStub();

    const isUseful = smartoteka.isUsefulLink(link);

    expect(isUseful).to.be.eq(false);
  });

  it("should add new url by query", () => {
    const link = "https://github.com/dotnet/corefx/blob/master/src/System.IO.MemoryMappedFiles/tests/MemoryMappedFile.CrossProcess.cs#L13";
    const smartoteka = new SmartotekaStub();

    const isUseful = smartoteka.add("MemoryMappedFile", link);

    expect(isUseful).to.be.eq(false);
  });

  it("should add search query", () => {
    const result = queries("openVPN");

    //expect(result).to.be.eq(5);
  });



  it("should attach usefull link to search query", () => {
    const result = queries("openVPN");

    //expect(result).to.be.eq(5);
  });

});

describe("smartoteka urlComparer", () => {
  it("should equal links", () => {

    const link1 = "https://github.com/dotnet/corefx/blob/master/src/System.IO.MemoryMappedFiles/tests/MemoryMappedFile.CrossProcess.cs";
    const link2 = "https://github.com/dotnet/corefx/blob/master/src/System.IO.MemoryMappedFiles/tests/MemoryMappedFile.CrossProcess.cs#L13";
    const comparer = new Comparer();

    const isEqual = comparer.isEqual(link1, link2);

    expect(isEqual).to.be.eq(true);
  });
});


//TODO: searh by browser history by text, by start\end date
//Grid with history. Grid should allow filter historyItem

//https://github.com/GoogleChrome/chrome-extensions-samples/blob/main/mv2-archive/api/history/showHistory/typedUrls.js
//https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/mv2-archive/api/history/historyOverride


// chrome.history.search({
//   text: "memory"
// }, (result)=>console.log(JSON.stringify(result)))

// [{
//   "id": "32765",
//   "lastVisitTime": 1629312842240.8892,
//   "title": "corefx/MemoryMappedFile.CrossProcess.cs at master · dotnet/corefx",
//   "typedCount": 0,
//   "url": "https://github.com/dotnet/corefx/blob/master/src/System.IO.MemoryMappedFiles/tests/MemoryMappedFile.CrossProcess.cs#L13",
//   "visitCount": 4
// }, {
//   "id": "32769",
//   "lastVisitTime": 1629310410827.184,
//   "title": "Inter-process communication in Linux: Shared files and shared memory | Opensource.com",
//   "typedCount": 0,
//   "url": "https://opensource.com/article/19/4/interprocess-communication-linux-storage",
//   "visitCount": 3
// }]

//search between dates. By sample on the start and end day.

//Search result should highlight google search
//each history item we may make useful. If it is google search - we add new collection or attach to exists.
// If link isn't google - we attach to previos google query or custom text