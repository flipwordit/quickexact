// import $ from 'jquery'

// let smartotekaFabric = getSmartotekaFabric()
// let queryProvider = smartotekaFabric.queriesProvider()

// if (location.host === 'www.google.com') {
//   const urlSearchParams = new URLSearchParams(window.location.search)
//   const params = Object.fromEntries(urlSearchParams.entries())

//   const googelQuery = params.q
//   console.log(googelQuery)// TODO: handle quote symbols '"

//   queryProvider.search(googelQuery)
//     .then((searchResult) => {
//       if (!searchResult) { return }

//       $('#rcnt').children().last()
//         .before("<div id='smartoteka' style='margin-left:936px'></div>")
//       let smartotekaDiv = $('#smartoteka')

//       let queries = searchResult
//       console.log(queries)
//       queries.forEach(q => smartotekaDiv.append("<li><a href='https://www.google.com/search?q=" + q + "'>" + q + '</a></li>'))
//       // TODO: add usefull links bellow each query

//       // $('h3', $("#search"))
//       //   .each((ind, el) => {

//       //     let currentUrl = $(el).parent().attr("href");
//       //     if (currentUrl
//       //       && urls.find((v, ind, obj) => {
//       //         return currentUrl.startsWith(v);
//       //       }))
//       //       $(el).append("&nbsp;&#10003;");
//       //   });
//     })
// }

// let firstHref = $("a[href^='http']").eq(0).attr('href')

// console.log(firstHref)

// $("a[href^='http']").eq(0).append('*')

// chrome.runtime.onMessage.addListener(
//   function (request, sender, sendResponse) {
//     if (request.message === 'clicked_browser_action') {
//       firstHref = $("a[href^='http']").eq(0).attr('href')

//       console.log(firstHref)
//     }
//   },
// )
