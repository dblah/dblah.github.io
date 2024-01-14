class PressGameEngine {
  gameState;
  gameConfig;
  highScoreTracker;

  constructor() {
    this.highScoreTracker = new HighScoreTracker();
  }


  init() {
    this.gameConfig = new GameLayoutConfigurer1().gameConfig;
    this.gameState = new GameState(this.gameConfig);
    this.gameState.gamePoint = GamePoint.DO_SPIN;
  }


  isDoSpinAllowed() {
    if (!this.gameState.isActionAllowed()) {
      return false;
    }
    if (this.gameState.gamePoint != GamePoint.DO_SPIN) {
      console.log("INVALID DO_SPIN OPERATION");
      return false;
    }
    return true;
  }



  detectIfGameIsOver() {
    //money to low
    if (this.gameState.moneyAmount < 0) {
      this.gamePoint = GamePoint.GAME_OVER
      return true;
    }
    //spin action says it should be
    if (this.gameState.spinResultActive.selectedItem.resultAction.resultAction2Type == ResultActionType.GAME_OVER) {
      this.gamePoint = GamePoint.GAME_OVER
      return true;
    }
    return false;
  }


  setGameAsOver() {
    console.log("GAME OVER!!! Points: " + this.gameState.getTotal());
    this.gameState.gamePoint = GamePoint.GAME_OVER;
    this.highScoreTracker.addNewScore(this.gameState.getTotal(), null, null);
  }



  handleSpinAction(spinResultPortion) {
    let spinResult = new SpinResult();
    this.gameState.pickNumber++;
    if (this.gameState.gamePoint != GamePoint.DO_SPIN) {
      console.log("INVALID OPERATION");
      return null;
    }

    spinResult.selectedIndex = spinResultPortion;
    spinResult.selectedItem = this.gameState.selectionItems[spinResult.selectedIndex];

    switch (spinResult.selectedItem.resultAction.resultActionType) {
      case ResultActionType.MONEY_INCREMENT_LOSS:
        spinResult.moneyChangeAmount = parseInt(spinResult.selectedItem.resultAction.value) * -1;
        this.gameState.gamePoint = GamePoint.DO_SPIN;
        break;
      case ResultActionType.MONEY_LOSS_PERCENT:
        spinResult.moneyChangeAmount = this.gameState.moneyAmount * (parseInt(spinResult.selectedItem.resultAction.value) / -100);
        this.gameState.gamePoint = GamePoint.DO_SPIN;
        break;
      case ResultActionType.GAINMONEY:
        spinResult.moneyChangeAmount += parseInt(spinResult.selectedItem.resultAction.value);
        this.gameState.gamePoint = GamePoint.DO_BAD;
        break;
      case ResultActionType.MULTIPLIER:
        spinResult.multiplier = parseInt(spinResult.selectedItem.resultAction.value);
        spinResult.moneyChangeAmount = this.gameState.moneyAmount * spinResult.multiplier;
        spinResult.bankChangeAmount = this.gameState.bankAmount * spinResult.multiplier;
        this.gameState.gamePoint = GamePoint.DO_BAD;
        break;
      case ResultActionType.BANK:
        spinResult.bank = true;
        this.gameState.gamePoint = GamePoint.DO_BAD;
        break;
      default:
        break;
    }

    spinResult.endGame = this.isGameOverResultType(spinResult.selectedItem.resultAction.resultAction2Type);
    this.gameState.spinResultActive = spinResult;

    return spinResult;
  }

  isGameOverResultType(resultAction2Type) {
    return resultAction2Type == ResultActionType.GAME_OVER;
  }


  handleSpinResult(spinResult) {
    let resultAmount = spinResult.moneyChangeAmount + spinResult.bankChangeAmount;
    console.log("Hit " + spinResult.selectedItem + "   Result " + (resultAmount >= 0 ? "+" : "") + resultAmount);

    this.gameState.moneyAmount += spinResult.moneyChangeAmount;
    this.gameState.bankAmount += spinResult.bankChangeAmount;

    if (spinResult.bankAffected) {
      this.gameState.bankAmount *= spinResult.multiplier;
    }
    if (spinResult.bank) {
      this.gameState.bankAmount += this.gameState.moneyAmount;
      this.gameState.moneyAmount = 0;
    }

    this.gameState.setTransitionStateNotHappening();
    if (this.detectIfGameIsOver()) {
      this.setGameAsOver();
      return;
    }
  }

  handlePickBadAction(pickedBadId) {
    if (this.gameState.gamePoint != GamePoint.DO_BAD) {
      return null;
    }
    let badActionPickResult = new BadActionPickResult();
    badActionPickResult.pickNumber = pickedBadId;
    badActionPickResult.item = this.gameState.selectionItemsBad[badActionPickResult.pickNumber];
    if (badActionPickResult.item.pickedAlready) {
      badActionPickResult.validPick = false;
    }

    console.log(badActionPickResult.item);
    return badActionPickResult;
  }

  handleBadActionResult(badActionPickResult) {
    this.gameState.selectionItems[this.gameState.spinResultActive.selectedIndex] = badActionPickResult.item;
  }

  handleApplyBadActionResult(badActionPickResult) {
    badActionPickResult.item.pickedAlready = true;
    this.gameState.spinResultActive = null;
    this.gameState.gamePoint = GamePoint.DO_SPIN;

  }

  getHighScores() {
    return this.highScoreTracker.getScores();
  }

}

