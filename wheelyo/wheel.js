class Wheel {
    cx = 300;
    cy = 300;
    segmentCount = 24;
    radianLength = 280;
    posOfArrowInDegrees = 315
    angleVal = 0;
    rotationSpeed = 0;
    degreesInACircle = 360;
    segmentSlice = this.degreesInACircle / this.segmentCount;
    portionAtArrow = 0;
    canvas;
    ctx;
    spinTime;
    wheelCallbackFunction;

    gameState;


    constructor(gameState, wheelCallbackFunction, canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.gameState = gameState;
        this.wheelCallbackFunction = wheelCallbackFunction;
    }

    draw() {
        this.drawSegments();
    }

    getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }


    rotate() {
        let start;
        let thisRef = this;
        this.spinTime =2000 + this.getRandomInt(4000); //Should convert over to randomly selecting the wedge vs using a random time to land on a random wedge.

        let step = function (timestamp) {
            if (!start) {
                start = timestamp;
            }
            const elapsed = timestamp - start;

            thisRef.drawSegments();
            let s = thisRef.calcSpeed(elapsed, thisRef.spinTime);
            thisRef.rotationSpeed = s;
            if (s > .01) {
                window.requestAnimationFrame(step);
            } else {
                console.log("STOP " + thisRef.angleVal + "  " + thisRef.angleVal + " " + thisRef.portionAtArrow + "  " + thisRef.gameState.selectionItems[thisRef.portionAtArrow]);
                let b = thisRef.portionAtArrow;
                thisRef.wheelCallbackFunction(b);
            }
        }

        window.requestAnimationFrame(step);
    }


    calcSpeed(timestamp, endTimestamp) {
        let vVal = endTimestamp - timestamp;
        if (vVal < 0) {
            vVal = 0;
        }
        let t = vVal / endTimestamp;
        t *= 3;
        return Math.pow(t, 2);
    }


    drawSegments() {
        var radianSize = this.degreesInACircle / this.segmentCount;
        var center = this.cx;
        this.ctx.font = "16px Arial";

        this.angleVal += this.rotationSpeed;
        this.angleVal = this.angleVal % 360;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);//CLEAR
        for (let segmentIndex = 0; segmentIndex < this.segmentCount; segmentIndex++) {
            let item = this.gameState.selectionItems[segmentIndex];
            let good = item.resultAction.isGood();

            if (good) {
                this.ctx.fillStyle = 'lightblue'
                if (segmentIndex % 2 == 0) {
                    this.ctx.fillStyle = '#4da7f6'
                }

            } else {
                this.ctx.fillStyle = 'lightgrey'
                if (segmentIndex % 2 == 0) {
                    this.ctx.fillStyle = 'grey'
                }

            }

            var r1 = (segmentIndex * radianSize);
            var r2 = r1 + radianSize;
            this.ctx.beginPath();
            this.ctx.moveTo(this.cx, this.cy);
            let degStartPt = (r1 + this.angleVal)
            let degStartPtM = degStartPt % 360;
            if (degStartPtM >= 30 && degStartPtM < 45) {
                this.portionAtArrow = segmentIndex;

            }
            let r11 = this.toRadians(degStartPt);
            this.ctx.arc(this.cx, this.cy, this.radianLength, r11, this.toRadians(r2 + this.angleVal));
            this.ctx.lineTo(this.cx, this.cy);
            this.ctx.closePath();
            this.ctx.fill();

            this.ctx.save();

            this.ctx.fillStyle = 'blue'
            if (!item.resultAction.isGood()) {
                this.ctx.fillStyle = 'red'
            }
            this.ctx.textBaseline = "middle";
            this.ctx.translate(center, center);
            this.ctx.rotate(this.toRadians(r1 + 8 + this.angleVal));
            let posAdjustment = 265 - (this.ctx.measureText(item.toDisplayString()).width);
            this.ctx.fillText("" + item.toDisplayString(), posAdjustment, 0);
            this.ctx.restore();

        }
        this.drawArrow();;
    }


    drawArrow() {
        this.ctx.fillStyle = 'green'
        let X = 324;
        let Y = 324;
        let moveToPoint = 168;
        let degrees = 45;
        let halfSize = 16;
        var height = 32 * (Math.sqrt(3) / 2);
        this.ctx.beginPath();

        let pt = this.rotatePoint(X, Y, X, Y, degrees);
        this.ctx.lineTo(pt[0] + moveToPoint, pt[1] + moveToPoint);

        pt = this.rotatePoint(X, Y, X + halfSize, Y + height, degrees);
        this.ctx.lineTo(pt[0] + moveToPoint, pt[1] + moveToPoint);
        pt = this.rotatePoint(X, Y, X - halfSize, Y + height, degrees);

        this.ctx.lineTo(pt[0] + moveToPoint, pt[1] + moveToPoint);
        this.ctx.fill();
        this.ctx.closePath();
    }

    rotatePoint(cx, cy, x, y, angle) {
        var radians = (Math.PI / 180) * angle,
            cos = Math.cos(radians),
            sin = Math.sin(radians),
            nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
            ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
        return [nx, ny];
    }

    toRadians(deg) {
        return deg * Math.PI / 180
    }
}
