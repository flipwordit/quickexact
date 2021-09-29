let smartotekaFabric =
  //new SmartotekaFabricDGraph("https://blue-surf-390018.us-east-1.aws.cloud.dgraph.io/")
  new SmartotekaFabricLocalStorage();

$(function () {

  let queryProvider = smartotekaFabric.queriesProvider();

  let cheatSheetsGrid = createCheatSheetsGrid('#cheatSheetsGrid', queryProvider);

  let addUpdateHandler = null;

  cheatSheetsGrid.onSelectionChanged = function () {
    let cheatSheets = getSelectedCheatSheets();

    if (cheatSheets.length === 1) {
      $("#add-btn").text("Update");

      let selectedCheatSheet = cheatSheets[0];

      $('#add-content').val(selectedCheatSheet.content);
      $('#add-tags').val(selectedCheatSheet.tags.map(el => el.id));
      $('#add-tags').trigger('change');

      //update, copy
      addUpdateHandler = (cheatSheet) => {
        cheatSheet.date = selectedCheatSheet.date;//Set id for update

        smartotekaFabric.KBManager().updateCheatSheets([cheatSheet])
          .then(() => {
            cheatSheetsGrid.api.applyTransaction({
              update: [cheatSheet]
            });
            $('#add-content').val(null);
            $("#add-btn").text("Add");
          });
      };
    }
    else if (cheatSheets.length > 1) {
      //group update. Only tags
      $('#add-content').hide();

      $("#add-btn").text("Group add tags");

      let commonTags = joinArrays(cheatSheets.map(el => el.tags), el => el.text);

      $('#add-tags').val(commonTags.map(el => el.id));
      $('#add-tags').trigger('change');

      addUpdateHandler = (cheatSheet) => {
        cheatSheets.forEach(el =>
          el.tags = mergeArraysById(el.tags, cheatSheet.tags, el => el.text)
            .sort((a, b) => a.text.localeCompare(b.text)));

        console.log(cheatSheets);

        smartotekaFabric.KBManager().updateCheatSheets(cheatSheets)
          .then(() => {
            $("#add-content").show();

            cheatSheetsGrid.api.applyTransaction({
              update: cheatSheets
            });

            $('#add-content').val(null);
            $("#add-btn").text("Add");
          });
      };
    }
  }

  function getSelectedCheatSheets() {
    let selectedRows = cheatSheetsGrid.api.getSelectedRows();

    return selectedRows;
  }

  cheatSheetsGrid.onDeleting = (cheatSheet) => {
    return new Promise(resolve => {
      smartotekaFabric.KBManager().deleteCheatSheet(cheatSheet)
        .then(_ => resolve());
    });
  };

  function refreshCheatSheetsGrid(cheatSheets) {
    let handleCheatSheets = (cheatSheets) => {
      let oldCheatSheets = [];
      cheatSheetsGrid.api.forEachNode(node => {
        if (node.data)
          oldCheatSheets.push(node.data);
      });

      let newRows = cheatSheets.filter(t => oldCheatSheets.findIndex(ot => ot.id === t.id) < 0);
      let removeRows = oldCheatSheets.filter(ot => cheatSheets.findIndex(t => ot.id === t.id) < 0);
      let updateRows = cheatSheets.filter(t => oldCheatSheets.findIndex(ot => ot.id === t.id) >= 0);

      cheatSheetsGrid.api.applyTransaction({
        add: newRows,
        remove: removeRows,
        update: updateRows
      });
    }

    if (cheatSheets) {
      handleCheatSheets(cheatSheets)
    }
    else {
      smartotekaFabric.queriesProvider().getCheatSheets()
        .then((cheatSheets) => {
          handleCheatSheets(cheatSheets);
        });
    }
  }

  refreshCheatSheetsGrid();

  $('#load-btn').click(_ => {
    refreshCheatSheetsGrid();
  });

  $('#clear-filter-btn').click(_ => clearFilters());

  function clearFilters() {
    cheatSheetsGrid.api.setFilterModel(null);
  }
  let tags = [];

  $('#add-btn').click(_ => {

    let dateCreation = new Date().valueOf();

    let selectedTags = $('#add-tags')
      .select2('data');

    let newTags = selectedTags
      .filter(el => el.newTag)
      .map(el => { return { id: el.id, text: el.text }; });

    smartotekaFabric.KBManager().addTags(newTags)
      .then(_ => {
        newTags.forEach(el => {
          let newOption = new Option(el.text, el.id, false, false);
          $('#add-tags').append(newOption)
        });

        $('#add-tags').val(null).trigger('change');
      });

    let cheatsheet = {
      date: dateCreation,
      content: $("#add-content").val(),
      tags: selectedTags
        .map(el => { return { id: el.id, text: el.text }; })
        .sort((a, b) => a.text.localeCompare(b.text)),
    };

    if (addUpdateHandler !== null) {
      addUpdateHandler(cheatsheet);

      addUpdateHandler = null;
    }
    else {
      smartotekaFabric.KBManager().addCheatSheet(cheatsheet)
        .then(() => {
          $('#add-content').val(null);

          cheatSheetsGrid.api.applyTransaction({
            add: [cheatsheet]
          });
        });
    }
  });



  function getFilteredRows() {
    let rows = [];
    cheatSheetsGrid.api.forEachNodeAfterFilter(node => {//TODO:maybe use filtered rows?
      if (node.data)//TODO: extract to grid api
        rows.push(node.data);
    });

    return rows;
  }

  function buildSearchArray(rows, selectedTags, nextLevel) {
    let arrayTagArrays = rows.map(r =>
      r.tags.sort((a, b) => {
        let aId = window.restrictMap[a.text];
        let bId = window.restrictMap[b.text];

        return aId === undefined
          ? bId === undefined
            ? a.text.localeCompare(b.text)
            : 1
          : bId === undefined
            ? -1
            : aId.localeCompare(bId);
      }));

    let tagPrefixMap = {};//TODO: нужно ли делать проверку что все выделенные тэги в массивах?

    for (let i = 0; i < arrayTagArrays.length; i++) {
      let tags = arrayTagArrays[i];

      let prefix = "";
      for (let j = 0; j < tags.length; j++) {
        let currentTag = tags[j].text;

        if (selectedTags.indexOf(currentTag) >= 0)
          continue;

        prefix += currentTag + ",";

        if (j === 0) {
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
    let rows = getFilteredRows();

    let arrayToSearch = buildSearchArray(rows, selectedTags, true);

    return arrayToSearch.map(el => el.tag);
  }

  smartotekaFabric.queriesProvider().getTags().then(argTags => {
    tags = argTags;

    createMultiselectTags("#add-tags", tags,
      (params) => {
        let term = $.trim(params.term);

        if (term == '' || term.length < 2) {
          return [];
        }

        let selectedTags = getSelectedTags();
        let rows = getFilteredRows();

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
              score: el.rate
            };
          });
      });
  });

  $('#add-tags').on('change', function (e) {
    const instance = cheatSheetsGrid.api.getFilterInstance('tags');
    instance.setModel({ values: $('#add-tags').select2('data').map(el => el.text) });
    cheatSheetsGrid.api.onFilterChanged();
  });
})

function getSelectedTags() {
  return $('#add-tags').select2('data').map(el => el.text);
}