class SpinResult {
  moneyChangeAmount = 0;
  endGame = false;
  bank = false;
  selectedIndex;
  selectedItem;
  bankChangeAmount = 0;

}


class BadActionPickResult {
  pickNumber;
  item;
  validPick = true;
}


const GamePoint = {
  "DO_SPIN": "DO_SPIN",
  "DO_BAD": "DO_BAD",
  "GAME_OVER": "GAME_OVER"
}


const ResultActionType = {
  GAINMONEY: "GAINMONEY",
  MULTIPLIER: "MULTIPLIER",
  BANK: "BANK",

  MONEY_INCREMENT_LOSS: "MONEY_INCREMENT_LOSS",
  MONEY_LOSS_PERCENT: "MONEY_LOSS_PERCENT",

  GAME_OVER: "GAME_OVER"
}


/**
 * Represents good or bad possible actions
 */
class ResultAction {
  resultActionType;
  resultAction2Type;
  value;


  constructor(resultActionType, value, resultAction2Type) {
    this.resultActionType = resultActionType;
    this.resultAction2Type = resultAction2Type;
    this.value = value;

  }

  isGood() {
    return this.resultActionType == ResultActionType.GAINMONEY || this.resultActionType == ResultActionType.MULTIPLIER || this.resultActionType == ResultActionType.BANK;
  }

  toString() {
    let str = this.resultActionType + " " + (this.isGood() ? "GOOD" : "BAD") + " " + this.value + " ";
    if (this.resultAction2Type) {
      str += " " + this.resultAction2Type;
    }
    return str;
  }

  toDisplayString() {
    let str = '';
    if (this.resultAction2Type) {
      str += 'GAME OVER ';
    }
    switch (this.resultActionType) {
      case ResultActionType.GAINMONEY:
        str += '+' + this.value;
        break;
      case ResultActionType.MULTIPLIER:
        str += "\u{0D7}" + this.value;
        break;
      case ResultActionType.MONEY_LOSS_PERCENT:
        str += 'LOSE ' + this.value + '%';
        break;
      case ResultActionType.MONEY_INCREMENT_LOSS:
        if (this.value != 0) {
          str += '-' + this.value;
        }
        break;
      case ResultActionType.BANK:
        str += 'BANK';
        break;
    }
    return str;

  }

}

class GameConfig {
  numOfSelectionItems = 24
  horizBoxes = 5
  vertboxes = 5
  resultActions = [];
  resultActionsBad = [];
}

class GameLayoutConfigurer1 {
  gameConfig;

  constructor() {
    this.gameConfig = new GameConfig();
    this.generateResultActions();
    this.generateResultActionsBad();

  }

  generateResultActions() {
    this.gameConfig.resultActions.push(new ResultAction(ResultActionType.MULTIPLIER, "2"));
    this.gameConfig.resultActions.push(new ResultAction(ResultActionType.MULTIPLIER, "3"));

    this.gameConfig.resultActions.push(new ResultAction(ResultActionType.GAINMONEY, "2000"));
    this.gameConfig.resultActions.push(new ResultAction(ResultActionType.GAINMONEY, "1500"));
    this.gameConfig.resultActions.push(new ResultAction(ResultActionType.GAINMONEY, "1200"));

    this.gameConfig.resultActions.push(new ResultAction(ResultActionType.GAINMONEY, "200"));
    this.gameConfig.resultActions.push(new ResultAction(ResultActionType.GAINMONEY, "400"));
    this.gameConfig.resultActions.push(new ResultAction(ResultActionType.GAINMONEY, "250"));
    this.gameConfig.resultActions.push(new ResultAction(ResultActionType.BANK, "BANK"));
    this.gameConfig.resultActions.push(new ResultAction(ResultActionType.GAINMONEY, "600"));
    this.gameConfig.resultActions.push(new ResultAction(ResultActionType.GAINMONEY, "300"));

    this.gameConfig.resultActions.push(new ResultAction(ResultActionType.GAINMONEY, "150"));
    this.gameConfig.resultActions.push(new ResultAction(ResultActionType.GAINMONEY, "450"));
    this.gameConfig.resultActions.push(new ResultAction(ResultActionType.GAINMONEY, "700"));
    this.gameConfig.resultActions.push(new ResultAction(ResultActionType.GAINMONEY, "500"));
    this.gameConfig.resultActions.push(new ResultAction(ResultActionType.GAINMONEY, "300"));

    this.gameConfig.resultActions.push(new ResultAction(ResultActionType.GAINMONEY, "100"));
    this.gameConfig.resultActions.push(new ResultAction(ResultActionType.GAINMONEY, "250"));
    this.gameConfig.resultActions.push(new ResultAction(ResultActionType.GAINMONEY, "350"));
    this.gameConfig.resultActions.push(new ResultAction(ResultActionType.GAINMONEY, "2000"));


    this.gameConfig.resultActions.push(new ResultAction(ResultActionType.BANK, "BANK"));
    this.gameConfig.resultActions.push(new ResultAction(ResultActionType.GAINMONEY, "500"));
    this.gameConfig.resultActions.push(new ResultAction(ResultActionType.GAINMONEY, "700"));
    this.gameConfig.resultActions.push(new ResultAction(ResultActionType.GAINMONEY, "600"));


  }

