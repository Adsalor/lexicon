//Contains base display class and all subclasses
//Displays are UI elements which are uninteractable

class Display {
    //store portrait and landscape mode coordinates, and current aspect ratio of canvas
    xLandscape;
    yLandscape;
    xPortrait;
    yPortrait;
    wide;

    //default landscape coords are just portrait coords flipped over the diagonal
    constructor(xPortrait, yPortrait, xLandscape = yPortrait, yLandscape = xPortrait) {
        this.xLandscape = xLandscape;
        this.yLandscape = yLandscape;
        this.xPortrait = xPortrait;
        this.yPortrait = yPortrait;
        this.wide = false;
    }

    //return x matching current aspect ratio
    get x() {
        return this.wide ? this.xLandscape : this.xPortrait;
    }

    //return y matching current aspect ratio
    get y() {
        return this.wide ? this.yLandscape : this.yPortrait;
    }

    //"abstract method" because javascript moment
    render(canvas) {
        throw new Error("render must be implemented!");
    }
}

//Labels are displays which draw text at a location
class Label extends Display {
    //store the text, font size, and font color in light/dark mode
    #text;
    #fontSize;
    #fontColorLight;
    #fontColorDark;
    
    //TODO: reword fontsize param to scale from min to max based on displaySettings.fontSize
    constructor(text, x, y, fontSize = 50, xL=y, yL=x, fontColorLight = 'black', fontColorDark = 'white') {
        super(x,y,xL,yL);
        this.#text = text;
        this.#fontSize = fontSize;
        this.#fontColorLight = fontColorLight;
        this.#fontColorDark = fontColorDark;
    }

    //render text to canvas
    render(canvasHandler) {
        this.wide = canvasHandler.wide;
        const context = canvasHandler.canvas.get(0).getContext('2d');
        const fontColor = displaySettings.darkMode ? this.#fontColorDark : this.#fontColorLight;
        context.fillStyle = fontColor;

        context.font = `${this.#fontSize}px Arial`;

        context.textAlign = 'center';
        context.textBaseline = 'middle';

        //convert coordinates to match canvas (see canvasSizing.js for details)
        let coordinates = canvasHandler.convertRelativeToCanvas([this.x, this.y]);
        context.fillText(this.#text, ...coordinates);
    }

    setText(newText) {
        this.#text = newText;
    }

    setColor(newColor) {
        //default values of colors
        if (newColor == 'default') {
            this.#fontColorLight = 'black';
            this.#fontColorDark = 'white';
            return;
        }
        //set currently used color to match new color
        if (displaySettings.darkMode) this.#fontColorDark = newColor;
        else this.#fontColorLight = newColor;
    }
}

//ImageRenderer displays an image on the canvas. could be used in a UI overhaul, but for now pretty unused
//called ImageRenderer bc Image is taken by JS, so don't rename
class ImageRenderer extends Display {
    image;
    width;
    height;

    constructor(imageSrc, x, y, width, height,xL=y,yL=x) {
        super(x, y, xL, yL);
        this.image = new Image();
        this.image.src = imageSrc;
        this.width = width;
        this.height = height;
    }
  
    render(canvasHandler) {
        this.wide = canvasHandler.wide;

        const context = canvasHandler.canvas.get(0).getContext('2d');
        let coordinates = canvasHandler.convertRelativeToCanvas([this.x, this.y]);
        let height = canvasHandler.convertRelLengthToCanvas(this.height);
        let width = canvasHandler.convertRelLengthToCanvas(this.width);

        context.drawImage(this.image, ...coordinates, width, height);
    }
}

//draws an uninteractable hexagon onto the board
class Hex extends Display {
    size;
    color;
    //since the hexes are pointy or flat-topped depending on aspect ratio, we need separate vertex sets
    #portraitVertices;
    #landscapeVertices;

    //TODO: support alternate positions in different aspect ratios
    constructor(x,y,newSize,newColor) {
        super(x,y);
        this.size = newSize;
        this.color = newColor;
        this.#portraitVertices = [];
        this.#landscapeVertices = [];

        //fun math, sample points at 60 degree intervals around a circle centered on [x,y]
        //gets evenly spaced points a.k.a. hexagon
        for (let i = 1; i <= 6; i++) {
            const angle = (Math.PI / 3) * i;
            const x1 = x + this.size * Math.cos(angle);
            const y1 = y + this.size * Math.sin(angle);
            this.#portraitVertices.push([x1,y1]);
        }
        //offset by 30 degrees for pointy top
        for (let i = 1; i <= 6; i++) {
            const angle = (Math.PI / 3) * i + Math.PI/6;
            const x1 = y + this.size * Math.cos(angle);
            const y1 = x + this.size * Math.sin(angle);
            this.#landscapeVertices.push([x1,y1]);
        }
    }

