
// Return Message Function ptr
var sendLyrics;
var lyrics;
var sourceURL;
var status;
var errorString;

function loadLyrics(htmlResponse) {
  lyrics = $(htmlResponse).find('div[class="lyricbox"]').html();
  sendLyrics({"status": "success" , "lyrics": lyrics , "sourceURL": sourceURL});
}

// Extracts the lyric's link and sends a request to get them
function getLyricsLink(xmlResponse) {  
  var url = xmlResponse.getElementsByTagName('url');
  sourceURL = url[0].textContent;
  
  try {
    sourceURL = decodeURIComponent(escape(decodeURI(sourceURL)));
  }
  catch(err) {

  }
  
  if(sourceURL.search(/edit/) >= 0) {
    sendLyrics({"status":"Not Found","lyrics":"Lyrics Not Available. </br> </br> you can " +
      "add lyrics for this song at: </br> </br> <a href=\"" +
      sourceURL + "\" target=\"_blank\">" + sourceURL + "</a>"   });
  }
  
  $.ajax({
   url: sourceURL,
   success: loadLyrics 
 });
}

chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    
    // Using lyrics.wikia.com REST api.        
    $.ajax({
      url: "http://lyrics.wikia.com/api.php",
      data: {artist: request.artist , song: request.song, fmt: "xml"},
      success: getLyricsLink
    });
    
    sendLyrics = sendResponse;
  });

$(document).ajaxError(
  function() {
    sendLyrics({"status":"failure", "lyrics":"Network Error"});
  });
