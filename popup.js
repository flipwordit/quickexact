let smartotekaFabric =
  //new SmartotekaFabricDGraph("https://blue-surf-390018.us-east-1.aws.cloud.dgraph.io/")
  new SmartotekaFabricLocalStorage();

let lastQueriesStr = localStorage['lastQueries'] || "[]";
let lastQueries = JSON.parse(lastQueriesStr);

let searchQueryInput = document.getElementById('search-query');

searchQueryInput.focus();

let searchBtn = document.getElementById('search-btn');

$(searchQueryInput).keypress(function (event) {
  var keycode = (event.keyCode ? event.keyCode : event.which);
  if (keycode == '13') {
    search();
  }
});

searchBtn.addEventListener('click', search);

function search() {

  //TODO: add change current url for browser history 
  //TODO: add opportunity open search by url with args

  const searchResultDiv = $('#search-result');
  searchResultDiv.empty();

  let query = $(searchQueryInput).val();

  if (lastQueries.length === 0 || lastQueries[0] !== query) {
    lastQueries.unshift(query);

    if (lastQueries.length > 10) {
      lastQueries.pop();
    }

    localStorage.setItem('lastQueries', JSON.stringify(lastQueries));

    refreshLastQueries();
  }

  smartotekaFabric.queriesProvider()
    .search(query)
    .then((searchResults) => {

      if (!searchResults) {
        searchResultDiv.text("No results found.")
      }
      else {
        searchResults.forEach(element => {
          searchResultDiv.append('<li><span class="answer">'
            + (element.startsWith("http") ? ('<a href="' + element + '">' + element + '</a>') : element)
            + '</span><span class="delete">&#x2717;</span></li>')
        });

        $(".delete", searchResultDiv).click((e) => {
          let element = e.target;

          let rowElement = $(element).parent();

          let answer = $('.answer', rowElement).html();

          smartotekaFabric.KBManager()
            .remove(query, answer)
            .then(_ => rowElement.remove());
        })
      }
    });
}

function refreshLastQueries() {
  let lastQueriesDiv = $("#lastQueries");
  lastQueriesDiv.empty();

  lastQueries.forEach((query) => lastQueriesDiv.append("<li>" + query + "</li>"));
}

function getTags(url, title) {
  const tagsMap = {
    "www.google.com": "GOOGLE",
    "ag-grid": "agGrid",
    "aggrid": "agGrid",
    "javascript": "JavaScript",
    "developer.chrome.com/docs/extensions": "Chrome extension api"
  };

  let tags = [];
  for (const [searchTag, tag] of Object.entries(tagsMap)) {

    if (url.indexOf(searchTag) !== -1 || title.toLowerCase().indexOf(searchTag) !== -1) {
      tags.push(tag);
    }
  }

  return tags;
}

$(function () {
  $('#add-block-switch').click(function () {
    $(this).html($('#add-block').toggle().is(':hidden') ? '&#8595;' : '&#8593;');
  });

  refreshLastQueries();

  $('#lastQueries').click(function (e) {
    if (e.target.localName === "li") {
      $(searchQueryInput).val($(e.target).text());

      search();
    }
  });

  $('#add-btn').click(function (e) {
    let query = $('#add-query').val();
    let content = $('#add-content').val();

    content = $('<div/>').html(content).html();
    smartotekaFabric.KBManager().add(query, content);

    //smartotekaFabric.KBManager().add("vs shortcuts", "Format code Shift + Alt + F<br/>Refactor CTRL + Shift + R<br/> Save All Ctrl+K S")
  });

  $('#export-all-btn').click((e) => {
    smartotekaFabric
      .queriesProvider()
      .export(new Date().toJSON().replaceAll(":", "_"));
  });

  let form = document.querySelector('#import-form');
  let file = document.querySelector('#import-file');

  form.addEventListener('submit', (event) => {

    // Stop the form from reloading the page
    event.preventDefault();

    // If there's no file, do nothing
    if (!file.value.length) return;

    // Create a new FileReader() object
    let reader = new FileReader();

    // Setup the callback event to run when the file is read
    reader.onload = (event) => {
      let str = event.target.result;
      let json = JSON.parse(str);

      smartotekaFabric.KBManager().import(json);
    };

    // Read the file
    reader.readAsText(file.files[0]);

  });
})

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request === "clear")
      sendResponse("Cool clear!");

    const searchResultDiv = $('#search-result');
    searchResultDiv.empty();
    $(searchQueryInput).val('');
  }
);