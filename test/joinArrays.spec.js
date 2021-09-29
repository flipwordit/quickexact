const { expect } = require('chai');
require('chai')
var fs = require('fs');
var vm = require('vm');
var path = './src/common/commonFunctions.js';

var code = fs.readFileSync(path);
vm.runInThisContext(code);

describe("join arrays", () => {

  it("should join [], [] = []", () => {
    const result = joinArrays([[], []], el => el);

    expect(0).to.be.eq(result.length, 'should be equal []')
  });


  it("should join [1,2], [] = []", () => {
    const result = joinArrays([[1, 2], []], el => el);

    expect(0).to.be.eq(result.length, 'should be equal []')
  });

  it("should join [1,2], [2] = [2]", () => {
    const result = joinArrays([[1, 2], [2]], el => el);

    expect([2]).deep.equal(result, 'should be equal [2]')
  });

  it("should join [1,2], [0,2,3] = [2]", () => {
    const result = joinArrays([[1, 2], [0, 2, 3]], el => el);

    expect([2]).deep.equal(result, 'should be equal [2]')
  });

  it("should join [1,2,5,7], [0,2,3,5,6] = [2,5]", () => {
    const result = joinArrays([[1, 2, 5, 7], [0, 2, 3, 5, 6]], el => el);

    expect([2, 5]).deep.equal(result, 'should be equal [2,5]')
  });

  it("should join [Chrome, Api, tag, window, get, V3, window], [Chrome, API, tab, event, updated] = [Chrome, API, tab]", () => {
    let toJoin = [
      [{ "id": "Chrome", "text": "Chrome" },
      { "id": "Api", "text": "Api" },
      { "id": "tab", "text": "tab" },
      { "id": "window", "text": "window" },
      { "id": "get", "text": "get" },
      { "id": "V3", "text": "V3" },
      { "id": "get", "text": "get" },
      { "id": "window", "text": "window" }],

      [{ "id": "Chrome", "text": "Chrome" },
      { "id": "Api", "text": "Api" },
      { "id": "tab", "text": "tab" },
      { "id": "event", "text": "event" },
      { "id": "created", "text": "created" }]];

    const result = joinArrays(toJoin, el => el.text);

    expect([
      { "id": "Api", "text": "Api" },
      { "id": "Chrome", "text": "Chrome" },
      { "id": "tab", "text": "tab" }])
      .deep.equal(result, 'should be equal [API, Chrome, tab]')
  });
});