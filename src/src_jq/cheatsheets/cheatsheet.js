let smartotekaFabric =
  //new SmartotekaFabricDGraph("https://blue-surf-390018.us-east-1.aws.cloud.dgraph.io/")
  new SmartotekaFabricLocalStorage();

$(function () {
  let cheatSheetsGrid = createCheatSheetsGrid('#cheatSheetsGrid', getFilterByTags());

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

              let addedNode = cheatSheetsGrid.api.getFilteredRows(node => node.data.date === cheatSheet.date);

              if (addedNode.length) {
                addedNode[0].setSelected(true, true);
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

  smartotekaFabric.queriesProvider().getTags().then(tags => {

    let generateAdditionalTags = generateAdditionalTagsFunction(cheatSheetsGrid);

    createMultiselectTags("#add-tags", tags, generateAdditionalTags);
    createMultiselectTags("#filter-tags", tags, generateAdditionalTags);

  });

  registerFilterToGrid(cheatSheetsGrid);
})

