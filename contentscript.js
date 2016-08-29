/*****************************************************************************
*	Chromium Extension to Display Lyrics for Current Song in Google Play (TM)
*	from lyricwiki.org
*
*   Copyright (C) 2013  Oscar Figuerola
*
*	Authors: Oscar Figuerola Salas <oscar.figuerola.salas@gmail.com>
*			 sethu
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
var SECTION_DIVIDER_CLASS = "nav-section-divider";
var PLAYLISTS_CONTAINER_ID = "playlists-container";
var PLAYLISTS_PANEL_ID = "playlist-drawer-button";
var SONG_TITLE_CONTAINER_ID = "currently-playing-title";
var ARTIST_CONTAINER_ID = "player-artist";

// Custom html
var LYRICS_HEADER_CLASS = "lyrics";
var LYRICS_CONTAINER_ID = "gm-lyrics";
var LYRICS_CONTAINER_CLASS = "gm-lyrics";

var songName = null;
var artistName = null;
var firstLyricsLoaded = false;
var lyricsContainerOffset = 0;

setInterval(getLyrics, 1500);

addLyricsContainer();

function getLyrics() {

   var	currentLyrics = "";
   var  thereIsError = 0;

   if(document.getElementById(LYRICS_CONTAINER_CLASS)) {

	    currentLyrics = document.getElementById(LYRICS_CONTAINER_CLASS).innerHTML;

		if(currentLyrics.search(/network error/i) >= 0) {

			thereIsError = 1;
		}
   }

   // Lyrics already retrieved
   if(lyricsAlreadyRetrieved()) {

		return;
   }

   // Send new request to get the lyrics url
   songName   = $("#" + SONG_TITLE_CONTAINER_ID).text();
   artistName = $("#" + ARTIST_CONTAINER_ID).text();

   if(songName != null && songName != "") {

		chrome.extension.sendRequest({song: songName, artist: artistName}, function(response) {

      console.log("Lyrics received");

		  // Insert lyrics in page
			if(!document.getElementById(LYRICS_CONTAINER_ID)) {

        // Make sure lyrics container exists
        addLyricsContainer();
			}

      var lyricsElement = document.getElementById(LYRICS_CONTAINER_ID);
      lyricsElement.innerHTML = response.lyrics + "<br /><br /><br /><br />";

			$("." + LYRICS_CONTAINER_ID + " .rtMatcher").remove();

            // Open playlists panel when the first lyrics are loaded
            if(!firstLyricsLoaded) {

                // firstLyricsLoaded = true; // TODO: find a better way to keep lyrics visible

                $("#" + PLAYLISTS_PANEL_ID).click();

                if(lyricsContainerOffset <= 0) {
                  lyricsContainerOffset = $(".lyrics").first().position().top;
                }

                $("#playlist-drawer #mainContainer").animate({
                    scrollTop: lyricsContainerOffset
                }, 1500);
            }
	   	});

   		return;
   }
}

function addLyricsContainer() {

    // Add lyrics content area and start checking for song names
    $("#" + PLAYLISTS_CONTAINER_ID).after("<div class=\"" + SECTION_DIVIDER_CLASS + "\"></div><div id=\"" + SECTION_HEADER_ID + "\" class=\"" + LYRICS_HEADER_CLASS + "\">Lyrics</div>");
    $("." + LYRICS_HEADER_CLASS).after("<div class=\"" + LYRICS_CONTAINER_CLASS + "\" id=\"" + LYRICS_CONTAINER_ID + "\">No song being played<br /><br /><br /></div>");
}

function lyricsAlreadyRetrieved() {

  return (songName == $("#" + SONG_TITLE_CONTAINER_ID).text() && !thereIsError);
}
