/**
 * Object to track high scores
 * 
 */

class HighScoreTracker {
    MAX_TRACKED=10; 
    highScores = [];   

    HighScoreTracker() {
        this.highScores = [];   
    }

    addNewScore(score,date,props) {
        let highScore = this.createNewScore(score,date,props);
        this.highScores.push(highScore);
        this.highScores.sort((a,b) => b.score - a.score);
        this.cropScores();
        console.log(this.highScores);
    }

    cropScores() {
        if (this.highScores.length>this.MAX_TRACKED) {
            this.highScores=this.highScores.slice(0,this.MAX_TRACKED);
        }
    }

    createNewScore(score,date,props) {
        let highScore = new HighScore();
        highScore.score= score;
        highScore.props= props;
        if (!date) {
            highScore.date= new Date();
        }
        return highScore;
    }
    
    getScores() {
        return this.highScores;
    }
}

class HighScore {
    date;
    score;
    props;
}
