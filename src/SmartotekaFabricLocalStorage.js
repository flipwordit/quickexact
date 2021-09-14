let KnowledgeType = {
    Usefull: 1,
    Preserved: 2
};

class SmartotekaFabricLocalStorage {

    #getSmartoteka() {

        return new Promise((resolve) => {

            chrome.storage.sync.get(['Smartoteka'], (smartoteka) => {

                if (!smartoteka||!(smartoteka['Smartoteka'])) {
                    console.log("Add smartoteka")
                    smartoteka = {};

                    this.#save(smartoteka);

                    resolve(smartoteka);
                }
                else
                {
                    resolve(smartoteka['Smartoteka']);
                }
            });
        });
    }

    #save(smartoteka) {

        chrome.storage.sync.set({ Smartoteka: smartoteka }, function () {
            console.log('Saved');
        });
    }

    queriesProvider() {
        let parent = this;

        class SmartotekaQueryManager {
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
                            const index = queryLinks.indexOf(answer);
                            if (index > -1) {
                                queryLinks.splice(index, 1);

                                if (queryLinks.length === 0) {
                                    smartoteka[query] = null;
                                }
                            }

                            parent.#save(smartoteka);
                        }

                        resolve();
                    });
                });
            }
        }

        return new SmartotekaManager();
    }
}