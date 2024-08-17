class PressGameUI {
    gameIdElement;
    gameEngine;
    wheel;
    canvasId;
    haveShownSpinHint = false;

    constructor(gameIdElement, gameEngine, canvasId) {
        this.gameIdElement = gameIdElement;
        this.gameEngine = gameEngine;
        this.canvasId = canvasId;

    }

    init() {
        this.gameEngine.init();

        this.displayBadActionChoiceArea();
        this.displayStateArea(this.gameEngine.gameState);
        this.updateCursors(this.gameEngine.gameState);

        this.makeWheelClickSpinAction();

        this.initWheel();
        this.wheel.draw();
    }




    initWheel() {
        let spinResultFunc = this.handleSpinResultNotification.bind(this);
        this.wheel = new Wheel(this.gameEngine.gameState, spinResultFunc, this.canvasId);
    }

    requestSpinAction() {
        if (!this.gameEngine.isDoSpinAllowed()) {
            return;
        }

        this.gameEngine.gameState.setTransitionStateHappening();
        this.updateVisuals(this.gameEngine.gameState, null, null);
        this.wheel.rotate();//Async changes happening here
    }

    handleSpinResultNotification(spinResultPortion) {
        let spinResult = this.gameEngine.handleSpinAction(spinResultPortion);

        this.gameEngine.handleSpinResult(spinResult);

        this.updateVisuals(this.gameEngine.gameState, spinResult, null);


        if (this.gameEngine.detectIfGameIsOver()) {
            this.displayForGameOver();
        }
        this.updateCursors(this.gameEngine.gameState);

    }


    handleRequestNewGame() {
        if (this.gameEngine.gameState.isActionAllowed()) {
            this.triggerNewGame();
        } else {
            console.log("New Game Not Allowed");
        }
       
    }

    triggerNewGame() {
        this.init();
    }

    handleRequestGameOver() {
        if (this.gameEngine.gameState.isActionAllowed()) {
            this.triggerGameOver();
        } else {
            console.log("Game Over Not Allowed");
        }
    }


    triggerGameOver() {
        this.gameEngine.setGameAsOver();
        this.displayForGameOver();
    }


    displayForGameOver() {
        this.updateVisuals(this.gameEngine.gameState, null, null);
        this.toggleQuitButton(false);
        this.toggleNewGameButton(true);
        this.displayHighScores();

    }


    createHighScorePanelIfNotExist() {
        let existAlready = false;
        if (document.getElementById('popupPanel')) {
            existAlready = true;
        }
        let divItem = this.createDivIdNotExistUtil('popupPanel', 'game');
        divItem.style.position = "absolute";
        divItem.style.left = "150px";
        divItem.style.top = "455px";


        if (!existAlready) {
            //Style Class
            divItem.classList.add("popup");
            //Hide listener
            divItem.addEventListener("click", event => document.getElementById('popupPanel').style.display = 'none');
        }
        divItem.classList.toggle("show");
        return divItem;
    }

    displayHighScores() {
        this.createHighScorePanelIfNotExist();
        let divItem2 = this.createDivIdNotExistUtil('popupPanel2', 'popupPanel');

        let html='';
        html = 'High Scores<br><table class="highscoretable">';
        html+= '<tr><th>Place</th><th>Time</th><th>Score</th></tr>';
        for (let i = 0; i < 10; i++) {
            let place = i + 1;
            if (this.gameEngine.getHighScores()[i]) {
                let highScore = this.gameEngine.getHighScores()[i];
                html += "<tr><td style='text-align:left'>" + place + "</td><td style='text-align:left'>" + highScore['date'].toLocaleString() + '</td>';
                html += "<td style='text-align:right'>" + highScore.score + '</td></tr>';
            } else {
                html += "<tr><td style='text-align:left'>" + place + "</td><td style='text-align:left'></td>";
                html += "<td style='text-align:right'></td></tr>";
            }

        }
        html+= '</table><p align="bottom">(click to close)</p>'
        divItem2.innerHTML = html;
        divItem2.classList.add("popuptext");

        document.getElementById('popupPanel').style.display = 'block';
    }


    handleBadActionRequest(idBad) {

        let badActionPickResult = this.gameEngine.handlePickBadAction(idBad);
        if (!badActionPickResult) {
            return;
        }
        if (!badActionPickResult.validPick) {
            console.log("Already Picked");
            return false;
        }

        this.makeBadVisiblyUnselectable(idBad);
        this.gameEngine.handleBadActionResult(badActionPickResult);
        this.gameEngine.handleApplyBadActionResult(badActionPickResult);
        this.updateVisuals(this.gameEngine.gameState, null, badActionPickResult);
        this.wheel.draw();

    }

    makeBadVisiblyUnselectable(idBad) {
        let elem = document.getElementById('numBad' + idBad);
        elem.innerHTML = '';
    }

    updateSelectionArea(selNum, badActionPickResult) {
        let elem = document.getElementById('num' + selNum);
        elem.innerHTML = badActionPickResult.item.resultAction.toString();
        elem.className = 'bad'
    }

    controlCursorChoiceForWheel(gameState) {
        document.getElementById(this.canvasId).style.cursor = this.determineCursorFromGameStateForWheel(gameState);
    }

    controlCursorForBadChoiceOptions(gameState) {
        document.getElementById('selBadArea').style.cursor = this.determineCursorForBadChoiceOptions(gameState);
    }

    determineCursorFromGameStateForWheel(gameState) {
        let ret = "not-allowed";
        if (gameState.gamePoint == GamePoint.DO_SPIN && gameState.isActionAllowed()) {
            ret = "pointer";
        }
        return ret;
    }

    determineGameRoundControls(gameState) {
        if (gameState.isActionAllowed()) {
            this.toggleQuitButton(true);
            this.toggleNewGameButton(true);
        } else {
            this.toggleQuitButton(false);
            this.toggleNewGameButton(false);
        }
    }

    determineCursorForBadChoiceOptions(gameState) {
        let ret = "not-allowed";
        if (gameState.gamePoint == GamePoint.DO_BAD) {
            ret = "pointer";
        }
        return ret;
    }


    updateVisuals(gameState, spinResult, badActionPickResult) {
        this.determineGameRoundControls(gameState);
        this.updateCursors(gameState);
        this.displayStateArea(gameState, spinResult, badActionPickResult);
    }

    updateCursors(gameState) {
        this.controlCursorForBadChoiceOptions(gameState);
        this.controlCursorChoiceForWheel(gameState);
    }

    createDivIdNotExistUtil(divName, divParent, divClass = null) {
        let divItem = document.getElementById(divName);
        if (!divItem) {
            divItem = document.createElement('div');
            divItem.id = divName;
            if (divClass != null) {
                divItem.classList.add(divClass);
            }
            document.getElementById(divParent).appendChild(divItem);
            console.log("Create " + divName);
        }
        return divItem;
    }

    calcVerbiageForSpinResult(spinResult) {
        let verbiage = '';
        if (!spinResult) { return verbiage; }
        if (spinResult.bank) {
            verbiage += "You hit BANK! Any 'At Risk' money is now safe.";
            return verbiage;
        }
        let a = spinResult.moneyChangeAmount + spinResult.bankChangeAmount;
        if (a > 0) {
            verbiage += 'You gained ' + a + '.';
        } else if (a < 0) {
            verbiage += 'You lost ' + a + '.';
        } else {
            verbiage += 'No score change.';
        }
        return verbiage;
    }


    calcVerbiageForBadAction(badActionPickResult) {
        let verbiage = "";
        switch (badActionPickResult.item.resultAction.resultActionType) {
            case "MONEY_INCREMENT_LOSS":
                if (badActionPickResult.item.resultAction.value != 0) {
                    verbiage += "Lose " + badActionPickResult.item.resultAction.value;
                }
                break;
            case "MONEY_LOSS_PERCENT":
                verbiage += "Lose " + badActionPickResult.item.resultAction.value + "%";
                break;
        }

        if (this.gameEngine.isGameOverResultType(badActionPickResult.item.resultAction.resultAction2Type)) {
            if (verbiage != "") {
                verbiage += " and ";
            }
            verbiage += "Game Over";
        }
        return verbiage;
    }


    updateMessageArea(gameState, spinResult, badActionPickResult) {
        let divItem = this.createDivIdNotExistUtil('msgPanel', 'gameStateDiv');
        let verbiage = this.calcVerbiageForSpinResult(spinResult);
        if (verbiage != '') {
            verbiage = '<br>' + verbiage + '<br>';
        } else {
            verbiage = '<br>';
        }

        divItem.innerHTML = 'Spin';
        switch (gameState.gamePoint) {
            case GamePoint.DO_SPIN:
                if (gameState.isActionAllowed()) {
                    if (badActionPickResult != null) {
                        verbiage += "The prior wedge has been replaced with a <br>'" + this.calcVerbiageForBadAction(badActionPickResult) + "' wedge.<br><br>";
                    }
                    verbiage += 'Choose to spin the wheel ' + (this.haveShownSpinHint ? '' : '(Click the wheel)') + '<br>or quit with ' + gameState.getTotal() + ".";
                    this.haveShownSpinHint = true;  //only show spin hint once to reduce clutter
                } else {
                    //SPINNING
                    verbiage += 'Spinning...<br>';
                }
                break;
            case GamePoint.DO_BAD:
                verbiage += "<br>Pick a 'Bad' Replacement wedge.";
                break;
            case GamePoint.GAME_OVER:
                verbiage += 'Game Over!<br>Score: ' + gameState.getTotal();
                break;

        }
        divItem.innerHTML = verbiage;
        this.displayButtonOptions('gameStateDiv', gameState);

    }

    updateGameStateArea(gameState) {
        let divItem = this.createDivIdNotExistUtil('gameStatePanel', 'gameStateDiv');
        let html = '<table class="gameStateArea"><tbody>';
        html += '<tr><td>Round</td><td class="gameStateAreaR">' + gameState.pickNumber + '</td></tr>';
        html += '<tr><td>At Risk</td><td class="gameStateAreaR">' + gameState.moneyAmount + ' </td></tr>';
        html += '<tr><td>Bank</td><td class="gameStateAreaR">' + gameState.bankAmount + '</td></tr>';
        html += '<tr><td>Total</td><td class="gameStateAreaR">' + gameState.getTotal() + '</td></tr>';
        html += '</tbody></table>';
        divItem.innerHTML = html;
    }

    updateChoiceArea() {
        this.createDivIdNotExistUtil('choicePanel', 'gameStateDiv');
    }

    displayStateArea(gameState, spinResult, badActionPickResult) {
        this.createDivIdNotExistUtil('gameStateDiv', 'game');
        this.updateGameStateArea(gameState);
        this.updateMessageArea(gameState, spinResult, badActionPickResult);
        this.updateChoiceArea();
        this.updateQuitWithVerbiage(gameState);
    }


    toggleQuitButton(enabled) {
        document.getElementById('quitButton').disabled = !enabled;
    }
    toggleNewGameButton(enabled) {
        document.getElementById('newGameButton').disabled = !enabled;
    }


    makeWheelClickSpinAction() {
        let canvas = document.getElementById('canvas1');
        var thisRef = this;
        let spinFunction = function (event) {//dupe code
            event.preventDefault();
            thisRef.requestSpinAction();
            return false;

        };
        canvas.addEventListener("click", spinFunction);
    }


    displayButtonOptions(divId, gameState) {
        if (this.doButtonOptionsExistAlready()) {
            this.determineGameRoundControls(gameState);
            return;
        }

        let buttonDiv = document.createElement("div");
        buttonDiv.id = "msgPanelButtonOptsDiv";
        document.getElementById(divId).appendChild(buttonDiv);

        this.displayQuitOption(buttonDiv);
        this.createDivIdNotExistUtil("spacerDiv1", "msgPanelButtonOptsDiv", "divider");
        this.displayNewGameOption(buttonDiv);
    }


    doButtonOptionsExistAlready() {
        return document.getElementById('quitButton');
    }


    displayQuitOption(buttonDiv) {
        let button = document.createElement('button');
        button.id = 'quitButton';

        var thisRef = this;

        let func = function (event) {
            // Cancel the default action, if needed
            event.preventDefault();
            thisRef.handleRequestGameOver();

            return false;

        };

        button.addEventListener("click", func);
        buttonDiv.appendChild(button);
    }

    updateQuitWithVerbiage(gameState) {
        document.getElementById('quitButton').innerHTML = 'Quit with ' + gameState.getTotal();
    }


    displayNewGameOption(buttonDiv) {
        let button = document.createElement('button');
        button.innerHTML = 'New Game';
        button.id = 'newGameButton';

        var thisRef = this; //makes 'this' available to the function.

        let func = function (event) {
            // Cancel the default action, if needed
            event.preventDefault();
            thisRef.handleRequestNewGame();
            return false;
        };

        button.addEventListener("click", func);
        buttonDiv.appendChild(button);

    }


    removeDomElementIfExists(id) {
        let elem = document.getElementById(id);
        if (elem) {
            elem.remove();
        }
    }

    clearElementChildrenIfExists(id) {
        let elem = document.getElementById(id);
        if (elem) {
            elem.innerHTML = "";
        }
    }

    displayBadActionChoiceArea() {
        let gLayout = this.gameEngine.gameState;
        let refC = this;
        let counter = 0;
        let selArea = document.createElement('table');
        let topRow = document.createElement('tr')
        selArea.appendChild(topRow);
        let th = document.createElement('th')
        th.innerHTML = "'Bad' Replacement Wedges";
        th.className = 'selAreaPickBadTh'
        th.colSpan = '8';
        topRow.appendChild(th);
        selArea.appendChild(topRow);
        selArea.id = 'selBadArea';
        selArea.classList.add("selAreaPick");

        for (let i = 0; i < gLayout.rowsBad; i++) {
            let tr = document.createElement('tr');
            selArea.appendChild(tr);
            for (let j = 0; j < gLayout.colsBad; j++) {
                let td = document.createElement('td');
                tr.appendChild(td);
                td.innerHTML = '' + (counter + 1);
                td.id = 'numBad' + counter;
                td.paramIndicator = counter
                td.className = 'selAreaPickBad'

                let evListener = function (event) {
                    // Cancel the default action, if needed
                    event.preventDefault();

                    let elem = event.currentTarget;

                    refC.handleBadActionRequest(elem.paramIndicator);

                };
                td.addEventListener("click", evListener);
                counter++;

            }
        }
        this.clearElementChildrenIfExists('selBadDiv');
        let badActionDiv = this.createDivIdNotExistUtil('selBadDiv', 'game');
        badActionDiv.appendChild(selArea);

    }

}
