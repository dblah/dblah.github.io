/*
 * 
 * The Line Game Instructions
 * 
 * 2016
 * 
 */

function TheLineGameInstructions() {
	this.exampleCounter = 1;
};

var lineGameInstructions = new TheLineGameInstructions();

TheLineGameInstructions.extend = function(a, b) {
	for ( var key in b)
		if (b.hasOwnProperty(key))
			a[key] = b[key];
	return a;
}


TheLineGameInstructions.loadCustomPaneSimple = function(divId, scenario) {
	var lineGameIdentifier = "TheLineGame" + (lineGameInstructions.exampleCounter++);
	var lineGame = TheLineGameInstructions.loadCustomPane(divId, lineGameIdentifier, scenario, 450, 450, false, false)
	TheLineGameInstructions.launchGame(lineGame);
	return;
}

TheLineGameInstructions.loadCustomGameCustom = function(scenario) {
	var lineGame = TheLineGameInstructions.loadCustomPane("TheLineGameInstructions.Custom", "TheLineGameInstructions.Custom", scenario, 850, 850, true, true);
	TheLineGameInstructions.resetCustomPaneCustomControls('TheLineGameInstructions.Custom', scenario);
	TheLineGameInstructions.launchGame(lineGame);
	return;

}

TheLineGameInstructions.resetCustomPaneCustomControls = function(lineGameIdentifier, scenario) {
	if (!document.getElementById(lineGameIdentifier + '.whoGoesFirst')) {
		return; // control panel not initialized when first loading.
	}
	document.getElementById(lineGameIdentifier + '.whoGoesFirst').selectedIndex = 0;
	document.getElementById(lineGameIdentifier + ".gameLayoutSpec").value = scenario;
	return;
}

TheLineGameInstructions.launchGame = function(lineGameGenerated) {
	lineGameGenerated.run();
}

TheLineGameInstructions.loadCustomPane = function(divId, lineGameIdentifier, scenario, width, height, showMoreOptions, showLineOptions) {
	var div = document.getElementById(divId);
	var textNode = '';
	textNode += '<table class=\'linegametable\'><tbody><tr><td class="linegameplaytd">';
	textNode += '<canvas id="' + lineGameIdentifier + '.Canvas" width="' + width + '" height="' + width + '" style="border: 1px solid black;"></canvas>';
	textNode += '</td><td class=\'linegametable\'><textarea id="' + lineGameIdentifier + '.MessageConsole" rows=\'4\' cols=80 style="display: block; margin-left: auto; margin-right: auto;"></textarea>';
	textNode += '<br/><p style="text-align: center;">&nbsp;&nbsp;Whose&nbsp;Turn:&nbsp;&nbsp;';
	textNode += '<p id="' + lineGameIdentifier + '.whoseTurn" style="text-align: center; font-style: italic">N/A</p> <br /> <br />';
	if (showMoreOptions) {

		textNode += '<div class=\'linegametd center\'>Who&nbsp;Moves&nbsp;First<br\>';
		textNode += '<select id=\'' + lineGameIdentifier + '.whoGoesFirst\'>';
		textNode += '		<option value=\'1\'>Player 1</option>';
		textNode += '		<option value=\'2\'>Player 2</option>';
		textNode += '</select></div><br /> <br />';
		textNode += '';

		textNode += '<div class=\'linegametd center\'>Difficulty&nbsp;Level<br\>';
		textNode += '<select id=\'' + lineGameIdentifier + '.players\'>';
		textNode += '		<!-- <option value=\'CvC\'>Computer Expert vs Computer Expert</option> -->';
		textNode += '		<option value=\'HvC4\'>Human vs Computer - Expert</option>';
		textNode += '		<option value=\'HvC1\'>Human vs Computer - Newcomer</option>';
		textNode += '		<option value=\'HvC2\'>Human vs Computer - Intermediate</option>';
		textNode += '		<option value=\'HvC3\'>Human vs Computer - Advanced</option>';
		textNode += '		<option value=\'HvH\'>Human vs Human</option>';
		textNode += '</select></div><br /> <br />';


	}

	if (showLineOptions) {
		textNode += '<div class=\'linegametd center\'>Custom Scenario: <input type="text" size="55" id="' + lineGameIdentifier + '.gameLayoutSpec"/>';
		textNode += '<p>The \'Custom Scenario\' input allows you to enter a custom scenario such as \'3,4,5\'.  ';
		textNode += 'One may also control specific groups in each row by delimiting with a space, example: ';
		textNode += '\',3 2,,1\' would skip a row, then put groups of 3 and 2 lines in the same row, skip another row ';
		textNode += 'and then put a single line down.  There are limitations on the number of lines/rows and the system will notify if those limitations are reached.';
		textNode += '</p></div>';
		textNode += '<br/><br/>';
	}

	textNode += '<div class=\'linegametd center\'><button id=\'' + lineGameIdentifier + '.NewGameButton\'>New Game</button></div>';
	textNode += '</td></tr></tbody></table>';
	div.innerHTML = textNode;

	var gameLayoutSpec = ',"gameLayoutSpec":"' + scenario + '"';
	if (showLineOptions) {
		gameLayoutSpec = '';
	}

	var settings = '{"gameLayout":"Custom","players":"HvC4","whoGoesFirst":"Player1"' + gameLayoutSpec + '}';

	var lineGameGenerated = new TheLineGame(lineGameIdentifier);
	lineGameGenerated.setSettings(settings);
	return lineGameGenerated;

}
