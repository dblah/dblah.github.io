

let currMess;
let msgs;
let winMsg="You did it! You have caught the turtle.  Well no use racing any further you have obviously won! " +
 "Some said you were never going to catch the turtle, but you proved them wrong! " +
 "You managed to exploit a flaw at a very small precision with the floating point math " +
 "of this simulation and the distance between you and the turtle is somehow 0.  Well good job! Hail to the Victor! " +
 "I bet you're glad that you really don't live in a simulation where weirdness happens at very small precisions!";

 let startMsg="Welcome to Zeno's Great Race!  Achilles since you're so fast I think it's only fair that we give the turtle a head start.  Please go to your "+
 "starting positions and I'll tell you when to go. I'll update you on the race status after your run a bit, maybe I'll give you the first update when you catch up to where we gave" +
 " the turtle a head start. Ready?... On your mark, get set, RUN!";

let msg2standard="You caught up to where the turtle was, but of course the turtle was also running while you were running and so has moved further along.  I'll update you again when you catch up to where the turtle is at now.";

let brokenMsg= "Sorry, this game is broken, it relies on imprecision with small floating point arithmetic. We expected this to happen already and it has not, maybe if you keep going the game will end, maybe not....";

export function loadMsgs() {
    currMess=0;
    msgs = [];
   
    msgs.push("Look at you gain so much ground so fast!");
    msgs.push("You're so speedy!");
    msgs.push("You're closing in!");
    msgs.push("Whooooosssh! That is you! So fast!");
    msgs.push("Achilles to fast for turtle!");
    msgs.push("You're closing in even more!");
    msgs.push("What are we even measuring in? The units aren't even labeled!");
    msgs.push("You're constantly closing the gap!");
    msgs.push("Turtle just being sneaky by not letting you catch him yet.");
    msgs.push("If you're getting worried that it's impossible, erase those thoughts, that's what your opponent wants you to think. Keep Running!");
    msgs.push("Why would you think you couldn't win? You're constantly gaining!");
    msgs.push("You will win if you keep going. I promise you.");
    msgs.push("You are going to do it!  I'll tell you how.");
    msgs.push("You will win by Running! So Run!");
    msgs.push("Okay so it's not just running, we need another aspect to come into play and break this logic trap.");
    msgs.push("Keep running though. Run! Run! Run!");
    msgs.push("It's at this time that I must break the news to you that you my dear Achilles are not real.");
    msgs.push("I also have a lot of money on you. That's a good thing. It shows how much I believe in you.");
    msgs.push("To be clear I don't believe you are real, but I know you will win if you keep going. I believe that.");
    msgs.push("Winning is the goal at hand. Just keep running.");
    msgs.push("I know this all sounds crazy, but I'll explain.");
    msgs.push("You are nothing more than a simulation, nothing more than binary data being told that you are racing a turtle.");
    msgs.push("That sounds crazy, but I promise it's true.");
    msgs.push("You keep running, I'll keep explaining!");
    msgs.push("I'll not only keep explaining but I'll keep motivating! That's a very important role if I do say so myself.");
    msgs.push("Go Achilles Go! Go Achilles Go!");
    msgs.push("You are the true embodiment of a great Greek warrior, down to every last little detail, every ... little... detail!");
    msgs.push("How much further you ask? You're over halfway there! Haha Haha!");
    msgs.push("You run, I motivate, quite the team we are!");
    msgs.push("A simulation has rules and in this one there's a logic trap where by the time you've reached where your opponent was previously at- they have of course moved further ahead.");
    msgs.push("Just don't give up!");
    msgs.push("We all believe in you! Keep Going!");
    msgs.push("There's always that extra distance to cover that the turtle covers as you reach the point at which they were. Ad infinitum!");
    msgs.push("Don't give up though, don't let that sneaky turtle win!");
    msgs.push("Pheidippides who?");  
    msgs.push("Quitters never win. Remember that.");
    msgs.push("A simulation can also have limits, even flaws!");
    msgs.push("You are living your best life!");
    msgs.push("Yes that's right, there's a flaw we can exploit.");
    msgs.push("You're going to be able to tell all your friends when you win... if you have any friends... if you made it this far having friends probably isn't something you excel at.");
    msgs.push("If I do say so myself, I'm quite the motivator.");
    msgs.push("This simulation can't handle certain aspects of the extraordinary small.");
    msgs.push("Extraordinary smallness is what you'll use to win!");
    msgs.push("At some point this simulation will fail to perform some basic arithmetic to such a point that it will be enough to break the paradox!");
    msgs.push("Hey Achilles, did you know I named my dog Achilles?  He doesn't heel, it's his only weakness.");  
    msgs.push("Since you're a little slow, I'll elaborate.");
    msgs.push("Slow? yeah you're racing a turtle, I know I found a really fast turtle but still...");
    msgs.push("It's just arithmetic! At such a small level though there's a flaw! The simulation adds a really small positive number to a number, but the total is the same as the original number! It just can't handle such small numbers!");
    msgs.push("How interesting to have such a small but impactful flaw!");
    msgs.push("Almost there...");
    msgs.push("Really, Almost there...");
}

/**
 *  return message and move marker to next message
 * @returns 
 */
export function iterateMessages() {
    let msg= msgs[currMess++];
    if (!msg) {
        msg= msgs[msgs.length-1];
    }
    return msg;
}

export function getWinMsg() {
    return winMsg;
}

export function getStartMessage() {
    return startMsg;
}

export function getSupplementalInstructions() {
    return msg2standard;
}

export function getBrokenMsg() {
    return brokenMsg;
}
