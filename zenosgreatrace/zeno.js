

import { iterateMessages, getStartMessage, loadMsgs, getSupplementalInstructions, getWinMsg, getBrokenMsg } from './zenomessagemanager.js';

let aPoint = 0;
let rPoint = 100;

let aCurrSpeed = 0;
let rCurrSpeed = 0;
let iteration = 0;
let raceOver = false;
let currMsg;
let supplementalInstructions;
let rPlace = "1st";
let aPlace = "2nd";
let rDistanceFromLeader;
let aDistanceFromLeader;

let aSpeed = 40;
let rSpeed = 20;
let runButtonElem = '';
let moveAllowed = false;
let maxIterationsExpected = 52;
let moveDelay = 2000;
let errantMath;


export function startGame() {
  console.log("New Game");


  aPoint = 0;
  rPoint = 100;
  aCurrSpeed = 0;
  rCurrSpeed = 0;
  iteration = 0;
  raceOver = false;
  currMsg = '';
  supplementalInstructions = '';
  rPlace = "1st";
  aPlace = "2nd";
  rDistanceFromLeader = 0;
  aDistanceFromLeader = 0;
  errantMath = '';

  loadMsgs();
  runButtonElem = document.getElementById("Run");
  currMsg = getStartMessage();
  identifyRunnerPlaces();
  identifyDistanceFromLeader();
  allowMove();
  supplementalInstructions = '';

  moveAllowed = true;
}

function getDistanceFromAtoR() {
  return rPoint - aPoint;
}

function getDistanceFromRtoA() {
  return aPoint - rPoint;
}

export function getStatus() {
  return {
    iteration, iteration,
    aPoint: formatPreciseNumber(aPoint),
    rPoint: formatPreciseNumber(rPoint),
    distance: getDistanceFromAtoR(),
    raceOver: raceOver,
    aSpeed: aCurrSpeed,
    rSpeed: rCurrSpeed,
    aPlace: aPlace,
    rPlace: rPlace,
    currMsg: currMsg,
    rDistanceFromLeader: rDistanceFromLeader,
    aDistanceFromLeader: aDistanceFromLeader,
    supplementalInstructions: supplementalInstructions
  }
}



export function printCurrentRaceStatus() {
  console.log(getStatus());
}

export function move() {
  //is move allowed
  if (!moveAllowed) {
    console.log("Move Not Allowed Yet");
    return false;
  }
  // Determine what the speed they will run at.
  rCurrSpeed = rSpeed;
  aCurrSpeed = aSpeed;
  //Do Move
  moveAllowed = false;
  iteration++;
  moveRunners();
  identifyRunnerPlaces();
  identifyDistanceFromLeader();
  currMsg = iterateMessages();
  supplementalInstructions = getSupplementalInstructions();
  //Post Move
  if (checkIfWon()) {
    setGameAsEnded();
  } else {
    if (iteration > maxIterationsExpected) {
      currMsg = getBrokenMsg();
    }
    dontLetThemMoveToFast();
  }
  printCurrentRaceStatus();

}

function identifyDistanceFromLeader() {
  rDistanceFromLeader = formatPreciseNumber(getDistanceFromAtoR());
  aDistanceFromLeader = "N/A";
  if (rDistanceFromLeader == 0) {
    rDistanceFromLeader = "N/A";
    aDistanceFromLeader = "N/A";
  } else if (rDistanceFromLeader > 0) {
    aDistanceFromLeader = formatPreciseNumber(rDistanceFromLeader * -1);
    rDistanceFromLeader = "N/A";
  }

}

function formatPreciseNumber(num) {
  let n = num.toFixed(20)//force to be up to 20 digits
  //lets trim trailing 0s.
  let n2 = n.replace(/0+$/, "");
  //if last digit is a . then lets remove that.
  n2 = n2.replace(/\.$/, "");
  return n2;

}

function identifyRunnerPlaces() {
  if (rPoint > aPoint) {
    rPlace = "1st";
    aPlace = "2nd";
  } else if (rPoint < aPoint) {
    rPlace = "2nd";
    aPlace = "1st";
  } else {
    rPlace = "Tie";
    aPlace = "Tie";
  }
}

function moveRunners() {
  let timeToCatchUp = movePerson();
  moveOpponent(timeToCatchUp);
}

function checkIfWon() {
  return getDistanceFromAtoR() <= 0;
}

function dontLetThemMoveToFast() {
  preventMove();
  setTimeout(allowMove, moveDelay);
}

function setGameAsEnded() {
  preventMove();
  supplementalInstructions = '';
  currMsg=errantMath+"? Well I guess so... ";
  currMsg += getWinMsg();
  raceOver = true;
}

function preventMove() {
  //Make sure fade is the class and fadeIn isn't in list
  runButtonElem.classList.remove("fadeIn");
  runButtonElem.classList.add("fade");
  //toggle button
  runButtonElem.disabled = true;
}

function allowMove() {
  //Make sure fadeIn is the class and fade isn't in list
  runButtonElem.classList.remove("fade");
  runButtonElem.classList.add("fadeIn");
  //toggle button
  moveAllowed = true;
  runButtonElem.disabled = false;
}

function movePerson() {
  let moveDistance = getDistanceFromAtoR();
  let timeToCatchUp = moveDistance / aSpeed;
  aPoint += moveDistance;
  return timeToCatchUp;
}

function moveOpponent(timeToRun) {
  let tmpRpoint=rPoint;
  let moveDistance = timeToRun * rSpeed;
  //199.99999999999994315658+=0.00000000000001421085 No change
  rPoint += moveDistance;
  if (rPoint==tmpRpoint) {
    errantMath=formatPreciseNumber(rPoint)+" + "+formatPreciseNumber(moveDistance) + " = "+formatPreciseNumber(rPoint);
    console.log("ERRANT MATH: "+errantMath);
  }
}
/**
 * Ending the game depends on floating arithmetic
 * being inprecise enough and going to 0.
 * 
 * Should end at iteration 52
 * 
 * Javascript at this time is  IEEE 754 and 64 bit floating point format
 */
