if (location.host === "www.google.com"){
	const urlSearchParams = new URLSearchParams(window.location.search);
	const params = Object.fromEntries(urlSearchParams.entries());
	
	console.log(params["q"]);
	
	$('h3',$("#search")).append("&nbsp;&#10003;")
}

 var firstHref = $("a[href^='http']").eq(0).attr("href");

      console.log(firstHref);
	  
	  $("a[href^='http']").eq(0).append("*");
	  
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "clicked_browser_action" ) {
      var firstHref = $("a[href^='http']").eq(0).attr("href");

      console.log(firstHref);
    }
  }
);