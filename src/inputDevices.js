//Contains base InputDevice class and all subclasses
//InputDevices are UI elements which are interactable

class InputDevice {
    #newState; //whether should update to new program state on interaction, can be false or string representing new state
    
    //to interact with it, we need to detect clicks on it
    //so it has a bounding box for landscape and portrait mode, and ability to detect which to use
    landscapeBounding;
    portraitBounding;
    wide;

    constructor(newMode,portraitBounding,landscapeBounding=portraitBounding) {
        this.#newState = newMode;
        this.landscapeBounding = landscapeBounding;
        this.portraitBounding = portraitBounding;
        this.wide=false;
    }

    //which bounding is currently active?
    get bounding(){
        return this.wide ? this.landscapeBounding : this.portraitBounding;
    }

    //'abstract' method, we love js
    render(canvas) {
        throw new Error("Render method must be implemented!")
    }

    //detect if user click overlaps bounding box
    //to do this, for each line segment of box, cast line from click position down
    //then if that line intersects segment increase count by 1
    //if count is odd, click was inside bounding box
    //see https://en.wikipedia.org/wiki/Point_in_polygon#Ray_casting_algorithm
    overlapping(input) {
        let intersections = 0;
        for (let i = 0; i < this.bounding.length; i++) {
            const a = this.bounding[i];
            const b = this.bounding[(i + 1) % this.bounding.length]; // mod by total for when i is len-1

            //if point not within line x bounds, won't intersect
            if (((input[0] < a[0] && input[0] < b[0]) || (input[0] > a[0] && input[0] > b[0]))) continue;
            else {
                //otherwise, check that the point is above the line
                const segmentSlope = (a[1] - b[1]) / (a[0] - b[0]);
                const y = segmentSlope*(input[0] - a[0]) + a[1];
                if (y < input[1]) intersections++;
            }
        }
        //odd count means intersection
        return intersections % 2 == 1;
    }

    //'abstract'
    update(input) {
        throw new Error("Update method must be implemented!");
    }

    //return the new program state that the device should cause a switch to
    newState() {
        return this.#newState;
    }
}

//buttons are the simplest input device, just a hexagon you can click on
class Button extends InputDevice {

    //store coordinates for convenience
    xPortrait;
    xLandscape;
    yPortrait;
    yLandscape;
    size;

    constructor(newMode, xPortrait, yPortrait, scale,xLandscape=yPortrait,yLandscape=xPortrait){
        //create portrait bounding box (flat-topped hex)
        let portraitBounding = [];
        for (let i = 1; i <= 6; i++) {
            const angle = (Math.PI / 3) * i;
            const x1 = xPortrait + scale * Math.cos(angle);
            const y1 = yPortrait + scale * Math.sin(angle);
            portraitBounding.push([x1,y1]);
        }
        //create landscape (pointy-topped hex)
        let landscapeBounding = [];
        for (let i = 1; i <= 6; i++) {
            const angle = (Math.PI / 3) * i + Math.PI/6;
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

    get y() {
        return this.wide ? this.yLandscape : this.yPortrait;
    }

    //render the hex
    render(canvasHandler,color = 'default') {
        this.wide = canvasHandler.wide;

        if (color == 'default') color = (displaySettings.darkMode?'gray':'white');

        const context = canvasHandler.canvas.get(0).getContext('2d');
        //draw the hex outline
        context.beginPath();
        let coordinates = canvasHandler.convertRelativeToCanvas(this.bounding[0]);
        context.moveTo(...coordinates);
  
        for (let i = 1; i < this.bounding.length; i++) {
            coordinates = canvasHandler.convertRelativeToCanvas(this.bounding[i]);
            context.lineTo(...coordinates);
        }
  
        context.closePath();

        //fill the hex
        context.fillStyle = color;
        context.fill();
        
    }

    //buttons do nothing on update, they're just inputdevices with coordinates
    update(input) {
        return;
    }
}

//Switches toggle when clicked on
//used for dark/light mode
//planned for colorblind mode but we didn't reach that feature
class Switch extends InputDevice {
    leftHexPortrait;
    rightHexPortrait;
    leftHexLandscape;
    rightHexLandscape;
    toggle;

    constructor(newMode, xPortrait, yPortrait, scale, color = 'white',xLandscape=yPortrait,yLandscape=xPortrait){
        let portraitBounding = [];
        let landscapeBounding = [];
        let leftHexPortrait = [];
        let rightHexPortrait = [];
        let leftHexLandscape = [];
        let rightHexLandscape = [];
        //bounding box is the left side of left hex and right side of right hex

        //portrait info
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i + (2 * Math.PI / 3);
            const x1 = xPortrait + scale * Math.cos(angle);
            const y1 = yPortrait + scale * Math.sin(angle);
            leftHexPortrait.push([x1,y1]);
            //add left half to overall bounds
            if(i<3){
                portraitBounding.push([x1,y1]);
            }
        }
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - (Math.PI / 3);
            const x1 = xPortrait + scale * (Math.cos(angle)+1);
            const y1 = yPortrait + scale * Math.sin(angle);
            rightHexPortrait.push([x1,y1]);
            //add right half to overall bounds
            if(i<3){
                portraitBounding.push([x1,y1]);
            }
        }

        //landscape info
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i + (2 * Math.PI / 3);
            const x1 = xLandscape + scale * Math.cos(angle);
            const y1 = yLandscape + scale * Math.sin(angle);
            leftHexLandscape.push([x1,y1]);
            //add left half to overall bounds
            if(i<3){
                landscapeBounding.push([x1,y1]);
            }
        }
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - (Math.PI / 3);
            const x1 = xLandscape + scale * (Math.cos(angle)+1);
            const y1 = yLandscape + scale * Math.sin(angle);
            rightHexLandscape.push([x1,y1]);
            //add right half to overall bounds
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
        
