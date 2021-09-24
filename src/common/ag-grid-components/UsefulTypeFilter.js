
class UsefulTypeFilter {
    init(params) {
      this.valueGetter = params.valueGetter;
      this.selectedValue = null;
      this.setupGui(params);
    }
  
    setupGui(params) {
      this.gui = document.createElement('div');
      this.gui.innerHTML = `<div style="padding: 4px; width: 100px;">
                  <div>
                      <select id='useful-type-select'>
                      <option value='0'>All<option/>
                      <option value='1'>Useful<option/>
                      <option value='2'>Unuseful<option/>
                     
                      </select>
                  </div>
          
              </div>
          `;
  
      const listener = (event) => {
        this.selectedValue = event.target.value;
  
        this.compare = () => true;
  
        switch (this.selectedValue) {
          case "1":
            this.compare = (p) => this.valueGetter(p) === true;
            break;
          case "2":
            this.compare = (p) => this.valueGetter(p) === false;
            break;
        }
  
        params.filterChangedCallback();
      };
  
      this.usefulTypeSelect = this.gui.querySelector('#useful-type-select');
      this.usefulTypeSelect.addEventListener('change', listener);
    }
  
    getGui() {
      return this.gui;
    }
  
    doesFilterPass(params) {
  
      return this.compare(params);
    }
  
    isFilterActive() {
      return this.selectedValue != null;
    }
  
    getModel() {
      return { value: this.selectedValue.value };
    }
  
    setModel(model) {
      this.usefulTypeSelect.value = model.value;
    }
  }