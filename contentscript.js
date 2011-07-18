/*****************************************************************************
*	Chromium Extension to Display Lyrics for Current Song in Google Music 
*	Beta from lyricwiki.org
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

$(document).ready(function (){
   // Modify player layout to add button  
   var allHTMLTags = document.getElementsByTagName("*");
   var playerNode;
   var bgImageURL = chrome.extension.getURL("images/googlemusic-lyrics.png");
   
   for (var i = 0; i < allHTMLTags.length; i++) {   
       if (allHTMLTags[i].className == "player-left") {
           playerNode = allHTMLTags[i];
	       playerNode.style.width = "490px";
		   playerNode.id = "player-left";
	   
	       //add Image Button in player left
	       $("#player-left").append("<div id=\"googlemusic_lyrics_nav\" style=\"background-image:url(" + bgImageURL + ");\"></div>");
		   $("#googlemusic_lyrics_nav").click(getLyrics);
		   
		   break;
       }   
	}
});

function getLyrics(){   

   songName   = $("#playerSongTitle .fade-out-content").text();
   artistName = $("#playerArtist .fade-out-content").text();
   albumName  = "";
   
   if(songName==null){
      alert("Please Play a Song ");
      event.preventDefault();
   }
   else{
   chrome.extension.sendRequest({song: songName,artist: artistName, album: albumName}, function(response) {  
	  var lyricsElement;
   
      if (document.getElementById("gm-lyrics")) { 
	     lyricsElement = document.getElementById("gm-lyrics"); 
		 lyricsElement.innerHTML = response.lyrics;
	  }
	  else {
		 $("#nav").append("<div class=\"nav-section-header\">LYRICS</div>");
		 $("#nav").append("<div class=\"gm-lyrics\" id=\"gm-lyrics\">" + response.lyrics + "</div>");		
	  }
	  
	  $(".gm-lyrics .rtMatcher").remove();     
	  
      //console.log(response.lyrics);
      //console.log(response.youtubeElement);
   });
   
   }
}




