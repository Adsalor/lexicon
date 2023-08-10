class InputDevice {
    #newState //whether should update to new program state on interaction, can be false or string representing new state
    landscapeBounding
    portraitBounding
    wide
    constructor(newMode,portraitBounding,landscapeBounding=portraitBounding) {
        this.#newState = newMode;
        this.landscapeBounding = landscapeBounding;
        this.portraitBounding = portraitBounding;
        this.wide=false;
    }
    get bounding(){
        return this.wide ? this.landscapeBounding : this.portraitBounding;
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

    changeBounding(){  //changes the bounding from portrait to landscape (or vice versa)
        for (let i = 0; i < this.bounding.length; i++) {
            const temp = this.bounding[i][0];
            this.bounding[i][0]=this.bounding[i][1];
            this.bounding[i][1]=temp;
        }
    }
}

class Button extends InputDevice {
    xPortrait;
    xLandscape;
    yPortrait;
    yLandscape;
    size;

    constructor(newMode, xPortrait, yPortrait, scale,xLandscape=xPortrait,yLandscape=yPortrait){
        var portraitBounding = [];
        for (let i = 1; i <= 6; i++) {
            const angle = (Math.PI / 3) * i;
            const x1 = xPortrait + scale * Math.cos(angle);
            const y1 = yPortrait + scale * Math.sin(angle);
            portraitBounding.push([x1,y1]);
        }
        var landscapeBounding = [];
        for (let i = 1; i <= 6; i++) {
            const angle = (Math.PI / 3) * i;
            const x1 = xLandscape + scale * Math.cos(angle);
            const y1 = yLandscape + scale * Math.sin(angle);
            landscapeBounding.push([x1,y1]);
        }
        super(newMode,portraitBounding,landscapeBounding);
        this.xPortrait = xPortrait;
        this.xLandscape = xLandscape;
        this.yPortrait = yPortrait;
        this.yLandscape = yLandscape;
        this.size = scale;
    }
    get x() {
        return this.wide ? this.xLandscape : this.xPortrait;
    }
    set x(newX){
        this.xPortrait=newX;
    }
    get y() {
        return this.wide ? this.yLandscape : this.yPortrait;
    }
    set y(newY){
        this.yPortrait=newY;
    }
    changeBounding(){
        super.changeBounding();
        const temp = this.x;
        this.x=this.y;
        this.y=temp;
    }

    render(canvasHandler,color = 'default') {
        if(canvasHandler.wide!=this.wide){
            //this.changeBounding();
            this.wide=canvasHandler.wide;
        }
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
    leftHexPortrait;
    rightHexPortrait;
    leftHexLandscape;
    rightHexLandscape;
    toggle;

    constructor(newMode, xPortrait, yPortrait, scale, color = 'white',xLandscape=xPortrait,yLandscape=yPortrait){
        var portraitBounding = [];
        var landscapeBounding = [];
        var leftHexPortrait = [];
        var rightHexPortrait = [];
        var leftHexLandscape = [];
        var rightHexLandscape = [];
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i + (2 * Math.PI / 3);
            const x1 = xPortrait + scale * Math.cos(angle);
            const y1 = yPortrait + scale * Math.sin(angle);
            leftHexPortrait.push([x1,y1]);
            if(i<3){
                portraitBounding.push([x1,y1]);
            }
        }
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - (Math.PI / 3);
            const x1 = xPortrait + scale * (Math.cos(angle)+1);
            const y1 = yPortrait + scale * Math.sin(angle);
            rightHexPortrait.push([x1,y1]);
            if(i<3){
                portraitBounding.push([x1,y1]);
            }
        }
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i + (2 * Math.PI / 3);
            const x1 = xLandscape + scale * Math.cos(angle);
            const y1 = yLandscape + scale * Math.sin(angle);
            leftHexLandscape.push([x1,y1]);
            if(i<3){
                landscapeBounding.push([x1,y1]);
            }
        }
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - (Math.PI / 3);
            const x1 = xLandscape + scale * (Math.cos(angle)+1);
            const y1 = yLandscape + scale * Math.sin(angle);
            rightHexLandscape.push([x1,y1]);
            if(i<3){
                landscapeBounding.push([x1,y1]);
            }
        }
        super(newMode,portraitBounding,landscapeBounding);
        this.xPortrait = xPortrait;
        this.yPortrait = yPortrait;
        this.xLandscape = xLandscape;
        this.yLandscape = yLandscape;
        this.size = scale;
        this.leftHexPortrait = leftHexPortrait;
        this.rightHexPortrait = rightHexPortrait;
        this.leftHexLandscape = leftHexLandscape;
        this.rightHexLandscape = rightHexLandscape;
        this.toggle = false;
        this.color = color;
    }
    get leftHex(){
        return this.wide ? this.leftHexLandscape : this.leftHexPortrait;
    }
    get rightHex(){
        return this.wide ? this.rightHexLandscape : this.rightHexPortrait;
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
        if(canvasHandler.wide!=this.wide){
            //this.changeBounding();
            this.wide=canvasHandler.wide;
            console.log("bounding changed");
        }
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