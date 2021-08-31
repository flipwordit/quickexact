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

function getSmartoteka(){
  let smartotekaStr = localStorage['Smartoteka'];

  let smartoteka = {};

  if (smartotekaStr) {
    smartoteka = JSON.parse(smartotekaStr);
  }
  else {
    console.log("Add smartoteka")
    smartoteka = {};

    save(smartoteka);
  }

  return smartoteka;
}

function save(smartoteka){
  localStorage.setItem('Smartoteka',JSON.stringify(smartoteka))
}

function search() {
  
  let smartoteka = getSmartoteka();

  const searchResultDiv = $('#search-result');
  searchResultDiv.empty();

  let query = $(searchQueryInput).val();
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

  $('#add-btn').click(function (e) {
    let query = $('#add-query').val();
    let content = $('#add-content').val();

    let smartoteka = getSmartoteka();

    var queryLinks=smartoteka[query];

    if(!queryLinks){
      queryLinks=smartoteka[query]=[content];
    }
    else{
      //TODO: need add check content is new
      queryLinks.push(content);
    }

    save(smartoteka);
  })
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
