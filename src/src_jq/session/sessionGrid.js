import {openTabsInNewWindow, openTabs, closeTabsByUrlIfOpen } from "@/src_jq/common/commonFunctions"
import { FuzzyFilter } from '@/src_jq/common/ag-grid-components/FuzzyFilter'

export default function createSessionGrid(selector, externalFilter) {
  const sessionGridColumns = [
    {
      field: "date",
      width: 110,
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
      width: 200,
      filter: "fuzzyFilter"
    },
    {
      headerName: "tabs count",
      field: "tabs",
      width: 100,
      filter: "usefulTypeFilter",
      valueGetter: params => {
        if (!params.data)
          return params.data;

        return params.data.tabs.length;
      }
    },
    {
      field: "tags",
      width: 200,
      filter: 'agSetColumnFilter',
      valueGetter: params => {
        if (!params.data)
          return params.data;

        return (params.data.tags || []).map(el => el.text);
      },
      valueFormatter: params => {
        if (!params.data)
          return params.data;

        return (params.data.tags || []).map(el => el.text)
          .join(', ');
      }
    }
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
    isExternalFilterPresent: () => externalFilter,
    doesExternalFilterPass: (node) => !externalFilter || externalFilter(node),
  };



  function getContextMenuItems(params) {
    return [
      {
        name: 'Open in current window',
        action: function () {
          openTabs(params.node.data.tabs);
        }
      },
      {
        name: 'Open in new window',
        action: function () {
          openTabsInNewWindow(params.node.data.tabs);
        }
      },
      {
        name: 'Close all and dublicates',
        action: function () {
          closeTabsByUrlIfOpen(params.node.data.tabs);
        }
      },
      'separator',
      {
        name: 'Replace current',
        action: function () {
          sessionGridOptions.onReplacing(params.node.data)
            .then((tabs) =>
              params.node.setDataValue('tabs', tabs)
            );
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

  return agGridExtendApi(sessionGridOptions);
}