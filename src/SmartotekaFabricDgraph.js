class SmartotekaFabricDGraph {

    constructor(dGraphUrl) {
        this._dGraphUrl = dGraphUrl;
    }

    queriesProvider() {
        let fabric = this;

        class SmartotekaQueryManager {
            search(query) {
                var that = this;
                var promise = new Promise((resolve, reject) => {
                    let dGraphQuery =
                        `{
                            findNodes(func: alloftext(query, "` + query + `")) {
                                query,
                                urls,
                                queries {
                                    query,
                                    urls
                                }
                            }
                        }`;

                    $.ajax({
                        type: "POST",
                        url: fabric._dGraphUrl + "/query",
                        data: JSON.stringify({ "query": dGraphQuery, "variables": {} }),
                        contentType: "application/json",
                        success: function (data) {
                            let urls = that.#findValues(data.data, "urls");
                            console.log(urls);

                            let queries = that.#findValues(data.data, "query");
                            resolve(urls);
                        }
                    });
                });

                return promise;
            }

            #findValues(obj, key) {
                return this.#findValuesHelper(obj, key, []);
            }

            #findValuesHelper(obj, key, list) {
                if (!obj) return list;
                if (obj instanceof Array) {
                    for (var i in obj) {
                        list = list.concat(this.#findValuesHelper(obj[i], key, []));
                    }
                    return list;
                }

                if ((typeof obj == "object") && (obj !== null)) {
                    var children = Object.keys(obj);
                    if (children.length > 0) {
                        for (i = 0; i < children.length; i++) {
                            list = list.concat(this.#findValuesHelper(obj[children[i]], key, []));
                        }
                    }
                }

                if (obj[key])
                    list = list.concat(obj[key]);

                return list;
            }
        }

        return new SmartotekaQueryManager();
    }

    KBManager() {
        let fabric = this;

        class SmartotekaManager {
            add(query, content) {
                var that = this;
                var promise = new Promise((resolve, reject) => {
                    let dGraphMutation =
                        `{
                            "set":[
                                {
                                    "query": "`+ query + `",
                                    "urls": ["`+ content + `"]
                                }
                            ]
                        }`;

                    $.ajax({
                        type: "POST",
                        url: fabric._dGraphUrl + "/mutate?commitNow=true",
                        data: dGraphMutation,
                        contentType: "application/json",
                        success: function (data) {

                            if (data.errors) {
                                console.log(data.errors);
                                reject();
                            }
                            else {
                                resolve(true);
                            }
                        }
                    });
                });

                return promise;

                // let smartoteka = parent.#getSmartoteka();

                // var queryLinks = smartoteka[query];

                // if (!queryLinks) {
                //     queryLinks = smartoteka[query] = [content];
                // }
                // else {
                //     if (queryLinks.indexOf(content) < 0)
                //         queryLinks.push(content);
                // }

                // parent.#save(smartoteka);
            }

            remove(query, answer) {
                var that = this;
                var promise = new Promise((resolve, reject) => {
                    let dGraphMutation =
                        `upsert {
                            query: { v as var(func: eq(query,"`+ query + `")) @filter(eq(urls,"` + answer + `")) }
                            
                            mutation {
                                delete{
                                    uid(v) <query> * .
                                    uid(v) <urls> * .
                                }
                          
                            }
                        }`;

                    $.ajax({
                        type: "POST",
                        url: fabric._dGraphUrl + "/mutate?commitNow=true",
                        data: dGraphMutation,
                        contentType: "application/rdf",
                        success: function (data) {

                            resolve(true);
                        }
                    });
                });

                return promise;
                // let smartoteka = parent.#getSmartoteka();

                // var queryLinks = smartoteka[query];

                // if (queryLinks) {
                //     const index = queryLinks.indexOf(answer);
                //     if (index > -1) {
                //         queryLinks.splice(index, 1);

                //         if (queryLinks.length === 0) {
                //             smartoteka[query] = null;
                //         }
                //     }

                //     parent.#save(smartoteka);
                // }
            }
        }

        return new SmartotekaManager();
    }
}