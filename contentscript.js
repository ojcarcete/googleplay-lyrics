/*****************************************************************************
 * Chromium Extension to Display Lyrics for Current Song in Google Play (TM)
 * from lyricwiki.org
 *
 *   Copyright (C) 2013  Oscar Figuerola
 *
 * Authors: Oscar Figuerola Salas <oscar.figuerola.salas@gmail.com>
 *          sethu
 *
 *   Previous project: https://github.com/sethubhatti/grooveshark-lyrics
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *****************************************************************************/

// Google Play html
var SECTION_HEADER_ID = "playlists-header";
var PLAYLISTS_DRAWER_BUTTON_ID = "playlist-drawer-button";
var SONG_TITLE_CONTAINER_ID = "currently-playing-title";
var ARTIST_CONTAINER_ID = "player-artist";

// Custom html
var LYRICS_BUTTON_ID = "lyrics-button";
var LYRICS_BUTTON_ICON = "av:library-books";

var LYRICS_DIALOG_CONTAINER_ID = "mainContainer";
var LYRICS_DIALOG_ID = "scrolling";
var LYRICS_HEADER_CLASS = "lyrics-header";
var LYRICS_CONTAINER_ID = "lyrics";

var songName = null;
var artistName = null;
var firstLyricsLoaded = false;
var lyricsContainerOffset = 0;

$(document).ready(function() {

  configureLyricsHtmlIfNeeded();
  startFetchingLyrics();
});

function startFetchingLyrics() {

  setInterval(getLyrics, 1500);
}

function getLyrics() {

  var thereIsError = false;
  var lyricsContainer = $("#" + LYRICS_CONTAINER_ID);

  if (lyricsContainer) {

    var currentLyrics = lyricsContainer.html();

    if (currentLyrics.search(/network error/i) >= 0) {

      thereIsError = true;
    }
  }

  // Lyrics already retrieved
  if (lyricsAlreadyRetrievedForCurrentSong() && !thereIsError) {

    return;
  }

  // Send new request to get the lyrics url
  songName = $("#" + SONG_TITLE_CONTAINER_ID).text();
  artistName = $("#" + ARTIST_CONTAINER_ID).text();

  if (songName != null && songName != "") {

    chrome.extension.sendRequest({
      song: songName,
      artist: artistName
    }, function(response) {

      console.log("Lyrics received");

      // Insert lyrics in page      
      var lyricsHtml = response.lyrics;

      lyricsContainer.html(lyricsHtml);
      lyricsContainer.children(".rtMatcher").remove();

      repositionLyricsDialog();

      if (!firstLyricsLoaded) {

        firstLyricsLoaded = true;

        $("#" + LYRICS_BUTTON_ID).click();
      }
    });

    return;
  }
}

function configureLyricsHtmlIfNeeded() {

  if (document.getElementById(LYRICS_DIALOG_ID)) {

    return;
  }

  addLyricsButton();
  addLyricsContainer();
}

function addLyricsButton() {

  $("#" + PLAYLISTS_DRAWER_BUTTON_ID).before("<paper-icon-button id=\"" + LYRICS_BUTTON_ID + "\" icon=\"" + LYRICS_BUTTON_ICON + "\" onclick=\"" + LYRICS_DIALOG_ID + ".toggle()\"></paper-icon-button>");
}

function addLyricsContainer() {

  var LYRICS_HEADER_HTML = "<h2 id=\"" + SECTION_HEADER_ID + "\" class=\"" + LYRICS_HEADER_CLASS + "\">Lyrics</h2>";
  var LYRICS_CONTAINER_HTML = "<div id=\"" + LYRICS_CONTAINER_ID + "\"><p>No lyrics to show yet</p></div>";

  $("#" + LYRICS_DIALOG_CONTAINER_ID).append("<paper-dialog onclick=\"scrolling.refit()\" id=\"" + LYRICS_DIALOG_ID + "\" horizontal-align=\"right\" vertical-align=\"bottom\" no-cancel-on-outside-click>" + LYRICS_HEADER_HTML + "<paper-dialog-scrollable>" + LYRICS_CONTAINER_HTML + "</paper-dialog-scrollable></paper-dialog>");
}

function repositionLyricsDialog() {

  $("#" + LYRICS_DIALOG_ID).click();
}

function lyricsAlreadyRetrievedForCurrentSong() {

  return (songName == $("#" + SONG_TITLE_CONTAINER_ID).text());
}

