import { expect } from 'chai'



import { window1 } from "../../src/src_jq/common/commonFunctions.js"
import { window } from "../../src/src_jq/common/cheatSheetsManage.js"

describe('Cheatsheets group', () => {
  it('join two with equal part', () => {
    let cheatsheets = [{
      "content": "Format document Alt + Shift + F",
      "date": 1633335302157,
      "tags": [{
        "id": "vs code",
        "text": "vs code"
      }, {
        "id": "vs",
        "text": "vs"
      }, {
        "id": "shortcut",
        "text": "shortcut"
      }, {
        "id": "format",
        "text": "format"
      }]
    }, {
      "content": "Go back - Alt + Left",
      "date": 1633338304074,
      "tags": [{
        "id": "vs code",
        "text": "vs code"
      }, {
        "id": "vs",
        "text": "vs"
      }, {
        "id": "shortcut",
        "text": "shortcut"
      }, {
        "id": "go",
        "text": "go"
      }]
    }];

    let groups = global.window.cheatsheetsGroup(cheatsheets);

    expect(groups.length).to.eq(1)
    expect(groups[0].commonTagsCount).to.eq(3)
    expect(groups[0].items.length).to.eq(2)
  })

  it('join 2 with not equal tags', () => {
    let cheatsheets = [{
      "content": "",
      "date": 1633335302157,
      "tags": [{
        "id": "format",
        "text": "format"
      }]
    }, {
      "content": "",
      "date": 1633338304074,
      "tags": [{
        "id": "go",
        "text": "go"
      }]
    }];

    let groups = global.window.cheatsheetsGroup(cheatsheets);


    expect(groups.length).to.eq(1)
    expect(groups[0].commonTagsCount).to.eq(0)
    expect(groups[0].items.length).to.eq(2)
  })

  it('join 3 with not equal tags', () => {
    let cheatsheets = [{
      "content": "",
      "date": 1633335302157,
      "tags": [{
        "id": "format",
        "text": "format"
      }]
    }, {
      "content": "",
      "date": 1633338304074,
      "tags": [{
        "id": "go",
        "text": "go"
      }]
    }
      , {
      "content": "",
      "date": 1633338304074,
      "tags": [{
        "id": "t",
        "text": "t"
      }]
    }];

    let groups = global.window.cheatsheetsGroup(cheatsheets);


    expect(groups.length).to.eq(1)
    expect(groups[0].commonTagsCount).to.eq(0)
    expect(groups[0].items.length).to.eq(3)
  })

  it('join 2 with not equal tags and two to group', () => {
    let cheatsheets = [{
      "content": "",
      "date": 1633335302157,
      "tags": [{
        "id": "format",
        "text": "format"
      }]
    }, {
      "content": "",
      "date": 1633338304074,
      "tags": [{
        "id": "go",
        "text": "go"
      }]
    }, {
      "content": "",
      "date": 1633338304074,
      "tags": [{
        "id": "t",
        "text": "t"
      }]
    }, {
      "content": "",
      "date": 1633338304075,
      "tags": [{
        "id": "t",
        "text": "t"
      }]
    }];

    let groups = global.window.cheatsheetsGroup(cheatsheets);


    expect(groups.length).to.eq(2)
    expect(groups[0].commonTagsCount).to.eq(0)
    expect(groups[0].items.length).to.eq(2)

    expect(groups[1].commonTagsCount).to.eq(1)
    expect(groups[1].items.length).to.eq(2)
  })

  it('join 3. 1 and 2 equal 1 tag, 2 and 3 equal 2 tags', () => {
    let cheatsheets = [{
      "content": "",
      "date": 1,
      "tags": [{
        "id": "1",
        "text": "1"
      }]
    }, {
      "content": "",
      "date": 2,
      "tags": [{
        "id": "1",
        "text": "1"
      },
      {
        "id": "2",
        "text": "2"
      }]
    }, {
      "content": "",
      "date": 3,
      "tags": [{
        "id": "1",
        "text": "1"
      },
      {
        "id": "2",
        "text": "2"
      }]
    }];

    let groups = global.window.cheatsheetsGroup(cheatsheets);


    expect(groups.length).to.eq(1)
    expect(groups[0].commonTagsCount).to.eq(1)
    expect(groups[0].items.length).to.eq(1)

    expect(groups[0].groups.length).to.eq(1)
    expect(groups[0].groups[0].items.length).to.eq(2)
  })

  it('join 4. 1 and 2 equal 1 tag, 2 and 3 equal 2 tags + NOT EQUAL', () => {
    let cheatsheets = [{
      "content": "",
      "date": 1,
      "tags": [{
        "id": "1",
        "text": "1"
      }]
    }, {
      "content": "",
      "date": 2,
      "tags": [{
        "id": "1",
        "text": "1"
      },
      {
        "id": "2",
        "text": "2"
      }]
    }, {
      "content": "",
      "date": 3,
      "tags": [{
        "id": "1",
        "text": "1"
      },
      {
        "id": "2",
        "text": "2"
      }]
    }, {
      "content": "",
      "date": 3,
      "tags": [{
        "id": "11",
        "text": "11"
      },
      {
        "id": "22",
        "text": "22"
      }]
    }];

    let groups = global.window.cheatsheetsGroup(cheatsheets);


    expect(groups.length).to.eq(2)
    expect(groups[0].commonTagsCount).to.eq(1)
    expect(groups[0].items.length).to.eq(1)

    expect(groups[0].groups.length).to.eq(1)
    expect(groups[0].groups[0].items.length).to.eq(2)

    expect(groups[1].commonTagsCount).to.eq(-1)
    expect(groups[1].items.length).to.eq(1)
  })

  it('2 not queal should union to group', () => {
    let cheatsheets = [{
      "content": "",
      "date": 0,
      "tags": [{
        "id": "0",
        "text": "0"
      }]
    },
    {
      "content": "",
      "date": 1,
      "tags": [{
        "id": "1",
        "text": "1"
      }]
    }, {
      "content": "",
      "date": 2,
      "tags": [{
        "id": "1",
        "text": "1"
      },
      {
        "id": "2",
        "text": "2"
      }]
    }, {
      "content": "",
      "date": 3,
      "tags": [{
        "id": "1",
        "text": "1"
      },
      {
        "id": "2",
        "text": "2"
      }]
    }, {
      "content": "",
      "date": 4,
      "tags": [{
        "id": "11",
        "text": "11"
      },
      {
        "id": "22",
        "text": "22"
      }]
    }];

    let groups = global.window.cheatsheetsGroup(cheatsheets);


    expect(groups.length).to.eq(2)
    expect(groups[0].commonTagsCount).to.eq(0)
    expect(groups[0].items.length).to.eq(2)

    expect(groups[1].commonTagsCount).to.eq(1)
    expect(groups[1].items.length).to.eq(1)
    expect(groups[1].groups.length).to.eq(1)
    expect(groups[1].groups[0].items.length).to.eq(2)
  })
})
