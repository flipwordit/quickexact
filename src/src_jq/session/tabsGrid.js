import {openTabsInNewWindow, openTabs, closeTabsByUrlIfOpen } from "@/src_jq/common/commonFunctions"

export default function createTabsGrid(selector) {

    //TODO: tabGroups available in version 3
    // let tagsGroup = new Promise(resolve => {
    //   chrome.tabGroups.query({}, (tabGroups) => resolve(tabGroups));
    // });

    const tabsGridColumns = [
        {
            field: "id",
            hide: true
        },
        {
            field: "index",
            hide: true
        },
        {
            field: "title",
            width: 600,
            rowDrag: true,
            filter: "fuzzyFilter",
            comparator: (a, b, nodeA, nodeB, isInverted) => {
                if (!a || !b)
                    return 0;
                return a.localeCompare(b, undefined, { sensitivity: 'accent' });
            },
            cellRenderer: params => {
                if (!params.data)
                    return params.data;

                let row = $(params.eParentOfValue).closest('.ag-row');

                row[0].addEventListener('dragstart', (dragEvent) => {
                    var userAgent = window.navigator.userAgent;
                    var isIE = userAgent.indexOf('Trident/') >= 0;

                    let tabs = getSelectedTabs(params);
                    dragEvent.dataTransfer.setData(
                        isIE ? 'text' : 'application/json',
                        JSON.stringify(tabs)
                    );
                });
                row.attr('draggable', true);

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
        { field: "tags", width: 200, filter: 'agSetColumnFilter' },
        {
            field: "windowId",
            headerName: "window",
            rowGroup: true,
            hide: true
        },
        //TODO: tabGroups available in version 3
        //{ field: "groupId", headerName: "window", rowGroup: true, hide: true }
    ];

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
            {
                name: 'Make active',
                action: function () {
                    chrome.windows.update(params.node.data.windowId, { focused: true })
                    chrome.tabs.update(params.node.data.id, { active: true, highlighted: true });
                }
            },
            {
                name: 'Open in current window',
                action: function () {
                    let tabs = getSelectedTabs(params);

                    openTabs(tabs);
                }
            },
            {
                name: 'Open in new window',
                action: function () {
                    let tabs = getSelectedTabs(params);

                    openTabsInNewWindow(tabs);
                },
            },
            {
                name: 'Close',
                action: function () {

                    let tabIds = getSelectedTabs(params).map(tab => tab.id);

                    tabIds = params.node.data && tabIds.indexOf(params.node.data.id) < 0
                        ? [params.node.data.id]
                        : tabIds;

                    chrome.tabs.remove(tabIds);
                },
            },
            {
                name: 'Close all dublicates',
                action: function () {

                    let tabs = getSelectedTabs(params);

                    tabIds = params.node.data && tabIds.indexOf(params.node.data.id) < 0
                        ? [params.node.data]
                        : tabs;

                    closeTabsByUrlIfOpen(tabs)
                }
            },
            'separator',
            {
                name: 'Delete',
                action: function () {
                    let tabs = getSelectedTabs(params);
                    tabs = params.node.data &&
                        tabs.findIndex(tab => tab.id === params.node.data.id) < 0
                        ? [params.node.data]
                        : tabs;

                    tabsGridOptions.onDeleting(tabs)
                        .then(() =>
                            tabsGridOptions.api.applyTransaction({
                                remove: tabs
                            })
                        );
                }
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
            headerCheckboxSelection:true
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

    const tabsGridDiv = document.querySelector(selector);
    new agGrid.Grid(tabsGridDiv, tabsGridOptions);

    return agGridExtendApi(tabsGridOptions);
}