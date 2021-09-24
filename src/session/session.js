let smartotekaFabric =
  //new SmartotekaFabricDGraph("https://blue-surf-390018.us-east-1.aws.cloud.dgraph.io/")
  new SmartotekaFabricLocalStorage();

$(function () {

  let queryProvider = smartotekaFabric.queriesProvider();

  let sessionGridApi = createSessionGrid('#sessionGrid');
  smartotekaFabric.queriesProvider().getSessions()
    .then(sessions => {
      sessions.unshift({ date: new Date().valueOf(), query: "Current", tabs: [] });
      sessionGridApi.setRowData(sessions);
    });


  let tabsGridApi = createTabsGrid('#tabsGrid', queryProvider);

  function historyItemsHanlde(historyItems, tabGroups) {
    
    historyItems.forEach((v, i) => {
      v.useful = false;
      v.tags = [];
      //TODO: tabGroups available in version 3
      //v.groupName = v.groupId == -1 ? "" : tabGroups.find(el => el.id === groupId).title;
    });
  }

  function refreshTabsGrid() {

    chrome.tabs.query({},
      (tabs) => {

        console.log(tabs);
        // tagsGroup.then(tabGroups => //TODO: tabGroups available in version 3
        historyItemsHanlde(tabs, null);//);

        tabsGridApi.setRowData(tabs);
      });
  }

  refreshTabsGrid();

  $('#load-btn').click(_ => {
    refreshTabsGrid();
  });

  let refreshTabsGridWithThrottle = throttle(refreshTabsGrid, 500);
  //TODO: Ag-grid can update without change post and state records. Later we can use it.

  chrome.tabs.onCreated.addListener(refreshTabsGridWithThrottle);
  chrome.tabs.onRemoved.addListener(refreshTabsGridWithThrottle);
  chrome.tabs.onMoved.addListener(refreshTabsGridWithThrottle);
  chrome.tabs.onReplaced.addListener(refreshTabsGridWithThrottle);

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
        $('#add-query').empty();
      });

    let tabs = tabsGridApi.getSelectedNodes().map(node => node.data);

    let session = {
      date: new Date().valueOf(),
      query: $("#add-query").val(),
      tags: selectedTags.map(el => { return { id: el.id, text: el.text }; }),
      tabs: tabs
    };

    smartotekaFabric.KBManager().addSession(session);
  });

  smartotekaFabric.queriesProvider().getTags().then(argTags => {
    tags = argTags;

    createMultiselectTags("#add-tags", tags);
  });
})