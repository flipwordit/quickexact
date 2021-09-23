let smartotekaFabric =
  //new SmartotekaFabricDGraph("https://blue-surf-390018.us-east-1.aws.cloud.dgraph.io/")
  new SmartotekaFabricLocalStorage();


function getTags(url, title) {
  const tagsMap = {
    "www.google.com": "GOOGLE",
    "ag-grid": "agGrid",
    "aggrid": "agGrid",
    "javascript": "JavaScript",
    "developer.chrome.com/docs/extensions": "Chrome extension api"
  };

  let tags = [];
  for (const [searchTag, tag] of Object.entries(tagsMap)) {

    if (url.indexOf(searchTag) !== -1 || title.toLowerCase().indexOf(searchTag) !== -1) {
      tags.push(tag);
    }
  }

  return tags;
}

$(function () {

  let queryProvider = smartotekaFabric.queriesProvider();

  //TODO: tabGroups available in version 3
  // let tagsGroup = new Promise(resolve => {
  //   chrome.tabGroups.query({}, (tabGroups) => resolve(tabGroups));
  // });
  const sessionGridColumns = [
    {
      field: "date",
      width: "110px",
      filter: 'agDateColumnFilter',
      cellRenderer: params => {
        if (!params.data)
          return params.data;

        let formattedDate = Intl.DateTimeFormat(undefined, {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric'
        })
          .format(params.data.lastVisitTime);

        return formattedDate.replace(" ","<br>");
      }
    },
    {
      field: "query",
      width: "200px",
      filter: "fuzzyFilter"
    },
    {
      headerName: "tabs count",
      width: "100px",
      filter: "usefulTypeFilter",
      valueGetter: params => {
        if (!params.data)
          return params.data;

        return params.data.tabs.length;
      }
    },
    { field: "tags", width: "200px", filter: 'agSetColumnFilter' }
  ];

  const tabsGridColumns = [
    { field: "id", width: "100px", filter: 'agNumberColumnFilter', hide: true },
    {
      field: "title",
      width: "600px",
      filter: "fuzzyFilter",
      cellRenderer: params => {
        if (!params.data)
          return params.data;

        let faviconUrl = 'chrome://favicon/' + params.data.url;

        let html = "<a class='website-link' href='" + params.data.url + "'>"
          + `<div class="website-icon" id="icon"
         style="background-image: -webkit-image-set(url(&quot;`
          + faviconUrl
          + `&quot;) 1x, url(&quot;chrome://favicon2/?size=16&amp;scale_factor=2x&amp;page_url=`
          + faviconUrl
          + `&amp;allow_google_server_fallback=0&quot;) 2x);"></div>`
          + params.data.title + "</a>";

        return html;
      }
    },
    {
      field: "useful",
      width: "100px",
      filter: "usefulTypeFilter",
      cellRenderer: params => {
        if (!params.data)
          return params.data;

        queryProvider.isUseful(params.data.url)//TODO: refactor. It wiil call each time when cell renders
          .then(urls => {
            let newValue = urls.length > 0;
            if (newValue !== params.data.useful) {
              params.data.useful = newValue;
              params.refreshCell();
            }

          });//TODO: move to cellRender and use packet query


        return params.data.useful ? "&#10003;" : "";
      }
    },
    { field: "tags", width: "200px", filter: 'agSetColumnFilter' },
    { field: "windowId", headerName: "window", rowGroup: true, hide: true },
    //TODO: tabGroups available in version 3
    //{ field: "groupId", headerName: "window", rowGroup: true, hide: true }
  ];

  function historyItemsHanlde(historyItems, tabGroups) {

    historyItems.forEach((v, i) => {
      v.useful = false;
      v.tags = getTags(v.url, v.title);
      //TODO: tabGroups available in version 3
      //v.groupName = v.groupId == -1 ? "" : tabGroups.find(el => el.id === groupId).title;
    });
  }

  function getSelectedTabs(params) {
    let selectedNodes = tabsGridOptions.api.getSelectedNodes();
    let tabs = selectedNodes.length
      ? selectedNodes.map(node => node.data)
      : [params.node.data];

    return tabs;
  }

  function getContextMenuItems(params) {
    return [
      'copy',
      'export',
      'separator',
      {
        name: 'Open in current window',
        action: function () {

          let tabs = getSelectedTabs(params);

          tabs.forEach(tab => {
            chrome.tabs.create({
              windowId: chrome.windows.WINDOW_ID_CURRENT,
              url: tab.url
            });
          });
        },

        //icon: '<img src="../images/skills/windows.png"/>'
      },
      {
        name: 'Open in new window',
        action: function () {

          let tabs = getSelectedTabs(params);

          function createWindow(url) {
            return new Promise(r => {
              chrome.windows.create({ url: url }, window => r(window));
            });
          }

          let windowPromise = null;

          tabs.forEach(tab => {

            if (windowPromise) {
              windowPromise.then(window => {
                chrome.tabs.create({
                  windowId: window.id,
                  url: tab.url
                });
              });
            }
            else {
              windowPromise = createWindow(tab.url);
            }
          });
        },

        //icon: '<img src="../images/skills/windows.png"/>'
      },
      {
        name: 'Close',
        action: function () {

          let tabIds = getSelectedTabs(params).map(tab => tab.id);
          chrome.tabs.remove(tabIds);
        },

        //icon: '<img src="../images/skills/windows.png"/>'
      },
      {
        name: 'Close all if open',
        action: function () {

          let tabUrls = getSelectedTabs(params).map(tab => tab.url);

          chrome.tabs.query({},
            (tabs) => {
              let tabIds = [];
              tabs.forEach(tab => {

                if (tabUrls.indexOf(tab.url) >= 0) {
                  tabIds.push(tab.id);
                }
              });

              chrome.tabs.remove(tabIds);
            });
        },

        //icon: '<img src="../images/skills/windows.png"/>'
      },
    ];

  }
  const tabsGridOptions = {
    defaultColDef: {
      resizable: true,
      filter: true,
      sortable: true,
      wrapText: true,
      autoHeight: true,
    },
    autoGroupColumnDef: {
      headerName: 'Window',
      field: 'windowId',
      minWidth: 150,
      cellRenderer: 'agGroupCellRenderer',
      cellRendererParams: {
        checkbox: true,
      },
    },
    groupDefaultExpanded: true,
    groupSelectsChildren: true,

    columnDefs: tabsGridColumns,
    getRowStyle(params) {
      if (params.data && params.data.url.startsWith("https://www.google.com")) {
        return { 'color': 'green' }
      }
      return null;
    },
    getRowNodeId: item => item.id,
    components: {
      fuzzyFilter: FuzzyFilter,
      usefulTypeFilter: UsefulTypeFilter,
      loadingRenderer: function (params) {
        if (params.value !== undefined) {
          return params.value;
        } else {
          return '<img src="https://www.ag-grid.com/example-assets/loading.gif">';
        }
      },
    },
    rowSelection: 'multiple',//Work in enterprise version. We can use free only common. But by MIT license we can modificate it.
    // debug: true,
    getContextMenuItems: getContextMenuItems,
  };

  const sessionGridOptions = {
    defaultColDef: {
      resizable: true,
      filter: true,
      sortable: true,
      wrapText: true,
      autoHeight: true,
    },
    columnDefs: sessionGridColumns,
    getRowNodeId: item => item.date,
    components: {
      fuzzyFilter: FuzzyFilter,
      loadingRenderer: function (params) {
        if (params.value !== undefined) {
          return params.value;
        } else {
          return '<img src="https://www.ag-grid.com/example-assets/loading.gif">';
        }
      },
    }
  };

  const sessionGridDiv = document.querySelector('#sessionGrid');
  new agGrid.Grid(sessionGridDiv, sessionGridOptions);

  const tabsGridDiv = document.querySelector('#tabsGrid');
  new agGrid.Grid(tabsGridDiv, tabsGridOptions);




  smartotekaFabric.queriesProvider().getSessions()
    .then(sessions => {
      sessionGridOptions.api.setRowData(sessions);
    });

  function refreshGrid() {

    chrome.tabs.query({},
      (tabs) => {

        console.log(tabs);
        // tagsGroup.then(tabGroups => //TODO: tabGroups available in version 3
        historyItemsHanlde(tabs, null);//);

        tabsGridOptions.api.setRowData(tabs);
      });
  }

  refreshGrid();

  $('#load-btn').click(_ => {
    refreshGrid();
  });

  let refreshWithThrottle = throttle(refreshGrid, 500);
  //TODO: Ag-grid can update without change post and state records. Later we can use it.

  chrome.tabs.onCreated.addListener(refreshWithThrottle);
  chrome.tabs.onRemoved.addListener(refreshWithThrottle);
  chrome.tabs.onMoved.addListener(refreshWithThrottle);
  chrome.tabs.onReplaced.addListener(refreshWithThrottle);

  $('#clear-filter-btn').click(_ => clearFilters());

  function clearFilters() {
    tabsGridOptions.api.setFilterModel(null);
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

    let selectedNodes = tabsGridOptions.api.getSelectedNodes();
    let tabs = selectedNodes.map(node => node.data);

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

    $("#add-tags").select2({
      width: '100%',
      multiple: true,
      tags: true,
      placeholder: "Click here and start typing to search.",
      data: tags,
      createTag: function (params) {
        var term = $.trim(params.term);

        if (term === '') {
          return null;
        }

        return {
          id: term,
          text: term,
          newTag: true // add additional parameters
        }
      },
      insertTag: function (data, tag) {
        // Insert the tag at the end of the results
        data.push(tag);
      },
      matcher: (term, text) => {
        if (term.term === undefined) {
          text.score = 1;
          return text;
        }

        const options = {
          includeScore: true,
          useExtendedSearch: true,
          keys: ['text']
        }

        const fuse = new Fuse([text], options)

        let searchedRows = fuse.search(term.term);

        if (searchedRows[0]) {
          text.score = searchedRows[0].score;
          return text;
        }

        return null;
      },
      sorter: (data) => {
        return data.filter(function (item) {
          return !!item;
        }).sort((a, b) => {
          let score = b.score - a.score;

          return score ? score : (a.text.localeCompare(b.text));
        });
      }
    });
  });
})

