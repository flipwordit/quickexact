let KnowledgeType = {
    Usefull: 1,
    Preserved: 2
};

class SmartotekaFabricLocalStorage {

    #getFromStorage(memberName, defaultValue) {
        return new Promise((resolve) => {
            chrome.storage.local.get([memberName], (storage) => {

                if (!storage || !(storage[memberName])) {
                    console.log("Add " + memberName);
                    storage = defaultValue;

                    this.#save(storage);

                    resolve(storage);
                }
                else {
                    resolve(storage[memberName]);
                }
            });
        });
    }

    #getSmartoteka() {
        return this.#getFromStorage("Smartoteka", {});
    }

    #getCheatSheets() {
        return this.#getFromStorage("CheatSheets", []);
    }

    #getTags() {
        return this.#getFromStorage("Tags", []);
    }

    #getSessions() {
        return this.#getFromStorage("Sessions", []);
    }

    #saveTags(tags) {
        return new Promise(r =>
            chrome.storage.local.set({ Tags: unique(tags, el => el.id) }, () => r())
        );
    }

    #saveSessions(sessions) {
        return new Promise(r =>
            chrome.storage.local.set({ Sessions: sessions }, () => r())
        );
    }

    #saveCheatSheets(cheatSheets) {
        return new Promise(r =>
            chrome.storage.local.set({ CheatSheets: cheatSheets }, () => r())
        );
    }

    #save(smartoteka) {
        return new Promise(r =>
            chrome.storage.local.set({ Smartoteka: smartoteka }, () => r())
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
                        parent.#getSessions(),
                        parent.#getCheatSheets()
                    ])
                        .then(([Smartoteka, Tags, Sessions, CheatSheets]) => {

                            this.#downloadObjectAsJson(
                                {
                                    Smartoteka,
                                    Tags,
                                    Sessions,
                                    CheatSheets
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

            getCheatSheets() {
                return parent.#getCheatSheets();
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
                parent.#saveCheatSheets(json.CheatSheets || []);
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

            addCheatSheet(cheatSheet) {
                return new Promise(resolve => {
                    parent.#getCheatSheets()
                        .then(cheatSheets => {
                            cheatSheets = [...cheatSheets, cheatSheet];
                            parent.#saveCheatSheets(cheatSheets);

                            resolve();
                        });
                });
            }

            updateSession(session) {
                return new Promise(resolve => {
                    parent.#getSessions()
                        .then(sessions => {
                            var index = sessions.findIndex(el => el.date === session.date);
                            if (index !== -1) {
                                sessions[index] = session;
                            }
                            parent.#saveSessions(sessions)
                                .then(() => resolve());
                        });
                });
            }

            updateCheatSheets(updateCheatSheets) {
                return new Promise(resolve => {
                    parent.#getCheatSheets()
                        .then(cheatSheets => {
                            updateCheatSheets
                                .forEach(cheatSheet => {
                                    var index = cheatSheets.findIndex(el => el.date === cheatSheet.date);
                                    if (index !== -1) {
                                        cheatSheets[index] = cheatSheet;
                                    }
                                });

                            parent.#saveCheatSheets(cheatSheets)
                                .then(() => resolve());
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

            deleteCheatSheet(cheatSheet) {
                return new Promise(resolve => {
                    parent.#getCheatSheets()
                        .then(cheatSheets => {
                            var index = cheatSheets.findIndex(el => el.content === cheatSheet.content && el.date === cheatSheet.date);
                            if (index !== -1) {
                                cheatSheets.splice(index, 1);
                            }
                            parent.#saveCheatSheets(cheatSheets)
                                .then(() => resolve());
                        });
                });
            }
        }

        return new SmartotekaManager();
    }
}