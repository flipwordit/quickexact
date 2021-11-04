function cheatsheetsGroup(cheatsheets) {

    if (cheatsheets.length === 0) {
        return [];
    }

    function compareTags(tags1, tags2) {
        let i = 0;
        for (; i < tags1.length && i < tags2.length; i++) {
            if (tags1[i].id !== tags2[i].id) return i;
        }

        return i;
    }

    let prev = cheatsheets[0];
    let id = 1;
    let prevGroup = {
        id: ++id,
        items: [prev],
        commonTagsCount: -1,
        groups: [],
        parent: null,
    };
    let groups = [prevGroup];

    for (let i = 1; i < cheatsheets.length; i++) {
        let current = cheatsheets[i];

        let commonTagsCount = compareTags(current.tags, prev.tags);

        if (
            prevGroup.commonTagsCount === commonTagsCount ||
            (prevGroup.commonTagsCount === -1 && commonTagsCount > 0)
        ) {
            prevGroup.items.push(current);

            if (prevGroup.commonTagsCount === -1) {
                prevGroup.commonTagsCount = commonTagsCount;
            }
        } else {
            if (prevGroup.commonTagsCount < commonTagsCount) {
                prevGroup.items.pop();

                let currentGroup = {
                    id: ++id,
                    items: [prev, current],
                    commonTagsCount: commonTagsCount,
                    groups: [],
                    parent: prevGroup,
                };

                prevGroup.groups.push(currentGroup);
                prevGroup = currentGroup;
            } else {
                let dif = prevGroup.commonTagsCount - commonTagsCount;

                for (let j = 0; j < dif && prevGroup; j++) {
                    prevGroup = prevGroup.parent;
                }

                if (prevGroup) {
                    prevGroup.items.push(current);
                } else {
                    let currentGroup = {
                        id: ++id,
                        items: [current],
                        commonTagsCount: -1,
                        groups: [],
                        parent: null,
                    };

                    groups.push(currentGroup);
                    prevGroup = currentGroup;
                }
            }
        }

        prev = current;
    }

    return groups;
}

window.cheatsheetsGroup = cheatsheetsGroup;