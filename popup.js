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
  var query = $(searchQueryInput).val();

  let smartotekaStr = localStorage['Smartoteka'];

  let smartoteka = {};

  if (smartoteka) {
    smartoteka = JSON.parse(smartotekaStr);
  }
  else {
    console.log("Add smartoteka")
    smartoteka = localStorage['Smartoteka'] = {};
  }

  const searchResultDiv = $('#search-result');
  searchResultDiv.empty();

  let searchResults = smartoteka[query];

  if (!searchResults) {
    searchResultDiv.text("No results found.")
  }
  else {
    searchResults.forEach(element => {
      searchResultDiv.append('<li>' + element + '</li>')
    });
  }

  //localStorage.setItem('Smartoteka',JSON.stringify({"vs":["Format code Shift + Alt + F<br/>Refactor CTRL + Shift + R<br/> Save All Ctrl+K S"]}))
}

$(function () {
  $('#lastQueries').click(function (e) {
    if (e.target.localName === "li") {
      $(searchQueryInput).val($(e.target).text());

      search();
    }
  })
})

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request === "clear")
      sendResponse("Cool clear!");

      const searchResultDiv = $('#search-result');
      searchResultDiv.empty();
      $(searchQueryInput).val('');
  }
);
