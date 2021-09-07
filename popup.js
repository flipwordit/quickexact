let smartotekaFabric = new SmartotekaFabricDGraph("http:///localhost:8080");

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
    { field: "title", width: "600px", cellRenderer: params => {
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
      cellRenderer: params => {
        if (!params.data)
          return params.data;

        queryProvider.isUseful(params.data.url)
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
