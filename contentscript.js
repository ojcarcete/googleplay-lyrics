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

var LYRICS_TOOLTIP_ANCHOR_ID = "lyrics-tooltip";
var LYRICS_TOOLTIP_ID = "darktooltip-" + LYRICS_TOOLTIP_ANCHOR_ID;

var LYRICS_DIALOG_CONTAINER_ID = "mainContainer";
var LYRICS_DIALOG_ID = "scrolling";
var LYRICS_HEADER_CLASS = "lyrics-header";
var LYRICS_CONTAINER_ID = "lyrics";

// Other variables
var tutorialShown = false;
var songName = null;
var artistName = null;
var lyricsContainerOffset = 0;
var lastFetchedLyrics = "No lyrics to show yet";

// Start fetching

$(document).ready(function() {

  getTutorialShownSetting(function() {

    configureLyricsHtmlIfNeeded();
    configureSongsQueueDialogButton();
    startFetchingLyrics();
  });
});

// User Settings

function getTutorialShownSetting(callback) {

  chrome.storage.sync.get({
    tutorialShown: false
  }, 
  function(e) {

    tutorialShown = e.tutorialShown;
    callback();
  });
}

function setTutorialShownSetting() {

  tutorialShown = true;

  chrome.storage.sync.set({
    tutorialShown: true
  }, 
  function() {});
}

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
        lastFetchedLyrics = response.lyrics + "<br/><br/><br/>";

        lyricsContainer.html(lastFetchedLyrics);
        lyricsContainer.children(".rtMatcher").remove();

        repositionLyricsDialog();

        showLyricsButtonTooltipIfNeeded();
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

  var LYRICS_BUTTON_HTML = "<span id=\"" + LYRICS_TOOLTIP_ANCHOR_ID + "\"><paper-icon-button id=\"" + LYRICS_BUTTON_ID + "\" icon=\"" + LYRICS_BUTTON_ICON + "\" onclick=\"" + LYRICS_DIALOG_ID + ".toggle()\"></paper-icon-button></span>";

  $("#" + PLAYLISTS_DRAWER_BUTTON_ID).before(LYRICS_BUTTON_HTML);

  $("#" + LYRICS_BUTTON_ID).click(lyricsButtonPressed);
}

function addLyricsContainerIfNeeded() {

  if (lyricsDialogExists()) {

    return;
  }

  var LYRICS_HEADER_HTML = "<h2 id=\"" + SECTION_HEADER_ID + "\" class=\"" + LYRICS_HEADER_CLASS + "\">Lyrics</h2>";
  var LYRICS_CONTAINER_HTML = "<div id=\"" + LYRICS_CONTAINER_ID + "\"><p>" + lastFetchedLyrics + "</p></div>";
  var LYRICS_DIALOG_HTML = "<paper-dialog id=\"" + LYRICS_DIALOG_ID + "\" horizontal-align=\"right\" vertical-align=\"bottom\" no-cancel-on-outside-click>" + LYRICS_HEADER_HTML + "<paper-dialog-scrollable>" + LYRICS_CONTAINER_HTML + "</paper-dialog-scrollable></paper-dialog>";

  $("#" + LYRICS_DIALOG_CONTAINER_ID).append(LYRICS_DIALOG_HTML);
  $("#" + LYRICS_DIALOG_ID).click(repositionLyricsDialog);

  configureTextColor();
}

function showLyricsButtonTooltipIfNeeded() {

  if (tutorialShown) {

    return;
  }

  $("#" + LYRICS_TOOLTIP_ANCHOR_ID).darkTooltip({
    trigger: "click",
    gravity: "north",
    content: "Click here to show the lyrics!",
    modal: true
  });

  $("#" + LYRICS_TOOLTIP_ANCHOR_ID).click();

  setTutorialShownSetting();
}

function removeLyricsButtonTooltip() {

  $("#" + LYRICS_TOOLTIP_ID).remove();
}

