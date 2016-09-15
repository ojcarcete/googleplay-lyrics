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

// Google Play HTML
var SECTION_HEADER_ID = "playlists-header";
var PLAYLISTS_DRAWER_BUTTON_ID = "playlist-drawer-button";
var SONG_TITLE_CONTAINER_ID = "currently-playing-title";
var ARTIST_CONTAINER_ID = "player-artist";
var SONGS_QUEUE_BUTTON_ID = "queue";
var SONGS_QUEUE_DIALOG_ID = "queue-overlay";

// Custom HTML
var LYRICS_BUTTON_ID = "lyrics-button";
var LYRICS_BUTTON_ICON = "av:library-books";

var LYRICS_DIALOG_CONTAINER_ID = "mainContainer";
var LYRICS_DIALOG_ID = "scrolling";
var LYRICS_HEADER_CLASS = "lyrics-header";
var LYRICS_CONTAINER_ID = "lyrics";

// Other variables
var songName = null;
var artistName = null;
var firstLyricsLoaded = false;
var lyricsContainerOffset = 0;
var lastFetchedLyrics = "No lyrics to show yet";

// Start fetching
$(document).ready(function() {

  configureLyricsHtmlIfNeeded();
  configureSongsQueueDialogButton();
  startFetchingLyrics();
});

// Lyrics Functions

function startFetchingLyrics() {

  setInterval(getLyrics, 1500);
}

function getLyrics() {

  var thereIsError = false;
  var lyricsContainer = $("#" + LYRICS_CONTAINER_ID);

  if (lyricsContainer) {

    var currentLyrics = lyricsContainer.html();

    if (/network error/i.test(currentLyrics)) {

      thereIsError = true;
    }
  }

  if (lyricsAlreadyRetrievedForCurrentSong() && !thereIsError) {

    return;
  }

  // Send a new request to get the lyrics url
  songName = $("#" + SONG_TITLE_CONTAINER_ID).text();
  artistName = $("#" + ARTIST_CONTAINER_ID).text();

  if (songName != null && songName != "") {

    chrome.extension.sendRequest({
        song: songName,
        artist: artistName
      },
      function(response) {

        // Process lyrics
        lastFetchedLyrics = response.lyrics;

        lyricsContainer.html(lastFetchedLyrics);
        lyricsContainer.children(".rtMatcher").remove();

        repositionLyricsDialog();

        if (!firstLyricsLoaded) {

          firstLyricsLoaded = true;
          openLyricsDialog();
        }
      });

    return;
  }
}

// Custom HTML Configuration Functions

function configureLyricsHtmlIfNeeded() {

  addLyricsButtonIfNeeded();
  addLyricsContainerIfNeeded();
}

function addLyricsButtonIfNeeded() {

  if (lyricsButtonExists()) {

    return;
  }

  var LYRICS_BUTTON_HTML = "<paper-icon-button id=\"" + LYRICS_BUTTON_ID + "\" icon=\"" + LYRICS_BUTTON_ICON + "\" onclick=\"" + LYRICS_DIALOG_ID + ".toggle()\"></paper-icon-button>";

  $("#" + PLAYLISTS_DRAWER_BUTTON_ID).before(LYRICS_BUTTON_HTML);

  $("#" + LYRICS_BUTTON_ID).click(lyricsButtonPressed);
}

function addLyricsContainerIfNeeded() {

  if (lyricsDialogExists()) {

    return;
  }

  var LYRICS_HEADER_HTML = "<h2 id=\"" + SECTION_HEADER_ID + "\" class=\"" + LYRICS_HEADER_CLASS + "\">Lyrics</h2>";
  var LYRICS_CONTAINER_HTML = "<div id=\"" + LYRICS_CONTAINER_ID + "\"><p>" + lastFetchedLyrics + "</p></div>";
  var LYRICS_DIALOG_HTML = "<paper-dialog onclick=\""+ LYRICS_DIALOG_ID + ".refit()\" id=\"" + LYRICS_DIALOG_ID + "\" horizontal-align=\"right\" vertical-align=\"bottom\" no-cancel-on-outside-click>" + LYRICS_HEADER_HTML + "<paper-dialog-scrollable>" + LYRICS_CONTAINER_HTML + "</paper-dialog-scrollable></paper-dialog>";

  $("#" + LYRICS_DIALOG_CONTAINER_ID).append(LYRICS_DIALOG_HTML);
}

function recoverFromMissingLyricsDialog() {

  configureLyricsHtmlIfNeeded();
  openLyricsDialog();
}

function repositionLyricsDialog() {

  $("#" + LYRICS_DIALOG_ID).click(); // triggers refit() call configured in dialog's HTML
}

// Google Play HTML Configuration Functions

function configureSongsQueueDialogButton() {

  $("#" + SONGS_QUEUE_BUTTON_ID).click(songsQueueButtonPressed);
}

// UI Actions Functions

function lyricsButtonPressed() {

  if (!lyricsDialogExists()) {

    recoverFromMissingLyricsDialog();
  } 
  else if (isOpeningLyricsDialog()) {

    closeSongsQueueDialog();
  }
}

function openLyricsDialog() {

  if (lyricsDialogExists() && !$("#" + LYRICS_DIALOG_ID).is(":visible")) {

    $("#" + LYRICS_BUTTON_ID).click();
  }
}

function closeLyricsDialog() {

  if (lyricsDialogExists() && $("#" + LYRICS_DIALOG_ID).is(":visible")) {

    $("#" + LYRICS_BUTTON_ID).click();
  }
}

function songsQueueButtonPressed() {

  if (isOpeningSongsQueueDialog()) {

    closeLyricsDialog(); // Avoids overlapping dialogs
  }
}

function closeSongsQueueDialog() {

  if ($("#" + SONGS_QUEUE_DIALOG_ID).is(":visible")) {

    $("#" + SONGS_QUEUE_BUTTON_ID).click();
  }
}

// Helper Functions

function lyricsButtonExists() {

  return ($("#" + LYRICS_BUTTON_ID).length > 0);
}

function lyricsDialogExists() {

  return ($("#" + LYRICS_DIALOG_ID).length > 0);
}

function isOpeningLyricsDialog() {

  return !$("#" + LYRICS_DIALOG_ID).is(":visible");
}

function isOpeningSongsQueueDialog() {

  return !$("#" + SONGS_QUEUE_DIALOG_ID).is(":visible");
}

function lyricsAlreadyRetrievedForCurrentSong() {

  return (songName == $("#" + SONG_TITLE_CONTAINER_ID).text());
}

