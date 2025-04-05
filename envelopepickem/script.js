/**
 * A press your luck style game
 * 
 * Coded by human and AI(Claude 3.5 Sonnet)
 * 
 * Code is not cleaned up.
 * 
 */
class EnvelopeGame {
    constructor() {
        this.totalBoxes = 64;
        this.currentScore = 0;
        this.boxIdCounter = 0;
        this.gameActive = false;
        this.boxes = [];
        this.highScores = JSON.parse(localStorage.getItem('highScores') || '[]');
        this.currPaper=null;
        this.currEnvelope=null;
        this.currValueItem=null;
        this.paperValue=null;
        this.currMode=null;


        // Static point values for each color
        this.pointValues = {
            green: [
                25000, 20000, 15000, 12500, 10000,
                2500, 2000, 1500, 1000, 900,
                800, 700, 600, 500, 400,
                300, 200, 200, 
                100, 'Game Over', 'Game Over',
                'Game Over. Lose All Points'
            ],
            yellow: [
                25000, 20000, 8000, 7000, 6000,
                5000, 4000, 3000, 2000, 1500,
                500, 400, 300, 200, 200,
                200, 200, 'Game Over', 
                'Game Over',
                'Game Over. Lose 50% Points',
                'Game Over. Lose All Points'
            ],
            red: [
                25000, 20000, 15000, 10000, 7000,
                7000, 5000, 4000, 3000, 2500,
                400, 300, 200, 
                100, 100, 100, 'Game Over', 'Game Over. Lose 50% Points',
                'Game Over. Lose 50% Points',
                'Game Over. Lose All Points',
                'Game Over. Lose All Points'
            ]
        };

        this.initializeElements();
        this.setupEventListeners();
        this.startGame();
    }

    /**
     * Initializes DOM elements and stores references to them
     */
    initializeElements() {
        this.grid = document.getElementById('boxGrid');
        this.valueList = document.getElementById('valueList');
        this.startGameBtn = document.getElementById('startGameBtn');
        this.quitBtn = document.getElementById('quitBtn');
        this.highScoresBtn = document.getElementById('highScoresBtn');
        this.messageBox = document.getElementById('messageBox');
        this.currentScoreDisplay = document.getElementById('currentScore');
        this.highScoresModal = document.getElementById('highScoresModal');
        this.highScoresList = document.getElementById('highScoresList');
        this.quitBtn.disabled = false;
        this.paperContainer = document.getElementById('paperContainer');
        
        document.getElementById('closeHighScores').addEventListener('click', () => {
            this.highScoresModal.style.display = 'none';
        });

    }

    /**
     * Sets up event listeners for game controls
     */
    setupEventListeners() {
        this.startGameBtn.addEventListener('click', () => this.startGame());
        this.quitBtn.addEventListener('click', () => this.handleEndGameRequest());
        this.highScoresBtn.addEventListener('click', () => this.showHighScores());
    }

