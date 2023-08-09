class InputDevice {
    #newState //whether should update to new program state on interaction, can be false or string representing new state
    bounding
    constructor(newMode,newBounding) {
        this.#newState = newMode;
        this.bounding = newBounding;
    }
    render(canvas) {
        throw new Error("Render method must be implemented!")
    }
    overlapping(input) {
        var intersections = 0;
        for (let i = 0; i < this.bounding.length; i++) {
            const a = this.bounding[i];
            const b = this.bounding[(i + 1) % this.bounding.length];
            if (((input[0] < a[0] && input[0] < b[0]) || (input[0] > a[0] && input[0] > b[0]))) {
                continue;
            } else {
                const segmentSlope = (a[1] - b[1]) / (a[0] - b[0]);
                const y = segmentSlope*(input[0] - a[0]) + a[1];
                if (y < input[1]) intersections++;
            }
        }
        return intersections % 2 == 1;
    }
    update(input) {
        throw new Error("Update method must be implemented!");
    }
    newState() {
        return this.#newState;
    }
}

class Button extends InputDevice {
    x;
    y;
    size;

    constructor(newMode, x, y, scale){
        var newBounding = [];
        for (let i = 1; i <= 6; i++) {
            const angle = (Math.PI / 3) * i;
            const x1 = x + scale * Math.cos(angle);
            const y1 = y + scale * Math.sin(angle);
            newBounding.push([x1,y1]);
        }
        super(newMode,newBounding);
        this.x = x;
        this.y = y;
        this.size = scale;
    }

    render(canvasHandler,color = 'default') {
        if (color == 'default') color = (displaySettings.darkMode?'gray':'white');
        const context = canvasHandler.canvas.get(0).getContext('2d');
        // Draws the hexagon outline
        context.beginPath();
        let coordinates = canvasHandler.convertRelativeToCanvas(this.bounding[0]);
        context.moveTo(...coordinates);
  
        for (let i = 1; i < this.bounding.length; i++) {
            coordinates = canvasHandler.convertRelativeToCanvas(this.bounding[i]);
            context.lineTo(...coordinates);
        }
  
        context.closePath();

        context.fillStyle = color;
        context.fill();
        
    }

    update(input) {
        return;
    }
}

class Switch extends InputDevice {
    //for dark/light mode, i.e.
    leftHex;
    rightHex;
    toggle;

    constructor(newMode, x, y, scale, color = 'white'){
        var newBounding = [];
        var leftHex = [];
        var rightHex = [];
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i + (2 * Math.PI / 3);
            const x1 = x + scale * Math.cos(angle);
            const y1 = y + scale * Math.sin(angle);
            leftHex.push([x1,y1]);
            if(i<3){
                newBounding.push([x1,y1]);
            }
        }
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - (Math.PI / 3);
            const x1 = x + scale * (Math.cos(angle)+1);
            const y1 = y + scale * Math.sin(angle);
            rightHex.push([x1,y1]);
            if(i<3){
                newBounding.push([x1,y1]);
            }
        }
        super(newMode,newBounding);
        this.x = x;
        this.y = y;
        this.size = scale;
        this.leftHex = leftHex;
        this.rightHex = rightHex;
        this.toggle = false;
        this.color = color;
    }
    render(canvasHandler) {
        const context = canvasHandler.canvas.get(0).getContext('2d');
        // Draws the switch container outline
        context.beginPath();
        let coordinates = canvasHandler.convertRelativeToCanvas(this.bounding[0]);
        context.moveTo(...coordinates);
  
        for (let i = 1; i < this.bounding.length; i++) {
            coordinates = canvasHandler.convertRelativeToCanvas(this.bounding[i]);
            context.lineTo(...coordinates);
        }
  
        context.closePath();

        context.fillStyle = this.toggle ? 'gray': this.color;
        context.fill();
        
        // Draws the switch nob
        let nobBounding = [];
        nobBounding = this.toggle ? this.rightHex : this.leftHex;
        context.lineWidth = 5;
        context.strokeStyle = 'black';
        context.beginPath();
        coordinates = canvasHandler.convertRelativeToCanvas(nobBounding[0]);
        context.moveTo(...coordinates);
  
        for (let i = 1; i < nobBounding.length; i++) {
            coordinates = canvasHandler.convertRelativeToCanvas(nobBounding[i]);
            context.lineTo(...coordinates);
        }
  
        context.closePath();
        context.stroke();

        context.fillStyle = this.color;
        context.fill();
    }
    update(input){
        this.toggle = !this.toggle;
        displaySettings.darkMode = this.toggle;
        displaySettings.updateDarkMode();
    }
}

