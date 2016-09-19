// Return Message Function ptr
var sendLyrics;
var lyrics;
var sourceUrl;
var status;
var errorString;

function loadLyrics(htmlResponse) {

  lyrics = $(htmlResponse).find('div[class="lyricbox"]').html();
  sendLyrics({
    "status": "success",
    "lyrics": lyrics,
    "sourceURL": sourceUrl
  });
}

// Extracts the lyric's link and sends a request to get them
function getLyricsLink(xmlResponse) {

  var url = xmlResponse.getElementsByTagName('url');
  sourceUrl = url[0].textContent;

  try {
    sourceUrl = decodeURIComponent(escape(decodeURI(sourceUrl)));
  } catch (error) {

    console.error(error);
  }

  if (sourceUrl.search(/edit/) >= 0) {

    sendLyrics({
      "status": "Not Found",
      "lyrics": "Lyrics Not Available. </br> </br> you can " +
        "add lyrics for this song at: </br> </br> <a href=\"" +
        sourceUrl + "\" target=\"_blank\">" + sourceUrl + "</a>"
    });
  }

  console.log(sourceUrl);

  $.ajax({
    url: sourceUrl,
    success: loadLyrics
  });
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {

  // Using lyrics.wikia.com REST api.
  $.ajax({
    url: "http://lyrics.wikia.com/api.php",
    data: {
      artist: request.artist,
      song: request.song,
      fmt: "xml",
      func: "getSong"
    },
    success: getLyricsLink
  });

  sendLyrics = sendResponse;
});

$(document).ajaxError(function() {

  sendLyrics({
    "status": "failure",
    "lyrics": "Network Error"
  });
});