function recoverFromMissingLyricsDialog() {

  configureLyricsHtmlIfNeeded();
  openLyricsDialog();
}

function repositionLyricsDialog() {

  window.dispatchEvent(new Event("resize")); // forces lyrics container paper-dialog to resize
}

// Google Play HTML Configuration Functions

function configureSongsQueueDialogButton() {

  $("#" + SONGS_QUEUE_BUTTON_ID).click(songsQueueButtonPressed);
}

// UI Actions Functions

function lyricsButtonPressed() {

  if (!lyricsDialogExists()) {

    recoverFromMissingLyricsDialog();
  } else if (isOpeningLyricsDialog()) {

    closeSongsQueueDialog();

    removeLyricsButtonTooltip();
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

// Automatic Text Color Functions

var PRIMARY_TEXT_COLOR = "rgb(0, 0, 0)";
var SECONDARY_TEXT_COLOR = "rgb(255, 255, 255)";

var COLOR_DIFFERENCE_THRESHOLD = 500;
var BRIGHTNESS_DIFFERENCE_THRESHOLD = 125;

function configureTextColor() {

  var bestTextColor = getBestTextColor();
  $("#" + LYRICS_DIALOG_CONTAINER_ID + " p").css("color", bestTextColor);
  $("#" + LYRICS_DIALOG_CONTAINER_ID + " div").css("color", bestTextColor);
}

function getBestTextColor() {

  var backgroundCssColor = $("#" + LYRICS_DIALOG_ID).css("background-color");

  var primaryColorWcag1 = calculateWcag1(backgroundCssColor, PRIMARY_TEXT_COLOR);
  var secondaryWcag1 = calculateWcag1(backgroundCssColor, SECONDARY_TEXT_COLOR);

  if (primaryColorWcag1 >= secondaryWcag1) {

    return PRIMARY_TEXT_COLOR;
  } else {

    return SECONDARY_TEXT_COLOR;
  }
}

function calculateWcag1(backgroundCssColor, textCssColor) {

  var backgroundColorRgb = getColorComponentsFromCssColor(backgroundCssColor);
  var textColorRgb = getColorComponentsFromCssColor(textCssColor);

  var brightnessDifference = calculateBrightnessDifference(backgroundColorRgb, textColorRgb);
  var colorDifference = calculateColorDifference(backgroundColorRgb, textColorRgb);

  return (colorDifference + brightnessDifference);
}

function getColorComponentsFromCssColor(cssColor) {

  cssColor = cssColor.replace("rgb", "");
  cssColor = cssColor.replace("(", "");
  cssColor = cssColor.replace(")", "");
  cssColor = cssColor.replace(/ /g, "");

  var colorComponents = cssColor.split(",");

  return {
    "r": colorComponents[0],
    "g": colorComponents[1],
    "b": colorComponents[2]
  };
}

function calculateBrightnessDifference(firstColorRgb, secondColorRgb) {

  var firstColorBrightness = calculateBrightness(firstColorRgb);
  var secondColorBrightness = calculateBrightness(secondColorRgb);
  var brightnessDifference = Math.abs(Math.floor(secondColorBrightness - firstColorBrightness));

  return brightnessDifference;
}

function calculateBrightness(colorRgb) {

  var brightness = ((colorRgb["r"] * 299) + (colorRgb["g"] * 587) + (colorRgb["b"] * 114)) / 1000;

  return brightness;
}

function calculateColorDifference(firstColorRgb, secondColorRgb) {

  var colorDifference = (Math.max(firstColorRgb["r"], secondColorRgb["r"]) - Math.min(firstColorRgb["r"], secondColorRgb["r"])) +
    (Math.max(firstColorRgb["g"], secondColorRgb["g"]) - Math.min(firstColorRgb["g"], secondColorRgb["g"])) +
    (Math.max(firstColorRgb["b"], secondColorRgb["b"]) - Math.min(firstColorRgb["b"], secondColorRgb["b"]));
  colorDifference = Math.floor(colorDifference);

  return colorDifference;
}