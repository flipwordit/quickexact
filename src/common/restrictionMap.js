function registerRestrictionMap() {
    const restrict = {
        "Chrome": {
            "Api": {
                "V3": {},
                "V2": {},
                "tab": {
                    "event": {}
                }
            },

        },
        "Vs code": {
            "shortcut": {}
        },
        "vs code": {
            "shortcut": {}
        },
        "vs": {
            "shortcut": {}
        }
    }

    function restrictToMap(restrict, map, parent = '.') {
        let id = 0;
        for (let key in restrict) {
            map[key] = parent + id++;//TODO: заменить на дроби
            restrictToMap(restrict[key], map, map[key]);
        }
    }

    window.restrictMap = {};
    restrictToMap(restrict, restrictMap);
}