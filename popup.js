let smartotekaFabric = //new SmartotekaFabricDGraph("http:///localhost:8080")
  new SmartotekaFabricLocalStorage();

let lastQueriesStr = localStorage['lastQueries'] || "[]";
let lastQueries = JSON.parse(lastQueriesStr);

let searchQueryInput = document.getElementById('search-query');

searchQueryInput.focus();

let searchBtn = document.getElementById('search-btn');

$(searchQueryInput).keypress(function (event) {
  var keycode = (event.keyCode ? event.keyCode : event.which);
  if (keycode == '13') {
    search();
  }
});

searchBtn.addEventListener('click', search);

function search() {

  //TODO: add change current url for browser history 
  //TODO: add opportunity open search by url with args

  const searchResultDiv = $('#search-result');
  searchResultDiv.empty();

  let query = $(searchQueryInput).val();

  if (lastQueries.length === 0 || lastQueries[0] !== query) {
    lastQueries.unshift(query);

    if (lastQueries.length > 10) {
      lastQueries.pop();
    }

    localStorage.setItem('lastQueries', JSON.stringify(lastQueries));

    refreshLastQueries();
  }

  smartotekaFabric.queriesProvider()
    .search(query)
    .then((searchResults) => {

      if (!searchResults) {
        searchResultDiv.text("No results found.")
      }
      else {
        searchResults.forEach(element => {
          searchResultDiv.append('<li><span class="answer">'
            + (element.startsWith("http") ? ('<a href="' + element + '">' + element + '</a>') : element)
            + '</span><span class="delete">&#x2717;</span></li>')
        });

        $(".delete", searchResultDiv).click((e) => {
          let element = e.target;

          let rowElement = $(element).parent();

          let answer = $('.answer', rowElement).text();

          smartotekaFabric.KBManager()
            .remove(query, answer)
            .then(_ => rowElement.remove());
        })
      }
    });
}

function refreshLastQueries() {
  let lastQueriesDiv = $("#lastQueries");
  lastQueriesDiv.empty();

  lastQueries.forEach((query) => lastQueriesDiv.append("<li>" + query + "</li>"));
}

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
  let tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  $('.datepicker').datepicker();
  $("#from-date-input").datepicker("setDate", today);
  $("#to-date-input").datepicker("setDate", tomorrow);

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
    chrome.history.search({
      'text': $("#search-text-input").val() || "",
      'startTime': $("#from-date-input").datepicker('getDate').valueOf(),
      'endTime': $("#to-date-input").datepicker('getDate').valueOf(),
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

  $('#add-block-switch').click(function () {
    $(this).html($('#add-block').toggle().is(':hidden') ? '&#8595;' : '&#8593;');
  });

  refreshLastQueries();

  $('#lastQueries').click(function (e) {
    if (e.target.localName === "li") {
      $(searchQueryInput).val($(e.target).text());

      search();
    }
  })
    ;
  $('#add-btn').click(function (e) {
    let query = $('#add-query').val();
    let content = $('#add-content').val();

    smartotekaFabric.KBManager().add(query, content);

    //smartotekaFabric.KBManager().add("vs shortcuts", "Format code Shift + Alt + F<br/>Refactor CTRL + Shift + R<br/> Save All Ctrl+K S")
  });
})

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request === "clear")
      sendResponse("Cool clear!");

    const searchResultDiv = $('#search-result');
    searchResultDiv.empty();
    $(searchQueryInput).val('');
  }
);

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