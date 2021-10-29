let smartotekaFabric = getSmartotekaFabric();


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
  let today = new Date();
  let endDate = new Date();
  endDate = new Date(new Date(endDate.setHours(23, 59, 59, 999)));

  $('.datepicker').datepicker();
  $("#from-date-input").datepicker("setDate", today);
  $("#to-date-input").datepicker("setDate", endDate);

  let queryProvider = smartotekaFabric.queriesProvider();

  const columnDefs = [
    { field: "id", width: "100px", filter: 'agNumberColumnFilter' },
    {
      field: "lastVisitTime",
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

        return formattedDate;
      }
    },
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
    { field: "tags" },
    { field: "typedCount", headerName: "Typed Count", width: "150px", filter: 'agNumberColumnFilter' },
    { field: "visitCount", headerName: "Visit Count", width: "150px", filter: 'agNumberColumnFilter' },
  ];

  function historyItemsHanlde(historyItems) {
    historyItems.forEach((v, i) => {
      v.useful = false;
      v.tags = getTags(v.url, v.title);
    });
  }

  const gridOptions = {
    defaultColDef: {
      resizable: true,
      filter: true,
      sortable: true,
      wrapText: true,
    },
    columnDefs: columnDefs,
    getRowStyle(params) {
      if (params.data && params.data.url.startsWith("https://www.google.com")) {
        return { 'color': 'green' }
      }
      return null;
    },
    getRowNodeId: (data) => data.Id,
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
  };

  const gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);


  function refreshGrid() {
    let endDate = $("#to-date-input").datepicker('getDate');
    endDate = new Date(new Date(endDate.setHours(23, 59, 59, 999)));

    chrome.history.search({
      'text': $("#search-text-input").val() || "",
      'startTime': $("#from-date-input").datepicker('getDate').valueOf(),
      'endTime': endDate.valueOf(),
      'maxResults': 10000
    },
      (historyItems) => {

        historyItemsHanlde(historyItems);

        gridOptions.api.setRowData(historyItems);
      });
  }

  refreshGrid();
  $('#load-btn').click(_ => {
    refreshGrid();
  });

  $('#clear-filter-btn').click(_ => clearFilters());

  function clearFilters() {
    gridOptions.api.setFilterModel(null);
  }
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
      if (savedArgs) {
        func.apply(savedThis, savedArgs);
        savedArgs = savedThis = null;
      }
    }, ms);
  }

  return wrapper;
}