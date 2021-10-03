
class FuzzyFilter {
  init(params) {
    this.valueGetter = params.valueGetter;
    this.filterText = null;
    this.setupGui(params);

    this.filterChangeCallBack = throttle(() => {
      this.clearFilterValue(params);

      this.#searchPrepare(params);

      params.filterChangedCallback();
    }, 1000);
  }

  clearFilterValue(params) {
    params.api.forEachNode((node) => {
      if (node.data)
        delete node.data.finded;
    });
  }
  // not called by AG Grid, just for us to help setup
  setupGui(params) {
    this.gui = document.createElement('div');
    this.gui.innerHTML = `<div style="padding: 4px; width: 450px;">
                  <div>
                      <input style="margin: 4px 0 4px 0;" type="text" id="filterText" placeholder="fuzzy search..."/>
                  </div>
                  <div style="margin-top: 20px;"><table><thead><tr><th>Token</th> <th>Match type</th> <th>Description</th></tr></thead> <tbody><tr><td><code>jscript</code></td> <td>fuzzy-match</td> <td>Items that fuzzy match <code>jscript</code></td></tr> <tr><td><code>=scheme</code></td> <td>exact-match</td> <td>Items that are <code>scheme</code></td></tr> <tr><td><code>'python</code></td> <td>include-match</td> <td>Items that include <code>python</code></td></tr> <tr><td><code>!ruby</code></td> <td>inverse-exact-match</td> <td>Items that do not include <code>ruby</code></td></tr> <tr><td><code>^java</code></td> <td>prefix-exact-match</td> <td>Items that start with <code>java</code></td></tr> <tr><td><code>!^earlang</code></td> <td>inverse-prefix-exact-match</td> <td>Items that do not start with <code>earlang</code></td></tr> <tr><td><code>.js$</code></td> <td>suffix-exact-match</td> <td>Items that end with <code>.js</code></td></tr> <tr><td><code>!.go$</code></td> <td>inverse-suffix-exact-match</td> <td>Items that do not end with <code>.go</code></td></tr></tbody></table>
                  <div>
                  White space acts as an AND operator, while a single pipe (|) character acts as an OR operator.</div>
              </div>
          `;

    const listener = (event) => {
      this.filterText = event.target.value;

      this.filterChangeCallBack();
    };

    this.eFilterText = this.gui.querySelector('#filterText');
    this.eFilterText.addEventListener('changed', listener);
    this.eFilterText.addEventListener('paste', listener);
    this.eFilterText.addEventListener('input', listener);
    // IE doesn't fire changed for special keys (eg delete, backspace), so need to
    // listen for this further ones
    this.eFilterText.addEventListener('keydown', listener);
    this.eFilterText.addEventListener('keyup', listener);
  }

  getGui() {
    return this.gui;
  }

  #searchPrepare(params) {
    let rowData = [];
    params.api.forEachNode(node => {
      if (!node.data)
        return;
        
      rowData.push(node.data);
      node.data.finded = false;
    });

    const options = {
      includeScore: true,
      useExtendedSearch: true,
      keys: ['title']
    }

    const fuse = new Fuse(rowData, options)

    // Search for items that include "Man" and "Old",
    // OR end with "Artist"
    let searchedRows = fuse.search(this.filterText);

    searchedRows.forEach(v => {
      v.item.finded = true;
    });

    this.setFilter = true;
  }

  doesFilterPass(params) {
    return params.data.finded === undefined || params.data.finded;
  }

  isFilterActive() {
    return this.filterText != null && this.filterText !== '';
  }

  getModel() {
    return { value: this.filterText.value };
  }

  setModel(model) {
    this.eFilterText.value = model.value;
  }
}