class Tile extends Button {
    letter;
    territoryOf;
    isCapital;

    constructor(letter, x, y, scale, player = 0) {
        super(false, x, y, scale);
        this.letter = letter;
        this.territoryOf = player;   //tiles are owned by a player
    }

    //hexagon with letter
    #renderFull (canvasHandler,currentPlayer,renderMode = 0) {
        const context = canvasHandler.canvas.get(0).getContext('2d');
        let color = 'white';
        if (renderMode == 1) {
            //selected tile
            color = displaySettings.playerColors[currentPlayer];
        }else if(renderMode == 2){
            //adjacent to selected tile
            super.render(canvasHandler,"white");
            color = displaySettings.playerColors[currentPlayer];
            context.filter = "opacity(25%)";    //this causes the main color to max out and the other colors to make the tile seem more white
        } else if (renderMode == 3) {
            color = 'gray';
        }
        super.render(canvasHandler,color);
        context.filter = "none"

        // Add the letter in the middle of the hexagon
        let coordinates = canvasHandler.convertRelativeToCanvas([this.x,this.y])
        //maximum coefficient: 1440
        //minimum coefficient: 540
        let fontSize = Math.round((540 + displaySettings.fontSize*900)*this.size);
        context.fillStyle = renderMode==1 ? 'white' : 'black';
        context.font = 'bold ' + fontSize+'px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(this.letter, coordinates[0], coordinates[1]);
    }
    //hexagon without letter
    #renderEmpty (canvasHandler,currentPlayer,renderMode = 0) {
        const context = canvasHandler.canvas.get(0).getContext('2d');
        // Draws the hexagon outline
        context.beginPath();
        let coordinates = canvasHandler.convertRelativeToCanvas(this.bounding[0]);
        context.moveTo(...coordinates);

        for (let i = 1; i < this.bounding.length; i++) {
            coordinates = canvasHandler.convertRelativeToCanvas(this.bounding[i]);
            context.lineTo(...coordinates);
        }

        context.closePath();
        
        if (this.territoryOf) {
            let color = displaySettings.playerColors[this.territoryOf - 1];
            if(renderMode == 2){
                context.fillStyle = "white";
                context.fill();
                color = displaySettings.playerColors[currentPlayer];
                context.filter = "opacity(25%)";    //this causes the main color to max out and the other colors to make the tile seem more white
            }
            context.fillStyle = color;
            context.fill();
            context.filter = "none";
            if(this.isCapital){
                let coordinates = canvasHandler.convertRelativeToCanvas([this.x,this.y]);
                let fontSize = Math.round((540 + displaySettings.fontSize*900)*this.size);
                context.fillStyle = 'white';
                context.font = 'bold ' + fontSize+'px Arial';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillText("♔", coordinates[0], coordinates[1]);
            }
        } else {
            context.lineWidth = canvasHandler.convertRelLengthToCanvas(this.size * 0.05);
            context.stroke();
        }
    }

    //renderMode is 0 if nothing, 1 if selected and expansible, 2 if adjacent to selected, 3 if selected but not expansible
    render (canvasHandler, currentPlayer, renderMode = 0) {
        if (this.letter=='') {
            this.#renderEmpty(canvasHandler,currentPlayer,renderMode);
        } else {
            this.#renderFull(canvasHandler,currentPlayer,renderMode);
        }
    }

    get capitalOf() {
        return (this.isCapital?this.territoryOf:0);
    }
}