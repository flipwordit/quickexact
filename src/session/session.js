let smartotekaFabric =
  //new SmartotekaFabricDGraph("https://blue-surf-390018.us-east-1.aws.cloud.dgraph.io/")
  new SmartotekaFabricLocalStorage();


//TODO: make close all without tabs current session.

$(function () {

  $("#sessionGrid").on("dragover", function (event) {
    gridDragOver(event.originalEvent);
  });

  $("#sessionGrid").on("dragleave", function (event) {
    event.preventDefault();
    event.stopPropagation();
  });

  $("#sessionGrid").on("drop", function (event) {
    gridDrop(event.originalEvent, "session");
  });

  let queryProvider = smartotekaFabric.queriesProvider();

  let sessionGrid = createSessionGrid('#sessionGrid', getFilterByTags());

  function getSelectedSession() {
    let selectedRows = sessionGrid.api.getSelectedRows();
    let session = null;

    if (selectedRows.length === 0) {
      let row = sessionGrid.api.getDisplayedRowAtIndex(0);
      row.setSelected(true);
      session = row.data;
    }
    else {
      session = selectedRows[0];
    }

    return session;
  }

  sessionGrid.onDeleting = (session) => {
    return smartotekaFabric.KBManager().deleteSession(session);
  };

  sessionGrid.onSelectionChanged = function () {
    let session = getSelectedSession();

    refreshTabsGrid(session.query === "Current" ? null : session.tabs);

    if (session.query === "Current") {
      $("#add-name").text("Save session");
      $("#add-btn").text("Save");
      $("#add-btn").attr("saveSession");
    }
    else {
      $("#add-name").text("Add tab to session");
      $("#add-btn").text("Add tab");
      $("#add-btn").attr("addTab");
    }
  }

  sessionGrid.onReplacing = function (session) {
    return new Promise(resolve => {
      getAllTabs()
        .then((tabs) => {
          session.tabs = tabs;
          smartotekaFabric.KBManager().updateSession(session)
            .then(_ => {
              refreshTabsGrid(tabs);

              resolve(tabs);
            });
        });
    });
  }

  function refreshSessionGrid() {
    smartotekaFabric.queriesProvider().getSessions()
      .then(sessions => {


        sessions.unshift({ date: new Date().valueOf(), query: "Current", tabs: [] });
        sessionGrid.api.setRowData(sessions);

        sessionGrid.api.getDisplayedRowAtIndex(0).setSelected(true);
      });
  }

  refreshSessionGrid();

  let tabsGrid = createTabsGrid('#tabsGrid', queryProvider);

  tabsGrid.onRowDragEnd = (event) => {
    var overNode = event.overNode;
    if (!overNode) {
      return;
    }

    var movingNode = event.node;

    let selectedSession = getSelectedSession();

    let indexMoving = selectedSession.tabs.indexOf(movingNode.data);
    let indexOver = selectedSession.tabs.indexOf(overNode.data);

    let windowId = overNode.group
      ? overNode.key
      : overNode.data.windowId;

    if (isExistsSorting(tabsGrid) && windowId === movingNode.data.windowId) {
      alert("For change tab orders - cancel grid sorting!");

      return;
    }

    movingNode.data.windowId = windowId;

    if (selectedSession.query === "Current") {
      chrome.tabs.move(
        movingNode.data.id,
        {
          index: overNode.data.index, windowId: movingNode.data.windowId
        },
        () => refreshTabsGrid());

      return;
    }

    moveInArray(selectedSession.tabs, indexMoving, indexOver);

    selectedSession.tabs[indexMoving].index = indexMoving;
    selectedSession.tabs[indexOver].index = indexOver;

    smartotekaFabric.KBManager()
      .updateSession(selectedSession)
      .then(_ => {
        transactionUpdateTabsGridWithSort(selectedSession.tabs);
        tabsGrid.api.clearFocusedCell();
      });
  }

  tabsGrid.onDeleting = (tabs) => {
    return new Promise(resolve => {
      let session = getSelectedSession();
      session.tabs = session.tabs.filter(el => tabs.findIndex(t => t.id == el.id) === -1);

      smartotekaFabric.KBManager().updateSession(session)
        .then(_ => resolve(session.tabs));
    });
  };

  function isExistsSorting(tabsGrid) {
    let columnStates = tabsGrid.columnApi.getColumnState();
    let sortColumnIndex = columnStates.findIndex(el => el.sort);
    let notExistsSorting = sortColumnIndex < 0 || columnStates[sortColumnIndex].colId === 'index';

    return !notExistsSorting;
  }

  function historyItemsHanlde(historyItems) {

    historyItems.forEach((v, i) => {
      v.useful = false;
      v.tags = [];
     });
  }

  function transactionUpdateTabsGridWithSort(tabs) {
    let oldTabs = tabsGrid.api.getAllRows();

    let newRows = tabs.filter(t => oldTabs.findIndex(ot => ot.id === t.id) < 0);
    let removeRows = oldTabs.filter(ot => tabs.findIndex(t => ot.id === t.id) < 0);
    let updateRows = tabs.filter(t => oldTabs.findIndex(ot => ot.id === t.id) >= 0);

    tabsGrid.api.applyTransaction({//Обновление не изменяет порядок записей
      add: newRows,
      remove: removeRows,
      update: updateRows
    });


    if (!isExistsSorting(tabsGrid)) {
      tabsGrid.columnApi.applyColumnState({
        state: [{ colId: 'index', sort: 'asc' }],
        defaultState: { sort: null },
      });
    }
  }

  function refreshTabsGrid(tabs) {
    let handleTabs = (tabs) => {
      historyItemsHanlde(tabs);

      transactionUpdateTabsGridWithSort(tabs);
    }

    if (tabs) {
      handleTabs(tabs)
    }
    else {
      getAllTabs()
        .then((tabs) => {
          let node = sessionGrid.api
            .getDisplayedRowAtIndex(0);

          node.setDataValue('date', new Date().valueOf());
          node.setDataValue('tabs', tabs);

          handleTabs(tabs);
        });
    }
  }

  $('#load-btn').click(_ => {
    refreshTabsGrid();
  });

  let refreshTabsGridWithThrottle = throttle(() => {
    let session = getSelectedSession();

    if (session.query === "Current") {
      refreshTabsGrid();
    }
  }, 500);
  //TODO: Ag-grid can update without change post and state records. Later we can use it.

  chrome.tabs.onCreated.addListener(refreshTabsGridWithThrottle);
  chrome.tabs.onRemoved.addListener(refreshTabsGridWithThrottle);
  chrome.tabs.onMoved.addListener(refreshTabsGridWithThrottle);
  chrome.tabs.onReplaced.addListener(refreshTabsGridWithThrottle);
  chrome.tabs.onUpdated.addListener(refreshTabsGridWithThrottle);

  $('#clear-filter-btn').click(_ => clearFilters());

  function clearFilters() {
    tabsGrid.api.setFilterModel(null);
  }

  //TODO: when selectRows - add automatic tags with grow color.
  //TODO wne we select many rows - union or intersect their tags?
  //TODO: how sometimes delete automatic tags faster?
  //TODO: What should i do when one url alreade stored with tags in other session?

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

    let currentSession = getSelectedSession();

    if (currentSession.query === "Current") {
      let tabs = tabsGrid.api.getSelectedNodes().map(node => node.data);

      let session = {
        date: dateCreation,
        query: $("#add-query").val(),
        tags: selectedTags.map(el => { return { id: el.id, text: el.text }; }),
        tabs: tabs
      };

      let node = sessionGrid.api
        .getDisplayedRowAtIndex(0);

      node.setDataValue('date', dateCreation + 1);

      smartotekaFabric.KBManager().addSession(session)
        .then(() => {
          $('#add-query').val(null);

          sessionGrid.api.applyTransaction({
            add: [session],
            addIndex: 1
          });
        });
    } else {
      let tab = {
        windowId: currentSession.tabs[0].windowId,
        tabId: dateCreation,
        url: $("#add-query").val(),
        tags: selectedTags.map(el => { return { id: el.id, text: el.text }; }),
      };

      currentSession.tabs.push(tab);
      smartotekaFabric.KBManager().updateSession(currentSession)
        .then(() => {
          $('#add-query').val(null);

          tabsGrid.api.applyTransaction({
            add: [tab]
          });
        });
    }
  });

  smartotekaFabric.queriesProvider().getTags().then(tags => {
    registerRestrictionMap();
    
    let generateAdditionalTags = generateAdditionalTagsFunction(sessionGrid);

    createMultiselectTags("#add-tags", tags, generateAdditionalTags);
    createMultiselectTags("#filter-tags", tags, generateAdditionalTags);
  });

  $('#close-others-btn').click(() => {
    let session = getSelectedSession();

    getAllTabs()
      .then((tabs) =>
        closeTabs(tabs.filter(tab => session.tabs.findIndex(st => st.id === tab.id) === -1))
      );
  });

  function gridDragOver(event) {
    var dragSupported = event.dataTransfer.types.length;

    if (dragSupported) {
      event.dataTransfer.dropEffect = 'copy';
      event.preventDefault();
    }
  }

  function gridDrop(event, grid) {
    event.preventDefault();

    var userAgent = window.navigator.userAgent;
    var isIE = userAgent.indexOf('Trident/') >= 0;

    var jsonData = event.dataTransfer.getData(isIE ? 'text' : 'application/json');
    var tabs = JSON.parse(jsonData);

    // if data missing or data has no it, do nothing
    if (!tabs || !tabs.length || tabs[0].id == null) {
      return;
    }

    var gridApi = grid == 'session' ? sessionGrid.api : tabsGrid.api;

    // do nothing if row is already in the grid, otherwise we would have duplicates

    let rowId = $(event.target).closest('.ag-row').attr('row-id');

    if (!rowId) {
      console.log('not find row');
      return;
    }

    var row = gridApi.getRowNode(rowId);
    if (!row) {
      console.log('not find row node in grid');
      return;
    }

    row.data.tabs = unique(row.data.tabs.concat(tabs), tab => tab.url);

    smartotekaFabric.KBManager().updateSession(row.data)
      .then(_ =>
        gridApi.applyTransaction({
          update: [row.data]
        }));
  }

  registerFilterToGrid(sessionGrid);
})