    render(canvasHandler) {
        this.wide = canvasHandler.wide;
        const context = canvasHandler.canvas.get(0).getContext('2d');
        //fill in the hex path using the current set of vertices
        context.beginPath();
        let coordinates = canvasHandler.convertRelativeToCanvas(this.#vertices[0]);
        context.moveTo(...coordinates);
  
        for (let i = 1; i < this.#vertices.length; i++) {
            coordinates = canvasHandler.convertRelativeToCanvas(this.#vertices[i]);
            context.lineTo(...coordinates);
        }
  
        context.closePath();
        //fill with hex color
        if (this.color == 'default') context.fillStyle = (displaySettings.darkMode?'gray':'white');
        else context.fillStyle = this.color;
        context.fill();
    }

    //return correct set of vertices depending on mode
    get #vertices() {
        return this.wide?this.#landscapeVertices:this.#portraitVertices;
    }
}

//composited of hexes, indicates turn by pointing at hex of same color as player whose turn it is
class TurnIndicator extends Display {
    size;
    turn;
    #hexes;

    //TODO: support alternate coordinates btw portrait/landscape
    constructor(x,y,size,numPlayers) {
        super(x,y);
        this.turn = 0;
        this.size = size;
        this.#hexes = [];
        //center hex, default color
        //arrow renders on top of this
        this.#hexes.push(new Hex(this.x,this.y,this.size * 0.95,'default'));

        //hardcoded because this is ugly
        switch (numPlayers) {
            case 3:
                //3 players are evenly spaced w/ gaps between them, Y shape
                this.#hexes.push(new Hex(this.x - 1.5 * this.size, this.y - this.size*Math.sqrt(3)/2, this.size * 0.95,displaySettings.playerColors[0]));
                this.#hexes.push(new Hex(this.x + 1.5 * this.size, this.y - this.size*Math.sqrt(3)/2, this.size * 0.95,displaySettings.playerColors[1]));
                this.#hexes.push(new Hex(this.x,this.y + this.size * Math.sqrt(3), this.size * 0.95, displaySettings.playerColors[2]));
                break;
            case 4:
                //4 players are 2 groups on left and right of main hex, X shape
                this.#hexes.push(new Hex(this.x - 1.5 * this.size, this.y - this.size*Math.sqrt(3)/2, this.size * 0.95,displaySettings.playerColors[0]));
                this.#hexes.push(new Hex(this.x + 1.5 * this.size, this.y - this.size*Math.sqrt(3)/2, this.size * 0.95,displaySettings.playerColors[1]));
                this.#hexes.push(new Hex(this.x + 1.5 * this.size, this.y + this.size*Math.sqrt(3)/2, this.size * 0.95,displaySettings.playerColors[2]));
                this.#hexes.push(new Hex(this.x - 1.5 * this.size, this.y + this.size*Math.sqrt(3)/2, this.size * 0.95,displaySettings.playerColors[3]));
                break;
            case 5:
                //5 players are all but bottom slot (n)
                this.#hexes.push(new Hex(this.x - 1.5 * this.size, this.y - this.size*Math.sqrt(3)/2, this.size * 0.95,displaySettings.playerColors[0]));
                this.#hexes.push(new Hex(this.x,this.y - this.size * Math.sqrt(3), this.size * 0.95, displaySettings.playerColors[1]));
                this.#hexes.push(new Hex(this.x + 1.5 * this.size, this.y - this.size*Math.sqrt(3)/2, this.size * 0.95,displaySettings.playerColors[2]));
                this.#hexes.push(new Hex(this.x + 1.5 * this.size, this.y + this.size*Math.sqrt(3)/2, this.size * 0.95,displaySettings.playerColors[3]));
                this.#hexes.push(new Hex(this.x - 1.5 * this.size, this.y + this.size*Math.sqrt(3)/2, this.size * 0.95,displaySettings.playerColors[4]));
                break;
            case 6:
                //6 players completely surround center
                this.#hexes.push(new Hex(this.x - 1.5 * this.size, this.y - this.size*Math.sqrt(3)/2, this.size * 0.95,displaySettings.playerColors[0]));
                this.#hexes.push(new Hex(this.x,this.y - this.size * Math.sqrt(3), this.size * 0.95, displaySettings.playerColors[1]));
                this.#hexes.push(new Hex(this.x + 1.5 * this.size, this.y - this.size*Math.sqrt(3)/2, this.size * 0.95,displaySettings.playerColors[2]));
                this.#hexes.push(new Hex(this.x + 1.5 * this.size, this.y + this.size*Math.sqrt(3)/2, this.size * 0.95,displaySettings.playerColors[3]));
                this.#hexes.push(new Hex(this.x,this.y + this.size * Math.sqrt(3), this.size * 0.95, displaySettings.playerColors[4]));
                this.#hexes.push(new Hex(this.x - 1.5 * this.size, this.y + this.size*Math.sqrt(3)/2, this.size * 0.95,displaySettings.playerColors[5]));
                break;
            default:
                //two players, upper half each side
                this.#hexes.push(new Hex(this.x - 1.5 * this.size, this.y - this.size*Math.sqrt(3)/2, this.size * 0.95,displaySettings.playerColors[0]));
                this.#hexes.push(new Hex(this.x + 1.5 * this.size, this.y - this.size*Math.sqrt(3)/2, this.size * 0.95,displaySettings.playerColors[1]));
                break;
        }
    }

