function createCheatSheetsGrid(selector) {

    const restrict = {
        "Chrome": {
            "Api": {
                "V3":{},
                "V2":{},
                "tab": {
                    "event": {}
                }
            },

        }
    }

    function restrictToMap(restrict, map, parent = '.') {
        let id = 0;
        for (let key in restrict) {
            map[key] = parent + id++;//TODO: заменить на дроби
            restrictToMap(restrict[key], map, map[key]);
        }
    }

    window.restrictMap={};
    restrictToMap(restrict, restrictMap);

    const cheatSheetsGridColumns = [
        {
            field: "content",
            width: "800px",
            filter: "fuzzyFilter"
        },
        {
            field: "tags",
            width: "300px",
            filter: 'agSetColumnFilter',
            valueGetter: params => {
                if (!params.data)
                    return params.data;

                let texts = (params.data.tags || []).map(el => el.text);

                texts = texts.sort((a, b) => {
                    let aId = restrictMap[a];
                    let bId = restrictMap[b];

                    return aId === undefined
                        ? bId === undefined
                            ? a.localeCompare(b)
                            : 1
                        : bId === undefined
                            ? -1
                            : aId.localeCompare(bId);
                });

                return texts;
            },
            valueFormatter: params => {
                if (!params.data)
                    return params.data;

                return params.value.join(', ');
            }
        }
    ];

    const cheatSheetsGridOptions = {
        defaultColDef: {
            resizable: true,
            filter: true,
            sorcheatSheetle: true,
            wrapText: true,
            autoHeight: true,
        },
        columnDefs: cheatSheetsGridColumns,
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
        rowSelection: 'multiple',
        getContextMenuItems: getContextMenuItems,
    };



    function getContextMenuItems(params) {
        return [
            {
                name: 'Copy',
                action: function () {
                    navigator.clipboard.writeText(params.node.data.content);
                }
            },
            {
                name: 'Delete',
                action: function () {
                    cheatSheetsGridOptions.onDeleting(params.node.data)
                        .then(() =>
                            cheatSheetsGridOptions.api.applyTransaction({
                                remove: [params.node.data]
                            })
                        );
                }
            },
        ];

    }

    const cheatSheetsGridDiv = document.querySelector(selector);
    new agGrid.Grid(cheatSheetsGridDiv, cheatSheetsGridOptions);

    return cheatSheetsGridOptions;
}
