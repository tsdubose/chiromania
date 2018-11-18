var app = require('express')();
var express = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);

// TODO: Need to look for places to resync.
var state = {};
state.twoConnected = false;
state.twoReady = false;
state.introPlaying = false;
state.gamePlaying = false;
state.hasVideo = null;
state.hasAudio = null;
state.gameOver = false;
var players = [];
var currentAudio = null;
var currentVideo = null;


io.on('connection', function(socket){
	console.log(socket.id + ' connected');

	socket.on("space", function (playerID) {
		if (!state.twoReady) {
			if (!players.includes(playerID) && playerID != null) {
				players.push(playerID);
				state[playerID] = {
					ready: true,
					finishedIntro: false,
					playingIntro: false,
					gamePlaying: false,
					gameOver: false
				};
				console.log(playerID + " is ready.");
				io.to(playerID).emit("changescreen");
				if (players.length == 2 && (state[players[0]].ready == true && state[players[1]].ready == true)) {
					state.twoReady = true;
					console.log("Two clients are ready. Starting intro video.");
					state.hasAudio = players[0];
					state.hasVideo = players[1];
					console.log("Starting roles assigned. " + players[0] + " has audio and " + players[1] + " has video.");
					io.of('/').emit("playintro");
				}

			}
		}
		else if (state.gamePlaying) {
			theSwitch();
		}
	});

	socket.on("instructionsplaying", function (playerID) {
		state[playerID].playingIntro = true;
		if (state[players[0]].playingIntro && state[players[1]].playingIntro) {
			state.introPlaying = true;
			console.log("Both players are confirmed to be playing intro.");
		}
	});

	socket.on("instructionsover", function (playerID) {
		state[playerID].finishedIntro = true;
		console.log(playerID + " has finished the intro.");
		if (state[players[0]].finishedIntro && state[players[1]].finishedIntro) {
			console.log("Both players have finished the intro video, starting the game.");
			//Tell them to prepare to mute audio and video.
			io.to(state.hasAudio).emit("mutevideo");
			io.to(state.hasVideo).emit("muteaudio");
			io.of('/').emit("playgame");
		}
	});
	socket.on("gameplaying", function (playerID) {
		state[playerID].gamePlaying = true;
		if (state[players[0]].gamePlaying && state[players[1]].gamePlaying) {
			console.log("Both players have confirmed game video is playing.");
			state.gamePlaying = true;
		}
	});

	socket.on("gameover", function (playerID) {
		state[playerID].gameOver = true;
		console.log(playerID + " has ended the game.");
		if (state[players[0]].gameOver && state[players[1]].gameOver) {
			state.gameOver = true;
			console.log("Both players have finished, resetting server.");
			io.of("/").emit("hardreset");
			setTimeout(function () {
				process.exit();
			}, 200);
		}
	});
});

app.get('/', function(req, res){
	res.sendFile(__dirname + '/client/chirointerface.html');
});
app.use(express.static('client'))
http.listen(3000, function(){
	console.log('Server up, listening on *:3000');
});

function theSwitch() {
	currentAudio = state.hasAudio;
	currentVideo = state.hasVideo;

	io.to(state.hasAudio).emit("muteaudio");
	io.to(state.hasVideo).emit("mutevideo");

	state.hasAudio = currentVideo;
	state.hasVideo = currentAudio;

	console.log("Switch performed: " + state.hasAudio + " has audio and " + state.hasVideo + " has video.");
}
