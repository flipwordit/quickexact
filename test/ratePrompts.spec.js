const { expect } = require('chai');
require('chai')
var fs = require('fs');
var vm = require('vm');

function includeFile(path) {
  var code = fs.readFileSync(path);
  vm.runInThisContext(code);
}

//includeFile('./src/common/rateTags.js');
includeFile('./src/libraries/Fuse.js');

let tagsArray = [{
  "tag": "Api",
  "tagCount": 11,
  "prefix": "Chrome,Api,",
  "prefixCount": 11
}, {
  "tag": "tab",
  "tagCount": 11,
  "prefix": "Chrome,Api,tab,",
  "prefixCount": 10
}, {
  "tag": "tab",
  "tagCount": 11,
  "prefix": "Chrome,Api,V3,tab,",
  "prefixCount": 1
}, {
  "tag": "active",
  "tagCount": 3,
  "prefix": "Chrome,Api,tab,active,",
  "prefixCount": 2
}, {
  "tag": "active",
  "tagCount": 3,
  "prefix": "Chrome,Api,tab,event,active,",
  "prefixCount": 1
}, {
  "tag": "current",
  "tagCount": 2,
  "prefix": "Chrome,Api,tab,active,current,",
  "prefixCount": 1
}, {
  "tag": "current",
  "tagCount": 2,
  "prefix": "Chrome,Api,tab,current,",
  "prefixCount": 1
}, {
  "tag": "selected",
  "tagCount": 1,
  "prefix": "Chrome,Api,tab,selected,",
  "prefixCount": 1
}, {
  "tag": "Id",
  "tagCount": 1,
  "prefix": "Chrome,Api,tab,active,Id,",
  "prefixCount": 1
}, {
  "tag": "get",
  "tagCount": 2,
  "prefix": "Chrome,Api,tab,get,",
  "prefixCount": 1
}, {
  "tag": "get",
  "tagCount": 2,
  "prefix": "Chrome,Api,V3,tab,get,",
  "prefixCount": 1
}, {
  "tag": "window",
  "tagCount": 3,
  "prefix": "Chrome,Api,tab,get,window,",
  "prefixCount": 1
}, {
  "tag": "window",
  "tagCount": 3,
  "prefix": "Chrome,Api,V3,tab,get,window,",
  "prefixCount": 1
}, {
  "tag": "window",
  "tagCount": 3,
  "prefix": "Chrome,Api,tab,event,closed,window,",
  "prefixCount": 1
}, {
  "tag": "V3",
  "tagCount": 1,
  "prefix": "Chrome,Api,V3,",
  "prefixCount": 1
}, {
  "tag": "event",
  "tagCount": 5,
  "prefix": "Chrome,Api,tab,event,",
  "prefixCount": 5
}, {
  "tag": "created",
  "tagCount": 1,
  "prefix": "Chrome,Api,tab,event,created,",
  "prefixCount": 1
}, {
  "tag": "updated",
  "tagCount": 1,
  "prefix": "Chrome,Api,tab,event,updated,",
  "prefixCount": 1
}, {
  "tag": "closed",
  "tagCount": 1,
  "prefix": "Chrome,Api,tab,event,closed,",
  "prefixCount": 1
}, {
  "tag": "move",
  "tagCount": 1,
  "prefix": "Chrome,Api,tab,event,move,",
  "prefixCount": 1
}];

describe("rate tags match", () => {


  it("should return with big score and frequency", () => {
    const result = orderByRate(tagsArray, "tab");

    expect("tab").to.be.eq(result[0].tag, 'should be equal "tab"')
    expect("event").to.be.eq(result[1].tag, 'should be equal "event", because event popular then others')
  });

  it("should return with tab event -> tab and event first", () => {
    const result = orderByRate(tagsArray, "tab even");

    expect("event").to.be.eq(result[0].tag, 'should be equal "event"')
  });
});

describe("rate and take tags match", () => {


  it("should return only tab", () => {
    const result = takeByRate(orderByRate(tagsArray, "tab"));

    expect(2).to.be.eq(result.length, 'should be equal "tab"')
    expect("tab").to.be.eq(result[0].tag, 'should be equal "tab"')
    expect("event").to.be.eq(result[1].tag, 'should be equal "tab"')
  });

  it("should take with tab event -> tab and event first", () => {
    const result = takeByRate(orderByRate(tagsArray, "tab even"));

    expect("event").to.be.eq(result[0].tag, 'should be equal "event"')
  });
});

function orderByRate(array, term) {
  const fuse = new Fuse(array, {
    includeScore: true,
    useExtendedSearch: true,
    keys: [{ name: 'tag', weight: 0.7 }, { name: 'prefix', weight: 0.3 }]
  })

  let result = fuse.search(term);


  result = result
    .map(el => {
      el.item.score = el.score;
      el.item.rate = -(1 - el.score) * el.item.prefixCount / result.length

      return el.item;
    });;

  result = result
    .sort(
      comparerCombine([
        el => el.rate,
        // el => el.item.prefixCount,
        //   el => el.item.tagCount
      ])
    );

  return result;
}

function takeByRate(array) {
  let take = [];
  //TOdO: как отобрать наиболее значимые? Что это значит?

  let prevScope = array.length > 0 ? array[0].score : 0;
  let prevCount = array.length > 0 ? array[0].prefixCount / array.length : 0;

  let countfindValues = Math.min(10, array.length);
  let countSum = 0;
  for (let i = 0; i < countfindValues; i++) {
    if (prevScope - array[i].score > 0.001) {
      countfindValues = 3
    }
    let currentCount = array[i].prefixCount / array.length;
    if (prevCount - currentCount > 0.1 && countSum > 0.7) {//TODO: может еще сумма процента участия
      break;
    }

    countSum += currentCount;
    prevCount = currentCount;

    take.push(array[i]);
  }

  return take;
}