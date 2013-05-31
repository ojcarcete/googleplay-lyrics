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

var songName;
var artistName;

setInterval(getLyrics, 1500);

// Add lyrics content area and start checking for song names
$("#playlists").after("<div id=\"lyrics\" class=\"nav-section-header\">LYRICS</div>");
$("#lyrics").after("<div class=\"gm-lyrics\" id=\"gm-lyrics\">No song being played<br /><br /><br /></div>");

function getLyrics() {  
   var	currentLyrics = "";
   var  thereIsError = 0;
   
   if(document.getElementById("gm-lyrics")) {
	    currentLyrics = document.getElementById("gm-lyrics").innerHTML;
		
		if(currentLyrics.search(/network error/i) >= 0)
		{		
			thereIsError = 1;
		}
   } 
   
   // Lyrics already retrieved
   if(songName == $("#playerSongTitle .fade-out-content").text() && !thereIsError) {
		return;
   }
   
   // Send new request to get the lyrics url
   songName   = $("#playerSongTitle .fade-out-content").text();
   artistName = $("#player-artist").text();

   if(songName != null && songName != "") {

		chrome.extension.sendRequest({song: songName, artist: artistName}, function(response) {  
		  	
		  	// Insert lyrics in page
		  	console.log("Lyrics received");
		  	var lyricsElement; 
			
			if (document.getElementById("gm-lyrics")) { 
				lyricsElement = document.getElementById("gm-lyrics"); 
				lyricsElement.innerHTML = response.lyrics + "<br /><br /><br /><br />";
			}
			else {
				$("#playlists").after("<div class=\"nav-section-header\">LYRICS</div>");
				$("#playlists").after("<div class=\"gm-lyrics\" id=\"gm-lyrics\">" + response.lyrics + "<br /><br /><br /></div>");		
			}

			$(".gm-lyrics .rtMatcher").remove();    
	   	});

   		return;
   }
}
