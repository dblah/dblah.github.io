var GridDotGame = function(dimPrefix) {
	var canvas;
	var ctx;
	var dimPrefix = dimPrefix;
	var canvasHeight;
	var canvasWidth;
	var BORDER = 8;
	var DOT_RADIUS = 4;
	var CLICK_LENIENCY = 16;
	var gameState;

	function GameState() {
		this.startTime;
		this.dotX = -100;
		this.dotY = -100;
		var scoreBoard = new ScoreBoard();

		this.startTimer = function() {
			this.startTime = new Date();
		}

		this.incrClickHits = function() {
			scoreBoard.incrClickHits();
		}

		this.placeDot = function() {
			var xPick = randomIntFromInterval(1, 10);
			var yPick = randomIntFromInterval(1, 10);
			this.dotX = DOT_RADIUS + (xPick * 58);
			this.dotY = DOT_RADIUS + (yPick * 58);
			console.log(xPick + ' ' + yPick);

		}
		this.drawScoreBoard = function() {
			scoreBoard.draw();
		}
	}

	this.run = function() {
		setup();
		draw();
		startPlay();
	}

	var setup = function() {
		gameState = new GameState();
		setupCanvas();
		setupListeners();
		setInterval(gameState.drawScoreBoard, 200);
		gameState.placeDot();
	}

	function startPlay() {
		gameState.startTimer();
	}

	var setupCanvas = function() {
		canvas = document.getElementById(dimPrefix + '.Canvas');
		if (!canvas || !canvas.getContext) {
			alert('Unable to find canvas element: ' + dimPrefix + '.Canvas');
			return;
		}

		ctx = canvas.getContext('2d');
		if (!ctx || !ctx.drawImage) {
			alert('Canvas not supported.');
			return;
		}
		canvasHeight = document.getElementById(dimPrefix + '.Canvas').height;
		canvasWidth = document.getElementById(dimPrefix + '.Canvas').width;

	}

	function getXOffset() {
		return canvas.getBoundingClientRect().left;
	}

	function getYOffset() {
		return canvas.getBoundingClientRect().top;
	}

	function setupListeners() {
		canvas.addEventListener("click", onClick, false);
	}

	function onClick(e) {
		var xPos = parseInt(e.clientX - getXOffset());
		var yPos = parseInt(e.clientY - getYOffset());

		var res = checkIfClickAHit(xPos, yPos);
		if (res) {
			gameState.incrClickHits();
			gameState.placeDot();
			draw();
		}
		console.log(' ' + res);

	}

	function checkIfClickAHit(xPos, yPos) {
		console.log("Click " + xPos + " " + yPos);
		var minX = gameState.dotX - CLICK_LENIENCY;
		var minY = gameState.dotY - CLICK_LENIENCY;
		var maxX = gameState.dotX + CLICK_LENIENCY;
		var maxY = gameState.dotY + CLICK_LENIENCY;
		if (xPos >= minX && xPos <= maxX) {
			if (yPos >= minY && yPos <= maxY) {
				return true;
			}
		}
		return false;
	}

	var draw = function() {
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		drawGrid();
		drawDot(gameState.dotX, gameState.dotY, DOT_RADIUS);
		gameState.drawScoreBoard();

	}

	function randomIntFromInterval(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}

	function drawGrid() {
		var spacing = 8;
		var length = 50;
		var yPos = spacing;
		for (var i = 0; i < 11; i++) {
			var xPos = spacing;
			for (var j = 0; j < 11; j++) {
				;
				drawSquare(xPos, yPos, length);
				xPos += (spacing + length);
			}
			yPos += (spacing + length);
		}

	}

	function drawSquare(x, y, length) {
		ctx.fillStyle = "black";
		ctx.fillRect(x, y, length, length);
		ctx.fill();
	}

	function drawDot(x, y, radius) {
		var diameter = radius * 2;
		var gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
		gradient.addColorStop(1, 'rgba(255,255,255,.0)');
		gradient.addColorStop(.9, 'rgba(205,205,205,.8)');
		// gradient.addColorStop(.3, 'rgba(205,0,205,.6)');
		gradient.addColorStop(.1, "rgba(205,205,205,1)");

		ctx.fillStyle = gradient;
		ctx.fillRect(x - radius, y - radius, diameter, diameter);
	}

	function ScoreBoard() {
		var currtimePast = 0;
		var hits = 0;

		this.draw = function() {
			ctx.clearRect(0, 650, canvasWidth, canvasHeight-650);
			currtimePast = getTimerSeconds();
			drawTimer();
			drawHits();
			drawHitsPerMinute();
			drawTitleArea();

		}

		this.incrClickHits = function() {
			hits++;
		}
		function drawTimer() {
			ctx.font = "20px Verdana";
			ctx.fillStyle = "blue";
			var mess = getTimerSeconds() + "s";
			ctx.textAlign = "end";
			ctx.fillText(mess, 577, 675);
			ctx.textAlign = "start";
			ctx.fillText("Time: ", 400, 675);
		}

		function drawHitsPerMinute() {
			ctx.font = "20px Verdana";
			ctx.fillStyle = "blue";
			var mess = calculateHitsPerMinute();
			ctx.textAlign = "start";
			ctx.fillText("Hits Per Minute:", 400, 700);
			ctx.textAlign = "end";
			ctx.fillText(mess, 570, 700);
		}

		function drawHits() {
			ctx.font = "20px Verdana";
			ctx.fillStyle = "blue";
			var mess = hits;
			ctx.textAlign = "end";
			ctx.fillText(mess, 570, 725);
			ctx.textAlign = "start";
			ctx.fillText("Hits: ", 400, 725);
		}
		
		
		function drawTitleArea() {
			ctx.font = "40px Arial";
			ctx.fillStyle = "blue";
			var mess = hits;
			ctx.textAlign = "start";
			ctx.fillText("Click The Dot!", 50, 700);
			ctx.font = "20px Arial";
			ctx.fillStyle = "blue";
			ctx.textAlign = "start";
			ctx.fillText("  (Yes, there really is a dot.) ", 50, 720);
		}
		
		function calculateHitsPerMinute() {
			if (currtimePast == 0) {
				return 0;
			}
			return Math.round(hits / (currtimePast/60.0));
		}

		function getTimerSeconds() {
			if (gameState.startTime == null) {
				gameState.startTimer();
			}
			return Math.floor((new Date().getTime() - gameState.startTime.getTime()) / 1000.0);
		}

	}

}