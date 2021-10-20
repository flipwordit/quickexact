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

window.orderByRate = orderByRate;
window.takeByRate = takeByRate;