        // Draws the switch nob (indicator hex)
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

    //switches don't care where they're clicked, they just toggle
    update(input){
        this.toggle = !this.toggle;
    }
}

//Tiles are buttons with text in them and some fancy rendering
//they also store who owns them and whether they're a capital tile
class Tile extends Button {
    letter;
    territoryOf;
    isCapital;

    constructor(letter, x, y, scale, player = 0) {
        super(false, x, y, scale);
        this.letter = letter;
        this.territoryOf = player;   //tiles are owned by a given player
    }

    //hexagon with letter in it
    #renderFull (canvasHandler,currentPlayer,renderMode = 0) {
        const context = canvasHandler.canvas.get(0).getContext('2d');
        let color = 'white';
        if (renderMode == 1) {
            //selected tile
            color = displaySettings.playerColors[currentPlayer];
        } else if(renderMode == 2) {
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
        //tile is only white text if rendermode 1, else black
        context.fillStyle = renderMode==1 ? 'white' : 'black';
        context.font = 'bold ' + fontSize+'px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(this.letter, ...coordinates);
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
        
        //if empty but is territory of a player, fill with color
        if (this.territoryOf) {
            let color = displaySettings.playerColors[this.territoryOf - 1];
            if (renderMode == 2) {
                context.fillStyle = "white";
                context.fill();
                color = displaySettings.playerColors[currentPlayer];
                context.filter = "opacity(25%)";    //this causes the main color to max out and the other colors to make the tile seem more white
            }
            context.fillStyle = color;
            context.fill();
            context.filter = "none"; //clear filter from renderMode 2

            //if a capital tile: draw a crown in the center
            if (this.isCapital) {
                let coordinates = canvasHandler.convertRelativeToCanvas([this.x,this.y]);
                let fontSize = Math.round((540 + displaySettings.fontSize*900)*this.size);
                context.fillStyle = 'white';
                context.font = 'bold ' + fontSize+'px Arial';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillText("♔", ...coordinates);
            }
        } else {
            //otherwise, do outline in black
            context.lineWidth = canvasHandler.convertRelLengthToCanvas(this.size * 0.05);
            context.stroke();
        }
    }

    //renderMode is 0 if nothing, 1 if selected and expansible, 2 if adjacent to selected, 3 if selected but not expansible
    //each rendermode is a different way to display tiles:
    //0 is normal
    //1 means highlight border in current player colors with white text
    //2 means highlight territory in lighter version of current player colors
    //3 means highlight border in gray with black text
    //text colors inverted in dark mode
    render (canvasHandler, currentPlayer, renderMode = 0) {
        this.wide = canvasHandler.wide;

        //call the appropriate render function
        if (this.letter == '') {
            this.#renderEmpty(canvasHandler,currentPlayer,renderMode);
        } else {
            this.#renderFull(canvasHandler,currentPlayer,renderMode);
        }
    }

    //convenient getter for capital status
    get capitalOf() {
        return (this.isCapital?this.territoryOf:0);
    }
}