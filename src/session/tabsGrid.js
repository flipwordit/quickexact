function createTabsGrid(selector, queryProvider) {

    //TODO: tabGroups available in version 3
    // let tagsGroup = new Promise(resolve => {
    //   chrome.tabGroups.query({}, (tabGroups) => resolve(tabGroups));
    // });

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
                    chrome.tabs.remove(tabIds);
                },
            },
            {
                name: 'Close all if open',
                action: function () {

                    let tabUrls = getSelectedTabs(params).map(tab => tab.url);

                    getAllTabs()
                        .then((tabs) =>
                            closeTabs(tabs.filter(tab => tabUrls.indexOf(tab.url) >= 0))
                        );
                }
            },
            'separator',
            {
                name: 'Delete',
                action: function () {
                    let tabs = getSelectedTabs(params);
                    tabsGridOptions.onDeleting(tabs)
                        .then(() =>
                            tabsGridOptions.api.applyTransaction({
                                remove: [tabs]
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

    return tabsGridOptions;
}