    //render each hex, then the pointer
    render(canvasHandler) {
        this.wide = canvasHandler.wide;
        for (const hex of this.#hexes) {
            hex.render(canvasHandler);
        }

        //pointer: to rotate text you need to rotate the whole canvas, draw the thing, then put the canvas back
        let coordinates = canvasHandler.convertRelativeToCanvas([this.x,this.y]);
        let context = canvasHandler.canvas.get(0).getContext('2d');
        //save canvas state to restore afterwards
        context.save();

        //center rotation on coordinates text is drawn at
        context.translate(...coordinates);
        
        //get offset of hex to point at
        const x = this.#hexes[this.turn + 1].x - this.x;
        const y = this.#hexes[this.turn + 1].y - this.y;

        //get angle matching offset, rotate to that angle (+ pi/2 because v points down but 0 is x+, so ->)
        const angle = Math.atan2(y,x);
        context.rotate(angle - Math.PI / 2);

        //draw text, restore canvas after
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = (displaySettings.darkMode?'white':'black');
        context.font = 'bold ' + 1440*this.size + 'px Arial';
        context.fillText('v',0,0);

        context.restore();
    }

    //to indicate a player is eliminated, put a hexagon over their icon
    eliminatePlayer(player) {
        let hex = this.#hexes[player + 1];
        //use small hex size so you can see which player is gone, portrait coords so it matches when flipped too
        this.#hexes.push(new Hex(hex.xPortrait,hex.yPortrait,hex.size * 0.8,'gray'));
    }

    //update turn to match game turn
    setTurn(newTurn) {
        this.turn = newTurn % (this.#hexes.length - 1);
    }
}

//a PopUp is a box with text in it
//used in the game to explain some things
//always in center of screen
class PopUp extends Display {
    label;
    size;

    constructor(newText, newSize) {
        //hardcode to center
        super(0.5,8/9);
        this.label = new Label(newText,this.x,this.y,50);
        this.size = newSize;
    }

    //draw box, then put text on it
    render(canvasHandler) {
        this.wide = canvasHandler.wide;
        let context = canvasHandler.canvas.get(0).getContext('2d');

        //make box centered on x,y
        context.beginPath();
        context.moveTo(...canvasHandler.convertRelativeToCanvas([this.x - this.size[0]/2,this.y - this.size[1]/2]));
        context.lineTo(...canvasHandler.convertRelativeToCanvas([this.x + this.size[0]/2,this.y - this.size[1]/2]));
        context.lineTo(...canvasHandler.convertRelativeToCanvas([this.x + this.size[0]/2,this.y + this.size[1]/2]));
        context.lineTo(...canvasHandler.convertRelativeToCanvas([this.x - this.size[0]/2,this.y + this.size[1]/2]));
        context.closePath();

        //fill with fill color, draw with border color
        context.fillStyle = displaySettings.darkMode?'gray':'white';
        context.fill();
        context.fillStyle = displaySettings.darkMode?'white':'black';
        context.stroke();

        this.label.render(canvasHandler);
    }
}