class FuzzyFilter {
  init(params) {
    this.valueGetter = params.valueGetter;
    this.filterText = null;
    this.setupGui(params);

    this.filterChangeCallBack = throttle(() => {
      this.clearFilterValue(params);

      this.#searchPrepare(params);

      params.filterChangedCallback();
    }, 1000);
  }

  clearFilterValue(params) {
    params.api.forEachNode((node) => node.data.finded = undefined);
  }
  // not called by AG Grid, just for us to help setup
  setupGui(params) {
    this.gui = document.createElement('div');
    this.gui.innerHTML = `<div style="padding: 4px; width: 450px;">
                <div>
                    <input style="margin: 4px 0 4px 0;" type="text" id="filterText" placeholder="fuzzy search..."/>
                </div>
                <div style="margin-top: 20px;"><table><thead><tr><th>Token</th> <th>Match type</th> <th>Description</th></tr></thead> <tbody><tr><td><code>jscript</code></td> <td>fuzzy-match</td> <td>Items that fuzzy match <code>jscript</code></td></tr> <tr><td><code>=scheme</code></td> <td>exact-match</td> <td>Items that are <code>scheme</code></td></tr> <tr><td><code>'python</code></td> <td>include-match</td> <td>Items that include <code>python</code></td></tr> <tr><td><code>!ruby</code></td> <td>inverse-exact-match</td> <td>Items that do not include <code>ruby</code></td></tr> <tr><td><code>^java</code></td> <td>prefix-exact-match</td> <td>Items that start with <code>java</code></td></tr> <tr><td><code>!^earlang</code></td> <td>inverse-prefix-exact-match</td> <td>Items that do not start with <code>earlang</code></td></tr> <tr><td><code>.js$</code></td> <td>suffix-exact-match</td> <td>Items that end with <code>.js</code></td></tr> <tr><td><code>!.go$</code></td> <td>inverse-suffix-exact-match</td> <td>Items that do not end with <code>.go</code></td></tr></tbody></table>
                <div>
                White space acts as an AND operator, while a single pipe (|) character acts as an OR operator.</div>
            </div>
        `;

    const listener = (event) => {
      this.filterText = event.target.value;

      this.filterChangeCallBack();
    };

    this.eFilterText = this.gui.querySelector('#filterText');
    this.eFilterText.addEventListener('changed', listener);
    this.eFilterText.addEventListener('paste', listener);
    this.eFilterText.addEventListener('input', listener);
    // IE doesn't fire changed for special keys (eg delete, backspace), so need to
    // listen for this further ones
    this.eFilterText.addEventListener('keydown', listener);
    this.eFilterText.addEventListener('keyup', listener);
  }

