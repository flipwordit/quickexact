function createSessionGrid(selector){
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

  function historyItemsHanlde(historyItems, tabGroups) {

    historyItems.forEach((v, i) => {
      v.useful = false;
      v.tags = getTags(v.url, v.title);
      //TODO: tabGroups available in version 3
      //v.groupName = v.groupId == -1 ? "" : tabGroups.find(el => el.id === groupId).title;
    });
  }

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

  const sessionGridDiv = document.querySelector(selector);
  new agGrid.Grid(sessionGridDiv, sessionGridOptions);

  return sessionGridOptions.api;
}  