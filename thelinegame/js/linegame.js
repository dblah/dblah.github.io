/*
 * 
 * The Line Game
 * 
 * 2016
 * 
 * v1.0
 * 
 */

var TheLineGame = function(dimPrefixIn) {

	var canvasHeight;
	var canvasWidth;
	var LINE_HEIGHT = 80;
	var LINE_WIDTH = 20;
	var LINE_SPACING = 20;
	var LINE_HIEGHT_AND_SPACE = 100;
	var dimPrefix = dimPrefixIn;
	var settingsJSON;
	var settingsManager;

	var gameState;
	var lineGameConsole;
	var collisionDetector;

	var canvas;
	var ctx;

	function GameState(player1, player2) {
		this.whoseTurn = 1;
		this.markingLines = [];
		this.currMarkingLine = 0;
		this.lines = [];
		this.gameOver = false;
		this.winningPlayer;
		this.player1 = player1;
		this.player2 = player2;
		this.currentMove = null;

		this.changeTurn = function() {
			if (this.whoseTurn == 1) {
				this.whoseTurn = 2;
			} else {
				this.whoseTurn = 1;
			}
		}

		this.setWhoseTurn = function(who) {
			this.whoseTurn = who;
		}

		this.getColorForCurrentTurn = function() {
			return this.getPlayerForCurrentTurn().color;
		}

		this.getPlayerNumForCurrentTurn = function() {
			if (this.whoseTurn == 1) {
				return player1.num;
			} else {
				return player2.num;
			}
		}
		this.getPlayerForCurrentTurn = function() {
			if (this.whoseTurn == 1) {
				return player1;
			} else {
				return player2;
			}
		}

		this.getOtherPlayer = function(playerNum) {
			if (playerNum == 1) {
				return this.player2;
			}
			return this.player1;
		}

		this.getAIWhoseTurn = function() {
			// returns AI level if computer turn, otherwise returns null;
			var p = this.getPlayerForCurrentTurn();
			return p.ai;
		}

		this.determineWinningPlayer = function() {
			this.winningPlayer = this.getOtherPlayer(gameState.markingLines[gameState.markingLines.length - 1].playerNum).name;
		}

		this.getOrBuildCurrentMove = function() {
			if (this.currentMove != null) {
				return this.currentMove;
			}
			setCurrentMove(new Move(-1, -1, -1, -1));
			return this.currentMove;
		}
		this.setCurrentMove = function(move) {
			this.currentMove = move;
		}
		this.log = function() {
			console.log(this.lines);
		}
	}

	function Player(num, name, playerColor, ai) {
		this.num = num;
		this.name = name;
		this.ai = ai;// null if human
		this.color = playerColor;

	}

	function LineFactory() {
		var lineNum = 0;// This just assists with identifying/research purposes.

		this.createNewLine = function(grp, x, y) {
			// console.log('Line ' + x + ' ' + y);
			return new Line(lineNum++, grp, x, y);
		}
	}

	function Line(lineNum, grp, x, y) {
		this.lineNum = lineNum;
		this.grp = grp;
		this.syntheticGrp;
		this.x = x;
		this.y = y;
		this.crossedOut = false;
		this.beingCrossedOut = false;

		this.draw = function(ctx) {
			ctx.restore();
			ctx.beginPath();
			ctx.shadowOffsetX = 3;
			ctx.shadowOffsetY = 3;
			ctx.shadowBlur = 10;
			ctx.shadowColor = "black";
			ctx.fillStyle = '#FF5422';
			if (this.beingCrossedOut) {
				ctx.fillStyle = "DimGray";
			}
			if (this.crossedOut) {
				ctx.fillStyle = 'gray';
			}

			ctx.fillRect(this.x, this.y, LINE_WIDTH, LINE_HEIGHT);
			ctx.stroke();

		};
	}

	function MarkingLine(color, playerNum) {
		this.startX = -1;
		this.startY;
		this.endX;
		this.endY;
		this.color = color;
		this.playerNum = playerNum;
		this.draw = function(ctx) {
			if (this.startX < 0) {
				return;
			}
			ctx.restore();
			ctx.beginPath();
			ctx.strokeStyle = color;// #D03300
			ctx.lineWidth = 3;
			ctx.shadowOffsetX = 0; // set x offset for my shadow
			ctx.shadowOffsetY = 0; // set y offset for my shadow
			ctx.moveTo(this.startX, this.startY);
			ctx.lineTo(this.endX, this.endY);
			ctx.stroke();

		};

		this.getSlope = function() {
			var sPoint = this.getStartPoint();
			var ePoint = this.getEndPoint();
			var denom = (ePoint.x - sPoint.x);
			if (denom == 0) {
				return 0;
			}
			return (ePoint.y - sPoint.y) / denom;

		};
		this.getStartPoint = function() {
			return new Point(this.startX, this.startY);
		}

		this.getEndPoint = function() {
			return new Point(this.endX, this.endY);
		}

		this.log = function() {
			console.log('markingLine= ' + this.startX + ' ' + this.startY + ' ' + this.endX + ' ' + this.endY + ' ' + this.getSlope());
			return;
		};
	}

	function SimpleAIPatternBuilder() {
		this.patterns = {};
		this.patterns['1'] = {
			level : 1,
			type : 'onescenario'
		};
		this.patterns['1,1,1'] = {
			level : 1,
			type : 'ext'
		};
		this.patterns['1,1,1,1,1'] = {
			level : 1,
			type : 'ext'
		};
		this.patterns['2,2'] = {
			level : 2,
			type : 'pair'
		};
		this.patterns['1,1,1,1,1,1,1'] = {
			level : 2,
			type : 'ext'
		};
		this.patterns['1,1,1,1,1,1,1,1,1'] = {
			level : 2,
			type : 'ext'
		};
		this.patterns['3,3'] = {
			level : 3,
			type : 'pair'
		};
		this.patterns['3,2,1'] = {
			level : 3,
			type : 'base'
		};
		this.patterns['4,4'] = {
			level : 3,
			type : 'pair'
		};
		this.patterns['2,2,1,1'] = {
			level : 3,
			type : 'add'
		};
		// Don't need patterns for 4 and higher, advance AI calculates those
		this.getPatternsForAILevel = function(level) {
			var thesePatterns = {};
			for ( var pattern in this.patterns) {
				if (this.patterns[pattern].level <= level) {
					thesePatterns[pattern.split(',')] = '1';
				}
			}
			console.log(thesePatterns);
			return thesePatterns;
		}

	}

	function AIEngine(scenarioCheckerEngine) {
		var foundPatterns = [];
		var foundMoves = [];

		var scenarioCheckerEngine = scenarioCheckerEngine;
		function LocatedPattern() {
			this.startLine;
			this.endLine;
			this.pattern;
		}

		this.performNextMove = function() {
			foundPatterns = [];
			foundMoves = [];

			var move;
			if (this.checkIfOpponentHasWinningPattern()) {
				console.log('OpponentHasAWinningPattern');
			} else {
				move = this.findGoodMove();
			}
			if (move == null) {
				move = determineRandomMove();
			}

			performMove(move);

		}

		this.findGoodMove = function() {
			var move;
			var pos = 0;
			while (pos < gameState.lines.length) {
				this.searchNextMove(pos++);
			}
			if (foundPatterns.length > 0) {
				console.log('Found Good Move:');
				console.log(foundPatterns);
				var locPattern = this.selectGoodMove();
				move = transformLocatedPatternIntoMove(locPattern);

			}
			resetBeingCrossedOut();
			return move;
		}

		this.checkIfOpponentHasWinningPattern = function() {
			return isPatternWinning(identifyPattern());
		}

		function isPatternWinning(pattern) {
			return scenarioCheckerEngine.isTrapScenario(pattern.split(','));
		}

		function determineRandomMove() {
			console.log('determineRandomMove');
			var numOfNotCrossedLines = getNotCrossedOffLines();
			var pickThisLine = randomIntFromInterval(0, numOfNotCrossedLines.length - 1);
			var crossOffLine = gameState.lines[numOfNotCrossedLines[pickThisLine]];
			console.log(crossOffLine);
			var locaPattern = new LocatedPattern();
			locaPattern.startLine = crossOffLine;
			locaPattern.endLine = crossOffLine;
			var syntheticGrp = crossOffLine.syntheticGrp;
			var startLineNum = crossOffLine.lineNum;
			console.log('Mark off starting at Num: ' + startLineNum);
			var nextLinePos = startLineNum + 1;
			while (true) {
				var crossAble = isLineCanBeCrossedOut(nextLinePos, syntheticGrp);
				if (!crossAble) {
					break;
				}
				if (!rollPercentChance(75)) {
					break;
				}
				locaPattern.endLine = gameState.lines[nextLinePos];
				nextLinePos++;
			}
			var m = transformLocatedPatternIntoMove(locaPattern);
			return m;
		}

		function transformLocatedPatternIntoMove(locatedPattern) {
			var x1 = locatedPattern.startLine.x - getXDrawPointVariant();
			var y1 = locatedPattern.startLine.y + getYDrawPointVariant();
			var x2 = locatedPattern.endLine.x + LINE_WIDTH + getXDrawPointVariant();
			var y2 = locatedPattern.endLine.y + getYDrawPointVariant();
			var m = new Move(x1, y1, x2, y2);
			return m;
		}

		function getXDrawPointVariant() {
			return randomIntFromInterval(5, 15);
		}

		function getYDrawPointVariant() {
			return randomIntFromInterval(10, LINE_HEIGHT - 10);
		}

		this.selectGoodMove = function() {
			var numGoodmovesAvail = foundPatterns.length;
			var whichOne = randomIntFromInterval(0, numGoodmovesAvail - 1);
			return foundPatterns[whichOne];
		}

		this.searchNextMove = function(pos) {
			resetBeingCrossedOut();
			if (!isLineCanBeCrossedOut(pos, -1)) {
				return;
			}
			var stretchPos = pos;
			var workingOnGroup = -1;

			while (true) {
				processLinesIntoGroups(true);
				printLineInfo();

				if (!isLineCanBeCrossedOut(stretchPos, workingOnGroup)) {
					console.log('LineCantBeCrossedOut ' + stretchPos);
					break;
				}
				console.log('LineCantBeCrossedOuta ' + stretchPos);
				gameState.lines[stretchPos].beingCrossedOut = true;
				workingOnGroup = gameState.lines[stretchPos].syntheticGrp;

				// pos=4 stretchPos=6
				var currPattern = identifyPattern();
				// this.foundMoves.push([pos,stretchPos]);//any found move
				var winningScenario = isPatternWinning(currPattern);
				console.log('Move Results: pos=' + pos + ' stretchPos=' + stretchPos + ' Pattern ' + currPattern + ' winningScenario=' + winningScenario);
				if (winningScenario) {

					var foundPattern = new LocatedPattern();
					foundPattern.startLine = gameState.lines[pos];
					foundPattern.endLine = gameState.lines[stretchPos];
					foundPattern.pattern = currPattern;
					foundPatterns.push(foundPattern);
				}
				stretchPos++;
			}
		}

		var identifyPattern = function() {
			var groups = processLinesIntoGroups(true);
			return calculatePatternFromGroups(groups);
		}

	}

	function SimpleScenarioChecker(aiLevel) {
		var knownPatterns = new SimpleAIPatternBuilder().getPatternsForAILevel(aiLevel);
		this.isTrapScenario = function(arr) {
			if (knownPatterns[arr] == 1) {
				return true;
			}
			return false;
		}
	}

	function AvancedScenarioChecker() {
		/*
		 * These are the scenarios we will specifically call out. The rest are
		 * taken care of as there are logical checks that catch them.
		 * 
		 * 
		 * Limitations, patterns has to be ordered...
		 * 
		 * doesnt recursively try scenarios....
		 * 
		 */

		var patterns = [];
		// patterns.push([6,5,1]);
		patterns.push([ 7, 5, 3, 1 ]);
		// patterns.push([7,5,3]);
		patterns.push([ 6, 5, 2, 1 ]);
		patterns.push([ 5, 4, 3, 2 ]);

		patterns.push([ 6, 4, 2 ]);
		patterns.push([ 5, 4, 1 ]);
		patterns.push([ 3, 2, 1 ]);

		this.isTrapScenario = function(arr) {
			// console.log(arr2);
			var hashRep = getHashRepresentationForArr(arr);
			// console.log(hashRep);
			if (arr[0] == 1) {
				return (arr.length % 2 == 1);
			}

			var x = locateScenariosThroughArr(hashRep);
			return x;
		}

		var locateScenariosThroughArr = function(hashRep) {
			if (hasHashRepBeenSolved(hashRep)) {
				return true;
			}
			processThroughOtherPatterns(hashRep);
			if (hasHashRepBeenSolved(hashRep)) {
				return true;
			}
			return isOnlyPairsRemaining(hashRep);
		}

		var hasHashRepBeenSolved = function(hashRep) {
			return (Object.keys(hashRep).length == 0);
		}

		var processThroughOtherPatterns = function(hashRep) {
			for (var i = 0; i < patterns.length; i++) {
				processThroughACertainPattern(hashRep, patterns[i]);
			}

		}

		var processThroughACertainPattern = function(hashRep, pattern) {
			while (containsAllElementsInPattern(hashRep, pattern)) {
				removePatternFromHash(hashRep, pattern);
			}
		}

		var removePatternFromHash = function(hashRep, pattern) {
			for (var i = 0; i < pattern.length; i++) {
				removeElementFromHash(hashRep, pattern[i]);
			}
			return true;
		}

		var removeElementFromHash = function(hashRep, elem) {
			if (hashRep[elem].length == 1) {
				delete hashRep[elem];
				return;
			}
			hashRep[elem].pop();

		}

		var isOnlyPairsRemaining = function(hashRep) {
			for ( var el in hashRep) {
				var even = hashRep[el].length % 2 == 0;
				if (!(hashRep[el].length % 2 == 0)) {
					return false;
				}
			}
			return true;
		}

		var containsAllElementsInPattern = function(hashRep, pattern) {
			for (var i = 0; i < pattern.length; i++) {
				var elem = pattern[i];
				if (!(elem in hashRep)) {
					return false;
				}
			}
			return true;
		}

		var getHashRepresentationForArr = function(arr) {
			var ret = {}
			for (var i = 0; i < arr.length; i++) {
				var value = arr[i];
				if (!(value in ret)) {
					ret[value] = [];
				}
				ret[value].push(i);
			}
			return ret;

		}
	}

	var x = new AvancedScenarioChecker();
	console.log(x.isTrapScenario([ 5 ]));
	console.log(x.isTrapScenario([ 2, 2, 5, 5, 1 ]));
	console.log(x.isTrapScenario([ 3, 2, 1, 1, 3, 2, 1 ]));
	console.log(x.isTrapScenario([ 3, 2, 1, 3, 2, 1, 1 ]));
	console.log(x.isTrapScenario([ 5, 5, 3, 1, 1 ]));
	console.log(x.isTrapScenario([ 5, 3, 2, 1, 1 ]));
	console.log(x.isTrapScenario([ 5, 3, 2 ]));
	// console.log('a');
	console.log(x.isTrapScenario([ 2, 2, 1, 1 ]));
	console.log(x.isTrapScenario([ 2, 2 ]));
	console.log(x.isTrapScenario([ 2, 2, 5, 5 ]));
	console.log(x.isTrapScenario([ 7, 5, 3, 2, 2, 1 ]));
	console.log(x.isTrapScenario([ 3, 2, 1 ]));
	console.log(x.isTrapScenario([ 3, 2, 1, 3, 2, 1 ]));
	console.log(x.isTrapScenario([ 5, 4, 1, 1, 1 ]));
	console.log(x.isTrapScenario([ 3, 2, 1, 2, 2 ]));
	console.log(x.isTrapScenario([ 3, 3, 2, 2, 1, 1 ]));
	console.log(x.isTrapScenario([ 5, 4, 2, 2, 1 ]));
	console.log(x.isTrapScenario([ 5, 4, 4, 4, 1 ]));
	console.log(x.isTrapScenario([ 3, 2, 2, 2, 1 ]));
	console.log(x.isTrapScenario([ 345, 345, 3, 2, 2, 2, 1 ]));
	console.log(x.isTrapScenario([ 3555, 3555, 234, 234, 123, 123, 3, 3, 2, 2, 1, 1 ]));
	console.log(x.isTrapScenario([ 5, 4, 3, 2, 1, 1 ]));
	console.log(x.isTrapScenario([ 1, 1, 1 ]));
	console.log(x.isTrapScenario([ 1 ]));

	function Move(startX, startY, endX, endY) {
		this.startPoint = new Point(startX, startY);
		this.endPoint = new Point(endX, endY);
		this.humanInput = false;
	}

	function Point(xPos, yPos) {
		this.x = xPos;
		this.y = yPos;
	}

	function CollisionDetector() {
		var eps = 0.0000001;

		this.doesLineTouchRectangle = function(recX, recY, width, length, startPoint, endPoint, countIfEntirelyInside) {
			/*
			 * DOM cartesian is Y axis being positive as it goes down.
			 */

			if (checkIfLineNotHorizontallyWithin(recX, recY, width, length, startPoint, endPoint)) {
				/*
				 * quick check, if line segment is all the way to the left or
				 * right of rectangle, no need to do more complex checks.
				 */
				return false;
			}
			if (countIfEntirelyInside && checkIfLineWithinRectangle(recX, recY, width, length, startPoint, endPoint)) {

				return true;
			}// if !countIfEntirelyInside then only edges count
			return doesLineIntersectRectangle(recX, recY, width, length, startPoint, endPoint);
		}
		function checkIfLineWithinRectangle(recX, recY, width, length, startPoint, endPoint) {
			if (checkIfPointWithinRectangle(recX, recY, width, length, startPoint)) {
				return true;
			}
			if (checkIfPointWithinRectangle(recX, recY, width, length, endPoint)) {
				return true;
			}
			return false;

		}

		function checkIfPointWithinRectangle(recX, recY, width, length, point) {
			if ((point.x >= recX && point.x <= recX + width) && (point.y >= recY && point.y <= recY + length)) {
				return true;
			}
		}

		function checkIfLineNotHorizontallyWithin(recX, recY, width, length, startPoint, endPoint) {
			if (startPoint.x < recX && endPoint.x < recX) {
				// all the way to the left
				return true;
			}
			if (startPoint.x > (recX + width) && endPoint.x > (recX + width)) {
				// all the way to the right
				return true;
			}
			false;
		}

		function doesLineIntersectRectangle(recX, recY, width, length, startPoint, endPoint) {
			// left line of rec
			if (segment_intersection(startPoint.x, startPoint.y, endPoint.x, endPoint.y, recX, recY, recX, recY + length)) {
				return true;
			}
			// right line of rec
			if (segment_intersection(startPoint.x, startPoint.y, endPoint.x, endPoint.y, recX + width, recY, recX + width, recY + length)) {
				return true;
			}
			// top line of rec
			if (segment_intersection(startPoint.x, startPoint.y, endPoint.x, endPoint.y, recX, recY, recX + width, recY)) {
				return true;
			}
			// bottom line of rec
			if (segment_intersection(startPoint.x, startPoint.y, endPoint.x, endPoint.y, recX, recY + length, recX + width, recY + length)) {
				return true;
			}

			return false;

		}

		// https://gist.github.com/gordonwoodhull/50eb65d2f048789f9558

		function between(a, b, c) {
			return a - eps <= b && b <= c + eps;
		}

		function segment_intersection(x1, y1, x2, y2, x3, y3, x4, y4) {
			var x = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
			var y = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
			if (isNaN(x) || isNaN(y)) {
				return false;
			} else {
				if (x1 >= x2) {
					if (!between(x2, x, x1)) {
						return false;
					}
				} else {
					if (!between(x1, x, x2)) {
						return false;
					}
				}
				if (y1 >= y2) {
					if (!between(y2, y, y1)) {
						return false;
					}
				} else {
					if (!between(y1, y, y2)) {
						return false;
					}
				}
				if (x3 >= x4) {
					if (!between(x4, x, x3)) {
						return false;
					}
				} else {
					if (!between(x3, x, x4)) {
						return false;
					}
				}
				if (y3 >= y4) {
					if (!between(y4, y, y3)) {
						return false;
					}
				} else {
					if (!between(y3, y, y4)) {
						return false;
					}
				}
			}
			return {
				x : x,
				y : y
			};
		}

	}

	function SettingsManager() {
		this.playersParam = null;
		this.gameLayoutParam = null;
		this.gameLayoutSpec = null;
		var settingsObj;

		console.log(settingsJSON);
		if (settingsJSON != null) {
			settingsObj = JSON.parse(settingsJSON);
		}

		this.getSettingSelect = function(settingKey) {
			console.log(settingKey);
			var valFromInput = getSelectedValue(dimPrefix + '.' + settingKey);
			if (valFromInput != undefined) {
				return valFromInput;
			}
			if (settingsObj != null && settingKey in settingsObj) {
				return settingsObj[settingKey];
			}
			return null;
		}

		this.getSettingValue = function(settingKey) {
			console.log(settingKey);
			var valFromInput = getValue(dimPrefix + '.' + settingKey);
			if (valFromInput != undefined) {
				return valFromInput;
			}
			if (settingsObj != null && settingKey in settingsObj) {
				return settingsObj[settingKey];
			}
			return null;
		}

		this.addSettingsWatcher = function() {
			var dimIdentifersToWatch = [ 'whoGoesFirst', 'players', 'gameLayout' ];

			for (var i = 0; i < dimIdentifersToWatch.length; i++) {
				var dimIdentifer = dimIdentifersToWatch[i];
				if (document.getElementById(dimPrefix + '.' + dimIdentifer)) {
					addSettingsWatcherToObj(document.getElementById(dimPrefix + '.' + dimIdentifer))
				}
			}
		}
		function addSettingsWatcherToObj(obj) {
			obj.addEventListener('change', function() {
				lineGameConsole.sendSettingsChangeMessage()
			}, false);

		}
	}

	this.setSettings = function(settingsParam) {
		settingsJSON = settingsParam;
	}

	function getSelectedValue(dimId) {
		console.log(dimId);
		var e = document.getElementById(dimId);
		if (!e) {
			return e;
		}
		return e.options[e.selectedIndex].value;
	}

	function getValue(dimId) {
		console.log(dimId);
		var e = document.getElementById(dimId);
		if (!e) {
			return e;
		}
		return e.value;
	}

	function init() {

		lineGameConsole = new LineGameConsole();
		lineGameConsole.sendWelcome();
		settingsManager = new SettingsManager();
		settingsManager.addSettingsWatcher();

		var players = settingsManager.getSettingSelect("players")
		var p1;
		var p2;
		switch (players) {
		case 'HvH':
			p1 = new Player(1, 'Player1', 'green', null);
			p2 = new Player(2, 'Player2', 'violet', null);
			break;
		case 'HvC1':
			p1 = new Player(1, 'Human', 'green', null);
			p2 = new Player(2, 'Computer', 'violet', new AIEngine(new SimpleScenarioChecker(1)));
			break;
		case 'HvC2':
			p1 = new Player(1, 'Human', 'green', null);
			p2 = new Player(2, 'Computer', 'violet', new AIEngine(new SimpleScenarioChecker(2)));
			break;
		case 'HvC3':
			p1 = new Player(1, 'Human', 'green', null);
			p2 = new Player(2, 'Computer', 'violet', new AIEngine(new SimpleScenarioChecker(3)));
			break;
		case 'HvC4':
			p1 = new Player(1, 'Human', 'green', null);
			p2 = new Player(2, 'Computer', 'violet', new AIEngine(new AvancedScenarioChecker()));
			break;
		case 'CvC':
			p1 = new Player(1, 'Computer1', 'green', new AIEngine(new AvancedScenarioChecker()));
			p2 = new Player(2, 'Computer2', 'violet', new AIEngine(new AvancedScenarioChecker()));
			break;	
		default:
			p1 = new Player(1, 'Player1', 'green', null);
			p2 = new Player(2, 'Player2', 'violet', null);
			break;
		}

		var whoGoesFirst = settingsManager.getSettingSelect("whoGoesFirst");
		gameState = new GameState(p1, p2);
		collisionDetector = new CollisionDetector();

		if (whoGoesFirst == 2) {
			gameState.setWhoseTurn(2);
		}
	}

	function doMarkingLine(move) {
		if (gameState.getAIWhoseTurn() != null && move.humanInput) {
			alert('Wait your turn.');
			return;
		}
		var m = gameState.markingLines[gameState.currMarkingLine];
		if (m == null) {
			m = new MarkingLine(gameState.getColorForCurrentTurn(), gameState.getPlayerNumForCurrentTurn());
			gameState.markingLines[gameState.currMarkingLine] = m;
		}
		if (isLineReallyJustAPoint(move.startPoint, move.endPoint)) {
			// make them draw just a bit of line at least so something shows up
			// on screen.
			return;
		}
		m.startX = move.startPoint.x;
		m.startY = move.startPoint.y;
		m.endX = move.endPoint.x;
		m.endY = move.endPoint.y;

		checkMarkingLinePath(m);
	}

	function isLineReallyJustAPoint(point1, point2) {
		if (point1.x == point2.x && point1.y == point2.y) {
			return true;
		}
		return false;

	}

	function performMove(move) {
		lineGameConsole.clearWelcome();
		doMarkingLine(move);
		completeMarkingLine();
	}

	function checkMarkingLinePath(cMarkingLine) {
		for (j = 0; j < gameState.lines.length; j++) {
			var intersects = collisionDetector.doesLineTouchRectangle(gameState.lines[j].x, gameState.lines[j].y, LINE_WIDTH, LINE_HEIGHT, cMarkingLine.getStartPoint(), cMarkingLine.getEndPoint(), false);
			if (intersects) {
				gameState.lines[j].beingCrossedOut = true;
			} else {
				gameState.lines[j].beingCrossedOut = false;
			}

		}
	}

	function isGameOver() {
		for (j = 0; j < gameState.lines.length; j++) {
			if (!gameState.lines[j].crossedOut) {
				return false;
			}
		}
		return true;
	}

	function checkIfBeingCrossedOutIsValidMove() {
		processLinesIntoGroups(false);
		var syntheticGroupsEffected = {};
		var synGroupsEffectedCount = 0;
		for (var i = 0; i < gameState.lines.length; i++) {
			if (!gameState.lines[i].crossedOut) {
				if (gameState.lines[i].beingCrossedOut) {
					if (syntheticGroupsEffected[gameState.lines[i].syntheticGrp] != 1) {
						synGroupsEffectedCount++;
						syntheticGroupsEffected[gameState.lines[i].syntheticGrp] = 1;
					}
				}

			}
		}
		var validMove = false;
		if (synGroupsEffectedCount > 1) {
			console.log('Invalid Move ' + syntheticGroupsEffected + '   ' + synGroupsEffectedCount);
		} else if (synGroupsEffectedCount == 0) {
			console.log('Must mark one or more lines');
		} else {
			console.log('Valid Move ' + syntheticGroupsEffected + '   ' + synGroupsEffectedCount);
			validMove = true;
		}
		return validMove;
	}

	function processLinesIntoGroups(includeBeingCrossedOutAsCrossedOut) {
		var currGrp = 0;// arbitrary group number
		var currNaturalGrp = -1;
		var synGrp = -1;
		var groups = [];
		for (var i = 0; i < gameState.lines.length; i++) {
			var specialNewGroup = false;
			var normalNewGroup = false;

			var crossedOutDef1 = gameState.lines[i].crossedOut;
			var crossedOutDef2 = (gameState.lines[i].beingCrossedOut && includeBeingCrossedOutAsCrossedOut);
			var areWeConsideringThisCrossedOut = (crossedOutDef1 || crossedOutDef2);
			if (crossedOutDef1) {
				normalNewGroup = true;
			}
			if (crossedOutDef2) {
				specialNewGroup = true;
			}

			if (gameState.lines[i].grp != currNaturalGrp) {

				normalNewGroup = true;
			}
			if (normalNewGroup || specialNewGroup) {

				if (groups[currGrp] != undefined) {
					currGrp++;
				}
				if (normalNewGroup) {
					synGrp++;
				}
				currNaturalGrp = gameState.lines[i].grp;
			}
			if (!areWeConsideringThisCrossedOut) {
				if (groups[currGrp] == null) {
					groups[currGrp] = [];
				}
				groups[currGrp].push(gameState.lines[i]);
			}
			gameState.lines[i].syntheticGrp = synGrp;
		}
		groups.sort();
		groups.reverse();
		console.log(groups);
		return groups;
	}

	function calculatePatternFromGroups(groups) {
		var currPattern = '';
		for (var i = 0; i < groups.length; i++) {
			currPattern += groups[i].length;
			if (i != groups.length - 1) {
				currPattern += ',';
			}
		}
		return currPattern;
	}

	function randomIntFromInterval(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}

	function rollPercentChance(perc) {
		var r = randomIntFromInterval(0, 100);
		if (perc >= r) {
			return true;
		}
		return false;
	}

	function isLineCanBeCrossedOut(lineNum, workingOnGrpNum) {
		if (lineNum >= gameState.lines.length) {
			return false;
		}
		if (gameState.lines[lineNum].crossedOut) {
			return false;
		}
		// console.log('LineCrossOutCheck. a=' +
		// gameState.lines[lineNum].syntheticGrp + ' b=' + workingOnGrpNum + '
		// c=' + lineNum);
		if (gameState.lines[lineNum].syntheticGrp != workingOnGrpNum && workingOnGrpNum != -1) {
			return false;
		}
		return true;
	}

	function completeMarkingLine() {
		var validMove = checkIfBeingCrossedOutIsValidMove();
		if (validMove) {
			lineGameConsole.clearInvalidMoveMessage();
			processMarkingLineResults();
			gameState.currMarkingLine++;
			gameState.gameOver = isGameOver();
			if (gameState.gameOver) {
				gameState.determineWinningPlayer();
			} else {
				gameState.changeTurn();
				doAIStuff();
			}
		} else {
			lineGameConsole.sendMessageInvalidMove();
			gameState.markingLines.splice(gameState.currMarkingLine, 1);
			resetBeingCrossedOut();
		}
	}

	function doAIStuff() {
		var ai = gameState.getAIWhoseTurn();
		if (ai == null) {
			// Human Turn
			return;
		}
		drawGame();
		ai.performNextMove();
		drawGame();
	}

	function processMarkingLineResults() {
		for (j = 0; j < gameState.lines.length; j++) {
			if (gameState.lines[j].beingCrossedOut) {
				gameState.lines[j].crossedOut = true;
			}
		}
	}

	function getNotCrossedOffLines() {
		var notCrossedOff = [];
		for (j = 0; j < gameState.lines.length; j++) {
			if (!gameState.lines[j].crossedOut) {
				notCrossedOff.push(j);
			}
		}
		return notCrossedOff;
	}

	function resetBeingCrossedOut() {
		for (j = 0; j < gameState.lines.length; j++) {
			gameState.lines[j].beingCrossedOut = false;
		}
	}

	function drawGame() {
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		drawLines(ctx);
		drawMarkingLines(ctx);
		lineGameConsole.checkForGameStates();
		displayWhoseTurn();
	}

	function drawLines() {
		for (j = 0; j < gameState.lines.length; j++) {
			gameState.lines[j].draw(ctx);
		}
	}

	function printLineInfo() {
		if (true) {
			return;
		}
		for (j = 0; j < gameState.lines.length; j++) {
			var line = gameState.lines[j];
			console.log('line' + j + ' crossedOut=' + line.crossedOut + ' beingCrossedOut=' + line.beingCrossedOut + ' synGrp=' + line.syntheticGrp);
		}
	}

	function drawMarkingLines() {

		for (j = 0; j < gameState.markingLines.length; j++) {
			gameState.markingLines[j].draw(ctx);
		}
	}

	function setupNewGame() {

		var gameLayoutParam = settingsManager.getSettingSelect("gameLayout");

		switch (gameLayoutParam) {
		case 'Classic':
			new GameLayoutManager().setupGameStandard();
			break;
		case 'Expanded':
			new GameLayoutManager().setupGameExpanded();
			break;
		case 'Sevens':
			new GameLayoutManager().setupGameSevens();
			break;
		case 'Random':
			new GameLayoutManager().setupGameRandom();
			break;
		case 'Custom':
			new GameLayoutManager().setupGameCustom(settingsManager.getSettingValue("gameLayoutSpec"));
			break;
		default:
			new GameLayoutManager().setupGameStandard();
			break;
		}
	}

	function GameLayoutManager() {
		var vertGrps = [ 5, 105, 205, 305, 405, 505 ];
		var CENTER = canvasWidth / 2;
		var lineFactory = new LineFactory();
		var lineSpacingWithLine = 40;
		var grpNameCounter = 0;
		var maxRows = Math.floor(canvasHeight / (LINE_HIEGHT_AND_SPACE));

		this.setupGameStandard = function() {
			addGroupOfLines(gameState.lines, CENTER - 10, vertGrps[1], 1);
			addGroupOfLines(gameState.lines, CENTER - 50, vertGrps[2], 3);
			addGroupOfLines(gameState.lines, CENTER - 90, vertGrps[3], 5);
			addGroupOfLines(gameState.lines, CENTER - 130, vertGrps[4], 7);
		}

		this.setupGameSevens = function() {
			addGroupOfLines(gameState.lines, CENTER - 130, vertGrps[1], 7);
			addGroupOfLines(gameState.lines, CENTER - 130, vertGrps[2], 7);
			addGroupOfLines(gameState.lines, CENTER - 130, vertGrps[3], 7);
			addGroupOfLines(gameState.lines, CENTER - 130, vertGrps[4], 7);
		}

		this.setupGameExpanded = function() {

			addGroupOfLines(gameState.lines, CENTER - 210, vertGrps[1], 4);
			addGroupOfLines(gameState.lines, CENTER - 10, vertGrps[1], 1);
			addGroupOfLines(gameState.lines, CENTER + 30 + 40, vertGrps[1], 4);

			addGroupOfLines(gameState.lines, CENTER - 210, vertGrps[2], 3);
			addGroupOfLines(gameState.lines, CENTER - 50, vertGrps[2], 3);
			addGroupOfLines(gameState.lines, CENTER + 30 + 80, vertGrps[2], 3);

			addGroupOfLines(gameState.lines, CENTER - 210, vertGrps[3], 2);
			addGroupOfLines(gameState.lines, CENTER - 90, vertGrps[3], 5);
			addGroupOfLines(gameState.lines, CENTER + 30 + 120, vertGrps[3], 2);

			addGroupOfLines(gameState.lines, CENTER - 210, vertGrps[4], 1);
			addGroupOfLines(gameState.lines, CENTER - 130, vertGrps[4], 7);
			addGroupOfLines(gameState.lines, CENTER + 30 + 160, vertGrps[4], 1);
		}

		this.setupGameCustom = function(customLayoutVal) {
			var rowsOfLines = this.convertStringTo2dArr(customLayoutVal, ",", " ");
			return this.setupGameCustomExpanded(rowsOfLines);
		}

		/*
		 * input coming in may be like 3,4 5 Which would be converted to
		 * [[3,4],[5]]
		 * 
		 */
		this.convertStringTo2dArr = function(strVal, delim1, delim2) {
			var arr2 = strVal.split(delim1);
			var retArr = [];
			for (var i = 0; i < arr2.length; i++) {
				var valsInThisrow = [];
				var arr3 = arr2[i].split(delim2);
				for (var j = 0; j < arr3.length; j++) {
					valsInThisrow.push(arr3[j]);
				}

				retArr.push(valsInThisrow);
			}
			return retArr;
		}

		this.setupGameCustomExpanded = function(rowsOfLines) {
			var arr = rowsOfLines;
			// var arr = calculateCustomExpanded(dimIdentifier);
			var continueOnSettingUpGame = checkCustomLineInput(arr);
			if (!continueOnSettingUpGame) {
				return false;
			}
			// var lineCounts = arr.split(",");

			var vertGrpCounter = 0;
			var vertGrpsHorizPositioning = 25;
			var rows = arr.length;
			if (maxRows > 7) {
				if (rows <= 3) {
					vertGrpsHorizPositioning += 200;
				} else if (rows <= 5) {
					vertGrpsHorizPositioning += 100;
				}
			}

			for (var i = 0; i < arr.length; i++) {
				var lineGrps = arr[i];
				var totalLines = calculateTotalOfArr(lineGrps);
				var totalFreeSpaces = lineGrps.length - 1;
				var totalSlots = totalLines + totalFreeSpaces;
				var pos = (this.getCenterOffsetForLineCount2(totalSlots));
				for (var j = 0; j < lineGrps.length; j++) {
					pos = addGroupOfLines(gameState.lines, pos, vertGrpsHorizPositioning, lineGrps[j]);
					pos += lineSpacingWithLine;
				}
				vertGrpsHorizPositioning += 100;
			}
		}

		this.getCenterOffsetForLineCount2 = function(lineCount) {
			var center = canvasWidth / 2;
			return (center - 10) - (((lineCount - 1) * (LINE_WIDTH + LINE_SPACING)) / 2);
		}

		this.setupGameRandom = function() {
			var startPos = 90;
			var maxPos = canvasWidth - 120;
			for (var i = 0; i < vertGrps.length; i++) {
				var tmpPos = startPos;
				var yPos = vertGrps[i];
				var grpNme = getNewGroupName();
				var lastOneWasALine = false;
				while (tmpPos < maxPos) {
					var percChanceOfLine = 25;
					if (lastOneWasALine) {
						percChanceOfLine = 80;
					}
					if (rollPercentChance(percChanceOfLine)) {
						gameState.lines[gameState.lines.length] = lineFactory.createNewLine(grpNme, tmpPos, yPos);
						lastOneWasALine = true;
					} else {
						grpNme = getNewGroupName();
						lastOneWasALine = false;
					}
					tmpPos += lineSpacingWithLine;
				}
			}
		}

		function checkCustomLineInput(arr) {
			var maxSlots = getMaxTotalSlots();
			for (var i = 0; i < arr.length; i++) {
				var lineGrps = arr[i];
				var totalLines = calculateTotalOfArr(lineGrps);
				var totalFreeSpaces = lineGrps.length - 1;
				var totalSlots = totalLines + totalFreeSpaces;

				if (totalSlots > maxSlots) {
					alert('Max Requested Slots: ' + maxSlots + '. The parameters you requested would require: ' + totalSlots);
					return false;
				}
				if (i + 1 > maxRows) {
					alert('Max Requested Rows: ' + maxRows + '. The parameters you requested would require: ' + arr.length);
					return false;
				}
			}
			return true;
		}

		function getMaxTotalSlots() {
			var needSomeMarginOnEdge = 20;
			var needLineSpaceAndSomeSpaceForEachLine = LINE_WIDTH + LINE_WIDTH;
			return Math.floor((canvasWidth - needSomeMarginOnEdge) / needLineSpaceAndSomeSpaceForEachLine);
		}

		function calculateTotalOfArr(arr2) {
			return arr2.reduce(function(a, b) {
				return Number(a) + Number(b);
			}, 0);
		}

		function getNewGroupName() {
			return "grp" + (grpNameCounter++);
		}

		function addGroupOfLines(linesArr, xPos, yPos, count) {
			grpNme = getNewGroupName();
			for (var i = 1; i <= count; i++) {
				linesArr[linesArr.length] = lineFactory.createNewLine(grpNme, xPos, yPos);
				xPos += lineSpacingWithLine;
			}
			return xPos;
		}

	}

	this.logGameState = function() {
		gameState.log();
	}

	function displayWhoseTurn() {
		var whoseTurnElem = document.getElementById(dimPrefix + '.whoseTurn');
		if (!whoseTurnElem) {
			return;
		}
		if (gameState.getPlayerForCurrentTurn() != null) {
			var playerName = gameState.getPlayerForCurrentTurn().name;
			whoseTurnElem.innerHTML = playerName;
		} else {
			whoseTurnElem.innerHTML = 'N/A';
		}
	}

	function LineGameConsole() {
		var msgs = {};
		var msgOrder = [ 'welcome', 'settings_change', 'invalid_move', 'winner' ];
		var messageConsole = document.getElementById(dimPrefix + '.MessageConsole');

		this.checkForGameStates = function() {
			if (gameState.gameOver) {
				msgs['winner'] = '' + gameState.winningPlayer + ' Wins!';
				updateMessageDisplay();
			}
		}

		this.sendMessageInvalidMove = function() {
			this.clearWelcome();
			msgs['invalid_move'] = 'Invalid Move. You must mark off at least one line.  All lines marked off must be in the same group- they cannot be in different rows nor can they be on different sides of an already marked off line nor can there be an \'extra\' gap between the lines.';
			updateMessageDisplay();
		}

		this.sendWelcome = function() {
			msgs['welcome'] = 'Welcome to \'The Line Game\'!';
			updateMessageDisplay();
		}

		this.clearWelcome = function() {
			msgs['welcome'] = null;
			updateMessageDisplay();
		}

		this.clearMessageConsole = function() {
			msgs = {};
			updateMessageDisplay();
		}

		this.clearInvalidMoveMessage = function() {
			msgs['invalid_move'] = null;
			updateMessageDisplay();
		}

		this.sendSettingsChangeMessage = function(alwaysShowMsg) {
			this.clearWelcome();
			msgs['settings_change'] = 'Setting changes will take effect after a new game is started.';
			updateMessageDisplay();
		}

		function buildMessageForDisplaying(msg) {
			var displayMsg = '';
			for (var i = 0; i < msgOrder.length; i++) {
				var msgKey = msgOrder[i];
				if (msgs[msgKey] != undefined && msgs[msgKey] != null) {
					displayMsg += msgs[msgKey] + '\n';
				}

			}
			return displayMsg;

		}

		function updateMessageDisplay() {
			messageConsole.innerHTML = buildMessageForDisplaying();
		}

	}

	function newGame() {
		init();
		setupNewGame();
		drawGame();
		commenceGame();
	}

	function commenceGame() {
		doAIStuff();
	}

	this.run = function() {
		canvasHeight = document.getElementById(dimPrefix + '.Canvas').height;
		canvasWidth = document.getElementById(dimPrefix + '.Canvas').width;

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

		addMenuListeners();

		ctx.save();
		addMouseEventsListeners();

		newGame();

	}

	function addMenuListeners() {
		if (document.getElementById(dimPrefix + ".NewGameButton") != null) {
			document.getElementById(dimPrefix + ".NewGameButton").addEventListener("click", function() {
				newGame();
			});
		}
	}

	function getXOffset() {
		return canvas.getBoundingClientRect().left;
	}

	function getYOffset() {
		return canvas.getBoundingClientRect().top;
	}

	function addMouseEventsListeners() {
		var isDown = false;

		canvas.onmousedown = function(e) {
			if (gameState.getAIWhoseTurn() != null) {
				alert('Wait your turn.');
				return;
			}
			e.preventDefault();
			e.stopPropagation();
			var startX = parseInt(e.clientX - getXOffset());
			var startY = parseInt(e.clientY - getYOffset());
			isDown = true;
			var move = new Move(startX, startY, startX, startY);
			gameState.setCurrentMove(move);
			doMarkingLine(move);
			drawGame();
		}
		canvas.onmousemove = function(e) {
			if (!isDown) {
				return;
			}
			e.preventDefault();
			e.stopPropagation();
			var move = gameState.getOrBuildCurrentMove();
			move.endPoint.x = parseInt(e.clientX - getXOffset());
			move.endPoint.y = parseInt(e.clientY - getYOffset());
			doMarkingLine(move);

			drawGame();

		}
		canvas.onmouseup = function(e) {
			if (!isDown) {
				return;
			}
			e.preventDefault();
			e.stopPropagation();
			var move = gameState.getOrBuildCurrentMove();
			move.endPoint.x = parseInt(e.clientX - getXOffset());
			move.endPoint.y = parseInt(e.clientY - getYOffset());
			move.humanInput = true;
			isDown = false;

			doMarkingLine(move);
			completeMarkingLine();
			drawGame();

		}

	}

};
