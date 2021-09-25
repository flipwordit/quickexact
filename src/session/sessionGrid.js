function createSessionGrid(selector) {
  const sessionGridColumns = [
    {
      field: "date",
      width: "110px",
      filter: 'agDateColumnFilter',
      sort: 'desc',
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
          .format(params.data.date);

        return formattedDate.replace(" ", "<br>");
      }
    },
    {
      field: "query",
      width: "200px",
      filter: "fuzzyFilter"
    },
    {
      headerName: "tabs count",
      field: "tabs",
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
    },
    rowSelection: 'single',
    getContextMenuItems: getContextMenuItems,
  };



  function getContextMenuItems(params) {
    return [
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
        }
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
        }
      },
      'separator',
      {
        name: 'Delete',
        action: function () {
          sessionGridOptions.onDeleting(params.node.data)
            .then(() =>
              sessionGridOptions.api.applyTransaction({
                remove: [params.node.data]
              })
            );
        }
      },
    ];

  }

  const sessionGridDiv = document.querySelector(selector);
  new agGrid.Grid(sessionGridDiv, sessionGridOptions);

  return sessionGridOptions;
}