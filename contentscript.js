/*****************************************************************************
*	Chromium Extension to Display Lyrics for Current Song in Google Music 
*	from lyricwiki.org
*
*   Copyright (C) 2011  Oscar Figuerola
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
var albumName;
var timer;

/**
// Initialization point
$(document).ready(function (){
   
});
**/

// Add lyrics content area and start checking for sonf names
$("#nav").append("<div class=\"nav-section-header\">LYRICS</div>");
$("#nav").append("<div class=\"gm-lyrics\" id=\"gm-lyrics\">No song being played<br /><br /><br /></div>");
getLyrics();

function getLyrics(){  
   var	currentLyrics = "";
   var  thereIsError = 0;
   
   if (document.getElementById("gm-lyrics")) {
	    currentLyrics = document.getElementById("gm-lyrics").innerHTML;
		
		if (currentLyrics.search(/network error/i) >= 0)
		{		
			thereIsError = 1;
		}
   } 
   
   if (songName == $("#playerSongTitle .fade-out-content").text() && !thereIsError) {

	 	// Keep timer on, but don't request again
		timer = setTimeout("getLyrics()", 1000);
		
		return;
   }

   songName   = $("#playerSongTitle .fade-out-content").text();
   artistName = $("#playerArtist .fade-out-content").text();
   albumName  = "";
   
   if(songName == null) {
      event.preventDefault();
   }
   else {
	  chrome.extension.sendRequest({song: songName,artist: artistName, album: albumName}, function(response) {  
		  var lyricsElement; 
			
		  if (document.getElementById("gm-lyrics")) { 
			 lyricsElement = document.getElementById("gm-lyrics"); 
			 lyricsElement.innerHTML = response.lyrics + "<br /><br /><br /><br />";
		  }
		  else {
			 $("#nav").append("<div class=\"nav-section-header\">LYRICS</div>");
			 $("#nav").append("<div class=\"gm-lyrics\" id=\"gm-lyrics\">" + response.lyrics + "<br /><br /><br /></div>");		
		  }
		  
		  $(".gm-lyrics .rtMatcher").remove();     
	   });
   }
   
   // Keep timer on
   timer = setTimeout("getLyrics()", 1000);
}
