$('#clear-filter-tags-btn').click(_ => {
  $('#filter-tags')
    .val(null)
    .trigger('change');
});

setTimeout(() => {
  $('.select2-search__field, .select2-search').keydown(function (e) {
    if (e.code === "Escape") {
      setTimeout(() => $(document.activeElement).blur());

      return;
    }
    switch (e.key) {
      case '~':
        {
          if ($(document.activeElement).attr('aria-describedby') === 'select2-add-tags-container') {
            e.preventDefault();
            $('#add-tags')
              .val(null)
              .trigger('change');
          }
          else {
            e.preventDefault();
            $('#filter-tags')
              .val(null)
              .trigger('change');
          }
        } break;
    }
  });
}, 100);

$('#add-block-switch').click(function () {
  $(this).html(
    "Add\\Edit&nbsp;" + ($('#add-block').toggle().is(':hidden') ? '&#8595;' : '&#8593;'));
});

$(document).keypress(function (e) {
  if (e.code === "Escape") {
    setTimeout(() => $(document.activeElement).blur());
    return;
  }

  if (document.activeElement.type === "textarea"
    || document.activeElement.type === "text")
    return;

  switch (e.key) {
    case 'f':
      {
        setTimeout(() => $('#filter-tags').focus(), 0);
      } break;
    case 'a':
      {
        $('#add-block').show();
        setTimeout(() => $('#add-content').focus());
      } break;
  }
});


function registerFilterToGrid(grid) {
  $('#filter-tags').on('change', function (e) {
    window.filterTags = { count: 0 };

    let filterTags = $('#filter-tags')
      .select2('data')
      .map(el => el.text);

    let countTags = 0;
    unique(filterTags, el => el)
      .map(tag => window.filterTags[tag] = ++countTags);

    window.filterTags.count = countTags;

    grid.api.onFilterChanged();
  });
}

function getFilterByTags() {
  window.filterTags = { count: 0 };

  return (node) => {
    return !node.data
      || !node.data.tags
      || node.data.tags.filter(tag => window.filterTags[tag.id]).length === window.filterTags.count;
  };
}

function generateAdditionalTagsFunction(grid) {
  function buildSearchArray(rows, selectedTags, nextLevel) {
    let arrayTagArrays = rows
      .filter(el => el.tags)
      .map(r => {
        let compare = (a, b) => {
          let aId = window.restrictMap[a.text];
          let bId = window.restrictMap[b.text];

          return aId === undefined
            ? bId === undefined
              ? a.text.localeCompare(b.text)
              : 1
            : bId === undefined
              ? -1
              : aId.localeCompare(bId);
        };

        return r.tags.sort(compare);
      });

    let tagPrefixMap = {};//TODO: нужно ли делать проверку что все выделенные тэги в массивах?

    for (let i = 0; i < arrayTagArrays.length; i++) {
      let tags = arrayTagArrays[i];

      if (tags.length <= selectedTags.length + (nextLevel ? 0 : 1))
        continue;

      let prefix = "";
      let prefixLength = 0;
      for (let j = 0; j < tags.length; j++) {
        let currentTag = tags[j].text;

        if (selectedTags.indexOf(currentTag) >= 0)
          continue;

        prefix += currentTag + ",";
        prefixLength++;

        if (j === 0 || !nextLevel && prefixLength < 2) {
          continue;
        }

        let prefixMap = tagPrefixMap[currentTag] = tagPrefixMap[currentTag] || { count: 0, prefixes: {} };

        prefixMap.count++;
        prefixMap.prefixes[prefix] = (prefixMap.prefixes[prefix] || 0) + 1;

        if (nextLevel)
          break;
      }
    }

    let arrayToSearch = [];

    for (let tag in tagPrefixMap) {
      let prefixMap = tagPrefixMap[tag];

      for (let prefix in prefixMap.prefixes) {
        // if (!nextLevel && prefixMap.count === 1)
        //   continue;

        arrayToSearch.push({
          tag: tag,
          tagCount: prefixMap.count,
          prefix: prefix,
          prefixCount: prefixMap.prefixes[prefix]
        })
      }
    }

    return arrayToSearch;
  }

  window.getAdditionalTags = function (selectedTags) {
    let rows = grid.api.getFilteredRows();

    let arrayToSearch = buildSearchArray(rows, selectedTags, true);

    return arrayToSearch.map(el => el.tag);
  }

  function generateAdditionalTags(params, selectedTags) {
    let term = $.trim(params.term);

    if (term == '' || term.length < 2) {
      return [];
    }

    let rows = grid.api.getFilteredRows();

    let arrayToSearch = buildSearchArray(rows, selectedTags);

    let result = orderByRate(arrayToSearch, term);

    let take = takeByRate(result);

    return take
      .map(el => {
        let value = el.prefix.substring(0, el.prefix.length - 1);

        return {
          id: value,
          text: value,//TODO: maybe add description about this variant 
          newTag: true,
          unionTag: true,
          score: 0.01 + el.rate * 0.01
        };
      });
  }

  return generateAdditionalTags;
}