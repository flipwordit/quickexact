if (location.host === "www.google.com") {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());

  const googelQuery = params["q"];
  console.log(googelQuery);//TODO: handle quote symbols '"

  let dGraphQuery =
    "{"
    + "findNodes(func: alloftext(query, \"" + googelQuery + "\")) {"
    + "query,"
    + "urls,"
    + "queries {"
    + "query,"
    + "urls"
    + "}"
    + "}"
    + "}";

  $.ajax({
    type: "POST",
    url: "http://localhost:8080/query?timeout=20s",
    data: JSON.stringify({ "query": dGraphQuery, "variables": {} }),
    contentType: "application/json",
    success: function (data) {
      let urls = findValues(data.data, "urls");
      console.log(urls);

      $('h3', $("#search"))
        .each((ind, el) => {
          let currentUrl = $(el).parent().attr("href");
          if (currentUrl
            && urls.find((v, ind, obj) => {
              return currentUrl.startsWith(v);
            }))
            $(el).append("&nbsp;&#10003;");
        });
    }
  });
}

var firstHref = $("a[href^='http']").eq(0).attr("href");

console.log(firstHref);

$("a[href^='http']").eq(0).append("*");

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.message === "clicked_browser_action") {
      var firstHref = $("a[href^='http']").eq(0).attr("href");

      console.log(firstHref);
    }
  }
);


function findValues(obj, key) {
  return findValuesHelper(obj, key, []);
}

function findValuesHelper(obj, key, list) {
  if (!obj) return list;
  if (obj instanceof Array) {
    for (var i in obj) {
      list = list.concat(findValuesHelper(obj[i], key, []));
    }
    return list;
  }

  if ((typeof obj == "object") && (obj !== null)) {
    var children = Object.keys(obj);
    if (children.length > 0) {
      for (i = 0; i < children.length; i++) {
        list = list.concat(findValuesHelper(obj[children[i]], key, []));
      }
    }
  }

  if (obj[key])
    return obj[key];

  return list;
}