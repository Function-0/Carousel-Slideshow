/*
 * Student: Ibrahim Jomaa | 300911528
 * Student: Ahud Mohammed | 301029718
 * Date: 4/15/2019
 * 
 * Filename: index_external.js
 */

// Photos' position and motion.
var startPos = "25rem";
var endPos = "-25rem";
var horizontalMotion = "25rem";

var photos;
var jsonFile = 0;

function updateGallery() {
  const URLS = ["json/photos.txt", "json/photosExtra.txt"];
  const LABEL = ["Add Elon Musk to gallery?", "Remove Elon Musk from gallery?"];
  const ELON_MUSK = ["", "...and Elon Musk"];

  $.ajax({
    url: URLS[jsonFile],
    contentType: "application/json",
    dataType: "json",
    crossDomain: true,
    cache: false,
    success: setupGallery
  });

  $("#updateLabel").text(LABEL[jsonFile]);
  $("#hereComesElonMusk").text(ELON_MUSK[jsonFile]);
  
  // Cycle through json files every time update button is clicked.
  jsonFile = ++jsonFile % URLS.length;
}

var isBusy = false;

var currPhoto;
var time;
var autoPhotoTransition;

function setupGallery(jsonData) {
  photos = jsonData;
  var photoArea = $("#photoArea");
  photoArea.empty();

  // First photo.
  currPhoto = document.createElement("img");
  $(currPhoto).attr({
    "src": photos[0]["path"],
    "alt": photos[0]["name"]});
  photoArea.append(currPhoto);

  displayPersonalInfo(currPhoto);
  updatePhotoTransition(photos[0]["time"]);

  // Rest of photos.
  for (var i = 1; i < photos.length; i++) {
    var photo = document.createElement("img");
    $(photo).attr({
      "src": photos[i]["path"], 
      "alt": photos[i]["name"]});
    $(photo).css({display: "none", left: startPos});
    photoArea.append(photo);
  }
}

function displayPersonalInfo(photo) {
  var i = $(photo).index();
  $("#name").text(photos[i]["name"]);
  $("#bio").text(photos[i]["bio"]);
}

var directionTemp = {
  LEFT: 0,
  RIGHT: 1
}
const DIRECTION = Object.freeze(directionTemp);

function photoTransition(photoMain, photoReplacement, direction) {
  var leftModifier = ["-=", "+="];
  var optionsAnimate = {
    left: leftModifier[direction] + horizontalMotion
  }
  var optionsDuration = {
    queue: false,
    duration: 300
  }

  $(photoMain).fadeOut(optionsDuration);
  $(photoMain).animate(optionsAnimate, optionsDuration);

  $(photoReplacement).fadeIn(optionsDuration);
  $(photoReplacement).animate(optionsAnimate, optionsDuration);
}

function updatePhotoTransition(time) {
  window.clearInterval(autoPhotoTransition);
  autoPhotoTransition = window.setInterval(moveRight, time);
}

const DELAY = 350;

function moveRight() {
  if (!isBusy) {
    isBusy = true;
    var isResetRequired = false;
    
    var nextPhoto = $(currPhoto).next();
    if (nextPhoto.length === 0) {
      nextPhoto = $("#photoArea").children().first();
      $(nextPhoto).css({left: startPos});
      isResetRequired = true;
    }

    photoTransition(currPhoto, nextPhoto, DIRECTION.LEFT);
    currPhoto = nextPhoto;
    displayPersonalInfo(currPhoto);

    window.setTimeout(releaseButtons, DELAY, currPhoto, isResetRequired, DIRECTION.LEFT);
  }
}

function moveLeft() {
  if (!isBusy) {
    isBusy = true;
    var isResetRequired = false;

    var prevPhoto = $(currPhoto).prev();
    if (prevPhoto.length === 0) {
      prevPhoto = $("#photoArea").children().last();
      $(prevPhoto).css({left: endPos});
      isResetRequired = true;
    }

    photoTransition(currPhoto, prevPhoto, DIRECTION.RIGHT);
    currPhoto = prevPhoto;
    displayPersonalInfo(currPhoto);

    window.setTimeout(releaseButtons, DELAY, currPhoto, isResetRequired, DIRECTION.RIGHT);
  }
}

function resetRight() {
  var photos = $("#photoArea").children();
  for (var i = 0; i < photos.length - 1; i++) {
    var photo = photos[i];
    $(photos[i]).css({left: endPos});
  }
}

function resetLeft() {
  var photos = $("#photoArea").children();
  for (var i = 1; i < photos.length; i++) {
    var photo = photos[i];
    $(photos[i]).css({left: startPos});
  }
}

function releaseButtons(photoMain, isResetRequired, direction) {
  isBusy = false;
  updatePhotoTransition(photos[$(photoMain).index()]["time"]);

  if (isResetRequired) {
    resetPhotoPosition(direction)
  }
}

function resetPhotoPosition(direction) {
  if (direction === DIRECTION.LEFT) {
    resetLeft();
  } else if (direction === DIRECTION.RIGHT) {
    resetRight();
  }
}

function addEventListeners() {
  var prevButton = $("button")[0];
  $(prevButton).on("click", moveLeft);

  var nextButton = $("button")[1];
  $(nextButton).on("click", moveRight);
  
  var updateButton = $("button")[2];
  $(updateButton).on("click", updateGallery);
}

function setupPage() {
  addEventListeners();
  updateGallery();
}

$(window).on("load", setupPage);