  generateResultActionsBad() {

    //14
    this.gameConfig.resultActionsBad.push(new ResultAction(ResultActionType.MONEY_INCREMENT_LOSS, "0", ResultActionType.GAME_OVER));
    this.gameConfig.resultActionsBad.push(new ResultAction(ResultActionType.MONEY_INCREMENT_LOSS, "0", ResultActionType.GAME_OVER));
    this.gameConfig.resultActionsBad.push(new ResultAction(ResultActionType.MONEY_INCREMENT_LOSS, "0", ResultActionType.GAME_OVER));
    this.gameConfig.resultActionsBad.push(new ResultAction(ResultActionType.MONEY_INCREMENT_LOSS, "0", ResultActionType.GAME_OVER));
    this.gameConfig.resultActionsBad.push(new ResultAction(ResultActionType.MONEY_LOSS_PERCENT, "50", ResultActionType.GAME_OVER));
    this.gameConfig.resultActionsBad.push(new ResultAction(ResultActionType.MONEY_LOSS_PERCENT, "50", ResultActionType.GAME_OVER));
    this.gameConfig.resultActionsBad.push(new ResultAction(ResultActionType.MONEY_LOSS_PERCENT, "25"));
    this.gameConfig.resultActionsBad.push(new ResultAction(ResultActionType.MONEY_LOSS_PERCENT, "25"));
    this.gameConfig.resultActionsBad.push(new ResultAction(ResultActionType.MONEY_LOSS_PERCENT, "25", ResultActionType.GAME_OVER));
    this.gameConfig.resultActionsBad.push(new ResultAction(ResultActionType.MONEY_LOSS_PERCENT, "50"));
    this.gameConfig.resultActionsBad.push(new ResultAction(ResultActionType.MONEY_LOSS_PERCENT, "50"));
    this.gameConfig.resultActionsBad.push(new ResultAction(ResultActionType.MONEY_LOSS_PERCENT, "50", ResultActionType.GAME_OVER));
    this.gameConfig.resultActionsBad.push(new ResultAction(ResultActionType.MONEY_LOSS_PERCENT, "100", ResultActionType.GAME_OVER));
    this.gameConfig.resultActionsBad.push(new ResultAction(ResultActionType.MONEY_LOSS_PERCENT, "100", ResultActionType.GAME_OVER));

    //5
    this.gameConfig.resultActionsBad.push(new ResultAction(ResultActionType.MONEY_INCREMENT_LOSS, "500", ResultActionType.GAME_OVER));
    this.gameConfig.resultActionsBad.push(new ResultAction(ResultActionType.MONEY_INCREMENT_LOSS, "1000", ResultActionType.GAME_OVER));
    this.gameConfig.resultActionsBad.push(new ResultAction(ResultActionType.MONEY_INCREMENT_LOSS, "1500", ResultActionType.GAME_OVER));
    this.gameConfig.resultActionsBad.push(new ResultAction(ResultActionType.MONEY_INCREMENT_LOSS, "2000"));
    this.gameConfig.resultActionsBad.push(new ResultAction(ResultActionType.MONEY_INCREMENT_LOSS, "3000"));

    //10

    this.gameConfig.resultActionsBad.push(new ResultAction(ResultActionType.MONEY_INCREMENT_LOSS, "1000"));
    this.gameConfig.resultActionsBad.push(new ResultAction(ResultActionType.MONEY_INCREMENT_LOSS, "1000"));
    this.gameConfig.resultActionsBad.push(new ResultAction(ResultActionType.MONEY_INCREMENT_LOSS, "1250"));
    this.gameConfig.resultActionsBad.push(new ResultAction(ResultActionType.MONEY_INCREMENT_LOSS, "2500"));
    this.gameConfig.resultActionsBad.push(new ResultAction(ResultActionType.MONEY_INCREMENT_LOSS, "700"));
    this.gameConfig.resultActionsBad.push(new ResultAction(ResultActionType.MONEY_INCREMENT_LOSS, "700"));
    this.gameConfig.resultActionsBad.push(new ResultAction(ResultActionType.MONEY_INCREMENT_LOSS, "1000"));
    this.gameConfig.resultActionsBad.push(new ResultAction(ResultActionType.MONEY_INCREMENT_LOSS, "1500"));
    this.gameConfig.resultActionsBad.push(new ResultAction(ResultActionType.MONEY_INCREMENT_LOSS, "2000"));
    this.gameConfig.resultActionsBad.push(new ResultAction(ResultActionType.MONEY_INCREMENT_LOSS, "3000"));

    //10
    for (let i = 1; i <= 5; i++) {
      this.gameConfig.resultActionsBad.push(new ResultAction(ResultActionType.MONEY_INCREMENT_LOSS, "250"));
      this.gameConfig.resultActionsBad.push(new ResultAction(ResultActionType.MONEY_INCREMENT_LOSS, "800"));
    }


    for (let i = 1; i <= 5; i++) { //25
      let val1 = i * 100;
      let val2 = (i * 100) + 50;
      let val3 = (i * 100) - 50;
      let val4 = val1;
      this.gameConfig.resultActionsBad.push(new ResultAction(ResultActionType.MONEY_INCREMENT_LOSS, val1.toString()));
      this.gameConfig.resultActionsBad.push(new ResultAction(ResultActionType.MONEY_INCREMENT_LOSS, val2.toString()));
      this.gameConfig.resultActionsBad.push(new ResultAction(ResultActionType.MONEY_INCREMENT_LOSS, val3.toString()));
      this.gameConfig.resultActionsBad.push(new ResultAction(ResultActionType.MONEY_INCREMENT_LOSS, val4.toString()));
      this.gameConfig.resultActionsBad.push(new ResultAction(ResultActionType.MONEY_INCREMENT_LOSS, val1.toString()));
    }
    this.shuffle(this.gameConfig.resultActionsBad);

  }

