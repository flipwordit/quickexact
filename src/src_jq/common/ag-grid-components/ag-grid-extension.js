function agGridExtendApi(grid) {
    let api=grid.api;
    
    api.getFilteredRows = function (predicate) {
        let rows = [];
        api.forEachNodeAfterFilter(node => {
            if (node.data && (!predicate || predicate(node)))
                rows.push(node.data);
        });

        return rows;
    }

    api.getAllRows = function (predicate) {
        let rows = [];
        api.forEachNode(node => {
            if (node.data && (!predicate || predicate(node)))
                rows.push(node.data);
        });

        return rows;
    }

    return grid;
}