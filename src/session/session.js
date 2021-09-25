let smartotekaFabric =
  //new SmartotekaFabricDGraph("https://blue-surf-390018.us-east-1.aws.cloud.dgraph.io/")
  new SmartotekaFabricLocalStorage();


//TODO: make close all without tabs current session.

$(function () {

  let queryProvider = smartotekaFabric.queriesProvider();

  let sessionGrid = createSessionGrid('#sessionGrid');

  sessionGrid.onDeleting = (session) => {
    return smartotekaFabric.KBManager().deleteSession(session);
  };
  sessionGrid.onSelectionChanged = function () {
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

    refreshTabsGrid(session.query === "Current" ? null : session.tabs);
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

  let tabsGridApi = createTabsGrid('#tabsGrid', queryProvider);

  function historyItemsHanlde(historyItems, tabGroups) {

    historyItems.forEach((v, i) => {
      v.useful = false;
      v.tags = [];
      //TODO: tabGroups available in version 3
      //v.groupName = v.groupId == -1 ? "" : tabGroups.find(el => el.id === groupId).title;
    });
  }

  function refreshTabsGrid(tabs) {
    let handleTabs = (tabs) => {
      historyItemsHanlde(tabs, null);//);

      tabsGridApi.setRowData(tabs);
    }

    if (tabs) {
      handleTabs(tabs)
    }
    else {
      chrome.tabs.query({},
        (tabs) => {
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

  let refreshTabsGridWithThrottle = throttle(() => refreshTabsGrid(), 500);
  //TODO: Ag-grid can update without change post and state records. Later we can use it.

  chrome.tabs.onCreated.addListener(refreshTabsGridWithThrottle);
  chrome.tabs.onRemoved.addListener(refreshTabsGridWithThrottle);
  chrome.tabs.onMoved.addListener(refreshTabsGridWithThrottle);
  chrome.tabs.onReplaced.addListener(refreshTabsGridWithThrottle);
  chrome.tabs.onUpdated.addListener(refreshTabsGridWithThrottle);
  
  $('#clear-filter-btn').click(_ => clearFilters());

  function clearFilters() {
    tabsGridApi.setFilterModel(null);
  }
  let tags = [];

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

    let tabs = tabsGridApi.getSelectedNodes().map(node => node.data);

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
  });

  smartotekaFabric.queriesProvider().getTags().then(argTags => {
    tags = argTags;

    createMultiselectTags("#add-tags", tags);
  });
})