  shuffle(array) {
    let currentIndex = array.length, randomIndex;

    while (currentIndex > 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      //Swap
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  }

}

/**
 * Track the current state of the game.
 */
class GameState {

  gameConfig;
  selectionItems = [];
  selectionItemsBad = [];
  selectionItemFactory = new SelectionItemFactory();
  moneyAmount = 0;
  bankAmount = 0;
  pickNumber = 0;
  gamePoint;
  spinResultActive;
  gameTransitionState = 0;//Wheel is spinning or something, user needs to wait.

  rowsBad = 8;
  colsBad = 8;

  constructor(gameConfig) {
    this.gameConfig = gameConfig;
    this.addStartingItems();
    this.addBadItems();
  }

  /**
   * Wheel wedges added to game state
   */
  addStartingItems() {
    for (var i = 0; i < this.gameConfig.resultActions.length; i++) {
      this.selectionItems[i] = this.selectionItemFactory.createSelectionItem(i, this.gameConfig.resultActions[i]);
    }
    console.log(this.selectionItems.length + " Selection Items Created");
  }


  /**
   * 'Bad' replacement wheel wedges options
   */
  addBadItems() {
    for (var i = 0; i < this.gameConfig.resultActionsBad.length; i++) {
      this.selectionItemsBad[i] = this.selectionItemFactory.createSelectionItem(i, this.gameConfig.resultActionsBad[i]);
    }
    console.log(this.selectionItemsBad.length + " Bad Selection Items Created");

  }

  /**
   * Returns Total
   * The bank amount is always safe, so if moneyAmount < 0, it doesn't substract from the total score which
   * would just be the bankAmount.
   * 
   */
  getTotal() {
    let amt = this.moneyAmount + this.bankAmount;
    if (this.moneyAmount < 0 && this.bankAmount > 0) {
      amt = this.bankAmount;
    }
    return amt
  }

  isActionAllowed() {
    return this.gameTransitionState == 0;
  }

  setTransitionStateHappening() {
    this.gameTransitionState = 1;
  }

  setTransitionStateNotHappening() {
    this.gameTransitionState = 0;
  }
}

/**
 *  Can represent a good or a bad item.
 */
class SelectionItem {
  index;
  resultAction;
  pickedAlready = false;  //Used to prevent from picking a 'bad' item twice

  constructor(index, resultAction) {
    this.index = index;
    this.resultAction = resultAction;
  }

  toString() {
    return this.index + " " + this.resultAction;
  }

  toDisplayString() {
    return this.resultAction.toDisplayString();
  }

}


class SelectionItemFactory {
  createSelectionItem(index, resultAction) {
    var item = new SelectionItem(index, resultAction);
    return item;
  }
}
