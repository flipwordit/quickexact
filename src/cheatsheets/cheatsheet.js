let smartotekaFabric =
  //new SmartotekaFabricDGraph("https://blue-surf-390018.us-east-1.aws.cloud.dgraph.io/")
  new SmartotekaFabricLocalStorage();

$(function () {
  window.filterTags = { count: 0 };

  let cheatSheetsGrid = createCheatSheetsGrid('#cheatSheetsGrid', filterByTags);

  let addUpdateHandler = null;

  cheatSheetsGrid.onSelectionChanged = function () {
    let cheatSheets = getSelectedCheatSheets();

    if (cheatSheets.length === 1) {
      $('#add-content').show();
      $("#add-btn").text("Update");
      $("#copy-btn").show();

      let selectedCheatSheet = cheatSheets[0];

      $('#add-content').val(selectedCheatSheet.content);
      $('#add-tags').val(selectedCheatSheet.tags.map(el => el.id));
      $('#add-tags').trigger('change');

      function clearAddBlockState() {
        $('#add-content').val(null);
        $("#add-btn").text("Add");
        $("#copy-btn").hide();
      }
      //update, copy
      addUpdateHandler = (cheatSheet, isUpdate) => {
        if (isUpdate) {
          cheatSheet.date = selectedCheatSheet.date;//Set id for update

          smartotekaFabric.KBManager()
            .updateCheatSheets([cheatSheet])
            .then(() => {
              cheatSheetsGrid.api.applyTransaction(
                { update: [cheatSheet] }
              );

              clearAddBlockState();
            });
        } else {
          smartotekaFabric.KBManager()
            .addCheatSheet(cheatSheet)
            .then(() => {
              cheatSheetsGrid.api.applyTransaction(
                { add: [cheatSheet] }
              );

              let addedNode = null;
              cheatSheetsGrid.api.forEachNodeAfterFilter(node => {
                if (node.data.date === cheatSheet.date) {
                  addedNode = node;
                }
              });

              if (addedNode) {
                addedNode.setSelected(true, true);
              } else {
                clearAddBlockState();
              }
            });
        }
      }
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

  $('#add-btn,#copy-btn').click(function () {

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

    let tagsToCheatSheet = selectedTags
      .map(el => { return { id: el.id, text: el.text }; })
      .sort((a, b) => a.text.localeCompare(b.text));

    let cheatsheet = {
      date: dateCreation,
      content: $("#add-content").val(),
      tags: unique(tagsToCheatSheet, el => el.id),
    };

    if (addUpdateHandler !== null) {
      addUpdateHandler(cheatsheet, $(this).attr('id') === 'add-btn');

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
        if (!nextLevel && prefixMap.count === 1)
          continue;

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

  function generateAdditionalTags(params, selectedTags) {
    let term = $.trim(params.term);

    if (term == '' || term.length < 2) {
      return [];
    }

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
          score: -el.rate * 0.01
        };
      });
  }

  smartotekaFabric.queriesProvider().getTags().then(argTags => {
    tags = argTags;

    createMultiselectTags("#add-tags", tags, generateAdditionalTags);
    createMultiselectTags("#filter-tags", tags, generateAdditionalTags);

  });

  $('#filter-tags').on('change', function (e) {
    window.filterTags = { count: 0 };

    let filterTags = $('#filter-tags')
      .select2('data')
      .map(el => el.text);

    let countTags = 0;
    unique(filterTags, el => el)
      .map(tag => window.filterTags[tag] = ++countTags);

    window.filterTags.count = countTags;

    cheatSheetsGrid.api.onFilterChanged();
  });


  function filterByTags(node) {
    return !node.data || node.data.tags.filter(tag => window.filterTags[tag.id]).length === window.filterTags.count;
  }

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
})