  getGui() {
    return this.gui;
  }

  #searchPrepare(params) {
    let rowData = [];
    params.api.forEachNode(node => {
      rowData.push(node.data);
      node.data.finded = false;
    });

    const options = {
      includeScore: true,
      useExtendedSearch: true,
      keys: ['title']
    }

    const fuse = new Fuse(rowData, options)

    // Search for items that include "Man" and "Old",
    // OR end with "Artist"
    let searchedRows = fuse.search(this.filterText);

    searchedRows.forEach(v => {
      v.item.finded = true;
    });

    this.setFilter = true;
  }

  doesFilterPass(params) {
    return params.data.finded === undefined || params.data.finded;
  }

  isFilterActive() {
    return this.filterText != null && this.filterText !== '';
  }

  getModel() {
    return { value: this.filterText.value };
  }

  setModel(model) {
    this.eFilterText.value = model.value;
  }
}

class UsefulTypeFilter {
  init(params) {
    this.valueGetter = params.valueGetter;
    this.selectedValue = null;
    this.setupGui(params);
  }

  setupGui(params) {
    this.gui = document.createElement('div');
    this.gui.innerHTML = `<div style="padding: 4px; width: 100px;">
                <div>
                    <select id='useful-type-select'>
                    <option value='0'>All<option/>
                    <option value='1'>Useful<option/>
                    <option value='2'>Unuseful<option/>
                   
                    </select>
                </div>
        
            </div>
        `;

    const listener = (event) => {
      this.selectedValue = event.target.value;

      this.compare = () => true;

      switch (this.selectedValue) {
        case "1":
          this.compare = (p) => this.valueGetter(p) === true;
          break;
        case "2":
          this.compare = (p) => this.valueGetter(p) === false;
          break;
      }

      params.filterChangedCallback();
    };

    this.usefulTypeSelect = this.gui.querySelector('#useful-type-select');
    this.usefulTypeSelect.addEventListener('change', listener);
  }

  getGui() {
    return this.gui;
  }

  doesFilterPass(params) {

    return this.compare(params);
  }

  isFilterActive() {
    return this.selectedValue != null;
  }

  getModel() {
    return { value: this.selectedValue.value };
  }

  setModel(model) {
    this.usefulTypeSelect.value = model.value;
  }
}

function throttle(func, ms) {

  let savedArgs,
    savedThis;

  let timerId = null;
  function wrapper() {
    savedArgs = arguments;
    savedThis = this;

    if (timerId)
      clearTimeout(timerId)

    timerId = setTimeout(function () {
      timerId = null;
      func.apply(savedThis, savedArgs);
      savedArgs = savedThis = null;
    }, ms);
  }

  return wrapper;
}