    /**
     * Shuffles an array using Fisher-Yates algorithm
     * @param {Array} array - The array to shuffle
     * @returns {Array} The shuffled array
     */
    shuffle(array) {
        let currentIndex = array.length;
        while (currentIndex > 0) {
            const randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    }
    
    /**
     * Creates a new envelope box element
     * @param {string} color - Color of the envelope (green, yellow, or red)
     * @param {number|string} value - Point value or game over message
     * @returns {HTMLElement} The created box element
     */
    createBox(color, value) {
        const box = document.createElement('div');
        box.className = 'box';
        box.id = this.boxIdCounter++;
        box.innerHTML = `
            <div class="box-inner">
                <div class="envelope-front"></div>
                <div class="envelope-flap"></div>
                <div class="envelope-inner-back"></div>
                <div class="envelope-paper-in"></div>
            </div>`;

        // Store color and value as data attributes
        box.dataset.color = color;
        box.dataset.value = value;

        // Add click handler
        box.addEventListener('click', () => this.handleBoxClick(box));
        return box;
    }

    /**
     * Initializes or resets the game state
     * Creates and shuffles envelopes, resets score and UI
     */
    initializeGame() {
        this.boxes = [];
        this.currentScore = 0;
        this.currValueItem=null;
        this.boxIdCounter = 0;
        this.currEnvelope=null;
        this.currMode="PICKBOX";
        this.updateScore();
        
        // Create envelopes with colors and values
        let boxConfigs = [];

        // Add envelopes for each color with their predefined values
        ['red', 'yellow', 'green'].forEach(color => {
            let values = [...this.pointValues[color]];
            values.forEach(value => {
                boxConfigs.push({ color, value });
            });
        });

        // Shuffle and create boxes
        this.shuffle(boxConfigs).forEach(config => {
            const box = this.createBox(config.color, config.value);
            this.boxes.push({ element: box, ...config });
        });

        // Clear and populate grid
        this.grid.innerHTML = '';
        this.boxes.forEach(box => this.grid.appendChild(box.element));

        // Reset the game state
        this.startGameBtn.style.display = 'inline-block';
        this.quitBtn.style.display = 'none';
        this.messageBox.textContent = "Click 'Start Game' to start a new game.";
        if (this.currPaper) {
            this.currPaper.remove();
        }
        this.currPaper=null;
        this.paperValue=null;

        // Update value list
        this.updateValueList();
    }

    /**
     * Updates the value list display showing available values for each color
     * Sorts and displays values in columns by color
     */
    updateValueList() {
        this.valueList.innerHTML = '';
        
        // Create columns
        const columns = {
            green: document.createElement('div'),
            yellow: document.createElement('div'),
            red: document.createElement('div')
        };
        
        columns.green.className = 'value-column value-column-green';
        columns.yellow.className = 'value-column value-column-yellow';
        columns.red.className = 'value-column value-column-red';
        
        // Sort boxes by color and value
        const sortedBoxes = {
            green: [],
            yellow: [],
            red: []
        };
        
        this.boxes.forEach(box => {
            sortedBoxes[box.color].push(box);
        });

        let getBoxValue = (box) => {
            if (box.value === 'Game Over') {
                return -1;
            } else if (box.value === 'Game Over. Lose 50% Points') {
                return -2;
            } else if (box.value === 'Game Over. Lose All Points') {
                return -3;
            }
            return box.value; // Point Value
        };
            
        // Sort each color group
        ['green', 'yellow', 'red'].forEach(color => {
            sortedBoxes[color].sort((a, b) => {
                // Sort numbers in descending order
                return getBoxValue(b) - getBoxValue(a);
            });
            
            // Create items for this color
            sortedBoxes[color].forEach(box => {
                const item = document.createElement('div');
                item.className = 'value-item';
                if (box.element.classList.contains('opened')) {
                    item.classList.add('opened');
                }
                item.textContent = box.value;
                item.dataset.boxId = box.element.id;
                columns[color].appendChild(item);
            });
        });
        
        // Add columns to value list
        this.valueList.appendChild(columns.green);
        this.valueList.appendChild(columns.yellow);
        this.valueList.appendChild(columns.red);
    }

    /**
     * Starts a new game
     * Initializes game state and updates UI for game start
     */
    startGame() {
        this.initializeGame();
        this.gameActive = true;
        this.startGameBtn.style.display = 'none';
        this.quitBtn.style.display = 'inline-block';
        this.messageBox.textContent = 'Select an envelope to reveal its value.';
    }

    /**
     * Creates a paper element that appears when an envelope is opened
     * @param {string} color - Color of the paper
     * @param {number|string} value - Value or message on the paper
     * @param {number} xpos - X position for the paper
     * @param {number} ypos - Y position for the paper
     * @returns {HTMLElement} The created paper element
     */
    createPaper(color, value,xpos,ypos) {
        const paper = document.createElement('div');
        paper.style.top = ypos-120 + "px";
        paper.style.left = xpos -30+ "px";
        paper.className = 'paper';
        paper.addEventListener('click', () => this.handlePaperClick());
        paper.innerHTML = `
            <div class="paper-front ${color}"></div>
            <div class="paper-back ${color}">${value}</div>`;
        return paper;
    }

    /**
     * Handles click events on envelope boxes
     * @param {HTMLElement} box - The clicked box element
     */
    handleBoxClick(box) {
        if (!this.gameActive) return;
        if (this.currMode=="PICKBOX") {
            this.handleOpenEnvelope(box);
        } else if (this.currMode=="REMOVEPAPER") {
            this.handleRemoveRevealedPaper();
        } else if (this.currMode=="REVEALPAPEROPTION" && box.id==this.currEnvelope.id) {
            this.currMode="NEXTSTEP";
            this.handleRevealPaper();
        }
    }

    /**
     * Handles click events on the revealed paper
     */
    handlePaperClick() {
        if (!this.gameActive) return;
        if (this.currMode=="REMOVEPAPER") {
            this.handleRemoveRevealedPaper();
        }
    }


    /**
     * Handles the envelope opening animation and reveals the paper
     * @param {HTMLElement} box - The envelope box to open
     */
    handleOpenEnvelope(box) {
       
        if (this.currMode!="PICKBOX") return;
        if (box.classList.contains('opened')) return;
        this.currMode="CONTINUEORNOT";

        const color = box.dataset.color;
        const value = box.dataset.value;
        const boxId = box.id;

        // Remove any existing paper
        const existingPaper = document.querySelector('#paperContainer .paper');
        if (existingPaper) {
            existingPaper.remove();
        }

        // Create and show new paper
        const rect = box.getBoundingClientRect();
        let xPos=rect.left;
        let yPos=rect.top;
        this.currPaper = this.createPaper(color, value,xPos,yPos);//XXX don't recreate each time!
        this.paperValue=value;

        document.getElementById('paperContainer').appendChild(this.currPaper);



        this.currValueItem = document.querySelector(`.value-item[data-box-id="${boxId}"]`);

        // Show overlay
       // this.overlay.classList.add('active');

        // Mark as opened
        var paperShowClass=`paper-show-${color}`;
        box.classList.add(paperShowClass);
        box.classList.add('opened');
        this.currEnvelope=box;
        setTimeout(() => {
        this.currMode="REVEALPAPEROPTION";
        }, 1000);

        //this.handleFlipPaper();
        this.displayQuitOptionMessage();

    }

    /**
     * Handles the paper reveal animation and processes the value
     * Temporarily disables the quit button during processing
     */
    handleRevealPaper() {
        console.log("handleRevealPaper");
        // Disable quit button during paper processing
        this.quitBtn.disabled = true;
        this.currEnvelope.classList.add('paper-show-empty');
        this.currEnvelope.classList.remove('paper-show-green');
        this.currEnvelope.classList.remove('paper-show-yellow');
        this.currEnvelope.classList.remove('paper-show-red');
           

            this.currPaper.classList.add('visible');
            setTimeout(() => {
                this.currPaper.classList.add('flipped');
                setTimeout(() => {
                    this.processPaperValue(this.paperValue);
                }, 800);
                
            }, 1100);


    }

    /**
     * Displays message prompting user to reveal paper or quit
     */
    displayQuitOptionMessage() {
        this.messageBox.textContent = 'Reveal the value of the card or quit with '+this.currentScore+" points.";
    }

    /**
     * Displays message prompting user to select another envelope or quit
     */
    displayQuitOptionMessage2() {
        this.messageBox.textContent = 'Select an envelope, or quit with '+this.currentScore+" points.";
    }

    /**
     * Removes the revealed paper and resets for next selection
     */
    handleRemoveRevealedPaper() {
        console.log("Remove Revealed Paper")
        this.currPaper.remove();
        this.currPaper=null;
        this.paperValue=null;
        this.currMode="PICKBOX";
        this.displayQuitOptionMessage2();
    }

    /**
     * Processes the revealed paper value
     * Updates score or handles game over conditions
     * @param {number|string} value - The value to process
     */
    processPaperValue(value) {
        this.currMode="REMOVEPAPER";
        // Re-enable quit button after paper processing
        this.quitBtn.disabled = false;
        console.log("processPaperValue");
        this.currValueItem.classList.add('opened');
        this.paperValue=null;
        // Update score if it's a number
        const numValue = parseInt(value);
        if (!isNaN(numValue)) {
            this.currentScore += numValue;
            this.updateScore();
            this.displayQuitOptionMessage2();
           
           
        } else {
            // Handle game over conditions
            if (value.includes('Lose All Points')) {
                this.currentScore = 0;
            } else if (value.includes('Lose 50%')) {
                this.currentScore = Math.floor(this.currentScore / 2);
            }
            this.updateScore();
            this.endGame();
        }
    }

    skipBox() {
        this.messageBox.textContent = 'Click another envelope or quit the game.';
        const selectedEnvelope = document.querySelector('.box.selected');
        if (selectedEnvelope) {
            selectedEnvelope.classList.remove('selected');
            selectedEnvelope.classList.remove('center-content');
        }
    }

    /**
     * Updates the score display
     */
    updateScore() {
        this.currentScoreDisplay.textContent = this.currentScore;
    }

    /**
     * Handles quit button click
     * Only processes if quit button is enabled
     */
    handleEndGameRequest() {
        if (!this.quitBtn.disabled) {
            this.endGame();
        }
    }

    /**
     * Ends the game and updates high scores
     * @param {boolean} quit - Whether the game was ended by quitting
     */
    endGame(quit = false) {
        this.gameActive = false;
        this.highScores.push(this.currentScore);
        this.highScores.sort((a, b) => b - a);
        this.highScores = this.highScores.slice(0, 10);
        localStorage.setItem('highScores', JSON.stringify(this.highScores));
        console.log(this.paperValue);
        let nextValue='';
        if (this.paperValue) {
            nextValue="The unrevealed card contained: " + this.paperValue;
        }

        const endMessage = `Game ended. ${nextValue}`;
        this.messageBox.innerHTML = `${endMessage}`;
        this.quitBtn.style.display = 'none';
        this.startGameBtn.style.display = 'inline-block';
        this.showHighScores();
    }

    /**
     * Displays the high scores modal
     */
    showHighScores() {
        this.highScoresList.innerHTML = this.highScores
            .map((score, index) => `<p>${index + 1}. ${score}</p>`)
            .join('');
        this.highScoresModal.style.display = 'block';
    }

}

// Initialize game
const game = new EnvelopeGame();
