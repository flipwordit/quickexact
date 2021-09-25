let KnowledgeType = {
    Usefull: 1,
    Preserved: 2
};

class SmartotekaFabricLocalStorage {

    #getSmartoteka() {

        return new Promise((resolve) => {

            chrome.storage.sync.get(['Smartoteka'], (storage) => {

                if (!storage || !(storage['Smartoteka'])) {
                    console.log("Add smartoteka")
                    storage = {};

                    this.#save(storage);

                    resolve(storage);
                }
                else {
                    resolve(storage['Smartoteka']);
                }
            });
        });
    }

    #getTags() {

        return new Promise((resolve) => {

            const memberName = 'Tags';
            chrome.storage.sync.get([memberName], (storage) => {

                if (!storage || !(storage[memberName])) {
                    console.log("Add " + memberName);
                    storage = [];

                    this.#save(storage);

                    resolve(storage);
                }
                else {
                    resolve(storage[memberName]);
                }
            });
        });
    }

    #getSessions() {

        return new Promise((resolve) => {

            const memberName = 'Sessions';
            chrome.storage.sync.get([memberName], (storage) => {

                if (!storage || !(storage[memberName])) {
                    storage = [];

                    this.#save(storage);

                    resolve(storage);
                }
                else {
                    resolve(storage[memberName]);
                }
            });
        });
    }

    #saveTags(tags) {
        return new Promise(r =>
            chrome.storage.sync.set({ Tags: tags }, () => r())
        );
    }

    #saveSessions(sessions) {
        return new Promise(r =>
            chrome.storage.sync.set({ Sessions: sessions }, () => r())
        );
    }

    #save(smartoteka) {
        return new Promise(r =>
            chrome.storage.sync.set({ Smartoteka: smartoteka }, () => r())
        );
    }

    queriesProvider() {

        let parent = this;

        class SmartotekaQueryManager {
            #downloadObjectAsJson(exportObj, exportName) {
                var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
                var downloadAnchorNode = document.createElement('a');
                downloadAnchorNode.setAttribute("href", dataStr);
                downloadAnchorNode.setAttribute("download", exportName + ".json");
                document.body.appendChild(downloadAnchorNode); // required for firefox
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
            }

            search(query) {
                var promise = new Promise((resolve, reject) => {
                    parent.#getSmartoteka()
                        .then((smartoteka) => {
                            let searchResults = smartoteka[query];

                            resolve(searchResults);
                        });
                });

                return promise;
            }

            isUseful(url) {
                return new Promise((resolve) => resolve(url.charCodeAt(url.length - 1) % 2 === 0 ? [1] : []));
            }

            export(fileName) {
                var promise = new Promise((resolve, reject) => {
                    Promise.all([
                        parent.#getSmartoteka(),
                        parent.#getTags(),
                        parent.#getSessions()
                    ])
                        .then(([Smartoteka, Tags, Sessions]) => {

                            this.#downloadObjectAsJson(
                                {
                                    Smartoteka,
                                    Tags,
                                    Sessions
                                },
                                fileName);

                            resolve(true);
                        });
                });

                return promise;
            }

            getTags() {
                return parent.#getTags();
            }

            getSessions() {
                return parent.#getSessions();
            }
        }

        return new SmartotekaQueryManager();
    }

    KBManager() {
        let parent = this;

        class SmartotekaManager {
            add(query, content) {
                parent.#getSmartoteka()
                    .then((smartoteka) => {

                        var queryLinks = smartoteka[query];

                        if (!queryLinks) {
                            queryLinks = smartoteka[query] = [content];
                        }
                        else {
                            if (queryLinks.indexOf(content) < 0)
                                queryLinks.push(content);
                        }

                        parent.#save(smartoteka);
                    });
            }

            remove(query, answer) {

                return new Promise(resolve => {
                    parent.#getSmartoteka()
                        .then((smartoteka) => {

                            var queryLinks = smartoteka[query];

                            if (queryLinks) {
                                let index = queryLinks.indexOf(answer);

                                if (index > -1) {
                                    queryLinks.splice(index, 1);

                                    if (queryLinks.length === 0) {
                                        delete smartoteka[query];
                                    }

                                    parent.#save(smartoteka);
                                    resolve();
                                }
                            }
                        });
                });
            }

            import(json) {
                parent.#save(json.Smartoteka || {});
                parent.#saveTags(json.Tags || []);
                parent.#saveSessions(json.Sessions || []);
            }

            addTags(newTags) {
                return new Promise(resolve => {
                    if (newTags.length == 0) {
                        resolve();
                    }

                    parent.#getTags()
                        .then(tags => {
                            tags = [...tags, ...newTags];
                            parent.#saveTags(tags);

                            resolve();
                        });
                });
            }

            addSession(session) {
                return new Promise(resolve => {
                    parent.#getSessions()
                        .then(sessions => {
                            sessions = [...sessions, session];
                            parent.#saveSessions(sessions);

                            resolve();
                        });
                });
            }
            deleteSession(session) {
                return new Promise(resolve => {
                    parent.#getSessions()
                        .then(sessions => {
                            var index = sessions.findIndex(el => el.query === session.query && el.date === session.date);
                            if (index !== -1) {
                                sessions.splice(index, 1);
                            }
                            parent.#saveSessions(sessions)
                                .then(() => resolve());
                        });
                });
            }
        }

        return new SmartotekaManager();
    }
}