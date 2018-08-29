var socket = io();
var instructionPlayer = document.getElementsByClassName("instructions")[0];
var gamePlayer = document.getElementsByClassName("game")[0];

socket.on("changepic", function () {
	$(".welcomescreen").hide();
	$(".awaiting-screen").show();
});

window.addEventListener("keydown", function (e) {
	if (e.key == " ") {
		e.preventDefault();
		socket.emit("space", socket.id);
		console.log("message sent");
		console.log(socket.id);
	}
});

// window.addEventListener("contextmenu", function (e) {
// 	e.preventDefault();
// });

socket.on("changescreen", function () {
	$(".welcome-screen").hide();
	$(".awaiting-screen").show();
});

socket.on("playintro", function () {
	$(".awaiting-screen").hide();
	$(".instructions").show();
	instructionPlayer.play();
	if (!instructionPlayer.paused) {
		socket.emit("instructionsplaying", socket.id);
	}
});

socket.on("playgame", function () {
	// TODO: Unload the intro video from memory here.
	$(".instructions").hide();
	$(".game").show();
	gamePlayer.play();
	if (!gamePlayer.paused) {
		socket.emit("gameplaying", socket.id);
	}
});

instructionPlayer.addEventListener("ended", function (e) {
	socket.emit("instructionsover", socket.id);
});

socket.on("muteaudio", function () {
	gamePlayer.muted = true;
	$(".bigblackbox").hide();
});

socket.on("mutevideo", function () {
	$(".bigblackbox").show();
	gamePlayer.muted = false;
});

gamePlayer.addEventListener("ended", function (e) {
	socket.emit("gameover", socket.id);
});

socket.on("hardreset", function () {
	setTimeout(function () {
		location.reload(true);
	}, 2000);
});
