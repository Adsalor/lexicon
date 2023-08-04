class Display {
    x;
    y;
    constructor(newX,newY) {
        this.x = newX;
        this.y = newY;
    }

    render(canvas) {
        throw new Error("render must be implemented!");
    }
}

class Label extends Display {
    #text;
    #fontSize;
    #fontColorLight;
    #fontColorDark;
    
    //TODO: reword fontsize param to scale from min to max based on displaySettings.fontSize
    constructor(text, x, y, fontSize = 16, fontColorLight = 'black', fontColorDark = 'white') {
        super(x,y);
        this.#text = text;
        this.#fontSize = fontSize;
        this.#fontColorLight = fontColorLight;
        this.#fontColorDark = fontColorDark;
    }
  
    render(canvasHandler) {
        const context = canvasHandler.canvas.get(0).getContext('2d');
        const fontColor = displaySettings.darkMode ? this.#fontColorDark : this.#fontColorLight;
        context.fillStyle = fontColor;
        context.font = `${this.#fontSize}px Arial`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        let coordinates = canvasHandler.convertRelativeToCanvas([this.x,this.y])
        context.fillText(this.#text, ...coordinates);
    }

    setText(newText) {
        this.#text = newText;
    }

    setColor(newColor) {
        if (newColor == 'default') {
            this.#fontColorLight = 'black';
            this.#fontColorDark = 'white';
            return;
        }
        if (displaySettings.darkMode) this.#fontColorDark = newColor;
        else this.#fontColorLight = newColor;
    }
}
  
class ImageRenderer extends Display {
    image;
    width;
    height;

    constructor(imageSrc, x, y, width, height) {
        super(x,y);
        this.image = new Image();
        this.image.src = imageSrc;
        this.width = width;
        this.height = height;
    }
  
    render(canvasHandler) {
        const context = canvasHandler.canvas.get(0).getContext('2d');
        let coordinates = canvasHandler.convertRelativeToCanvas([this.x,this.y])
        context.drawImage(this.image, ...coordinates, this.width, this.height);
    }
}

class Hex extends Display {
    size;
    color;
    #vertices;
    constructor(x,y,newSize,newColor) {
        super(x,y);
        this.size = newSize;
        this.color = newColor;
        this.#vertices = [];
        for (let i = 1; i <= 6; i++) {
            const angle = (Math.PI / 3) * i;
            const x1 = x + this.size * Math.cos(angle);
            const y1 = y + this.size * Math.sin(angle);
            this.#vertices.push([x1,y1]);
        }
    }

    render(canvasHandler) {
        const context = canvasHandler.canvas.get(0).getContext('2d');
        // Draws the hexagon outline
        context.beginPath();
        let coordinates = canvasHandler.convertRelativeToCanvas(this.#vertices[0]);
        context.moveTo(...coordinates);
  
        for (let i = 1; i < this.#vertices.length; i++) {
            coordinates = canvasHandler.convertRelativeToCanvas(this.#vertices[i]);
            context.lineTo(...coordinates);
        }
  
        context.closePath();

        if (this.color == 'default') context.fillStyle = (displaySettings.darkMode?'gray':'white');
        else context.fillStyle = this.color;
        context.fill();
    }
}

class TurnIndicator extends Display {
    size;
    turn;
    #hexes;
    constructor(x,y,size,numPlayers) {
        super(x,y);
        this.turn = 0;
        this.size = size;
        this.#hexes = [];
        this.#hexes.push(new Hex(this.x,this.y,this.size * 0.95,'default'));
        switch (numPlayers) {
            case 3:
                this.#hexes.push(new Hex(this.x - 1.5 * this.size, this.y - this.size*Math.sqrt(3)/2, this.size * 0.95,displaySettings.playerColors[0]));
                this.#hexes.push(new Hex(this.x + 1.5 * this.size, this.y - this.size*Math.sqrt(3)/2, this.size * 0.95,displaySettings.playerColors[1]));
                this.#hexes.push(new Hex(this.x,this.y + this.size * Math.sqrt(3), this.size * 0.95, displaySettings.playerColors[2]));
                break;
            case 4:
                this.#hexes.push(new Hex(this.x - 1.5 * this.size, this.y - this.size*Math.sqrt(3)/2, this.size * 0.95,displaySettings.playerColors[0]));
                this.#hexes.push(new Hex(this.x + 1.5 * this.size, this.y - this.size*Math.sqrt(3)/2, this.size * 0.95,displaySettings.playerColors[1]));
                this.#hexes.push(new Hex(this.x + 1.5 * this.size, this.y + this.size*Math.sqrt(3)/2, this.size * 0.95,displaySettings.playerColors[2]));
                this.#hexes.push(new Hex(this.x - 1.5 * this.size, this.y + this.size*Math.sqrt(3)/2, this.size * 0.95,displaySettings.playerColors[3]));
                break;
            case 5:
                this.#hexes.push(new Hex(this.x - 1.5 * this.size, this.y - this.size*Math.sqrt(3)/2, this.size * 0.95,displaySettings.playerColors[0]));
                this.#hexes.push(new Hex(this.x,this.y - this.size * Math.sqrt(3), this.size * 0.95, displaySettings.playerColors[1]));
                this.#hexes.push(new Hex(this.x + 1.5 * this.size, this.y - this.size*Math.sqrt(3)/2, this.size * 0.95,displaySettings.playerColors[2]));
                this.#hexes.push(new Hex(this.x + 1.5 * this.size, this.y + this.size*Math.sqrt(3)/2, this.size * 0.95,displaySettings.playerColors[3]));
                this.#hexes.push(new Hex(this.x - 1.5 * this.size, this.y + this.size*Math.sqrt(3)/2, this.size * 0.95,displaySettings.playerColors[4]));
                break;
            case 6:
                this.#hexes.push(new Hex(this.x - 1.5 * this.size, this.y - this.size*Math.sqrt(3)/2, this.size * 0.95,displaySettings.playerColors[0]));
                this.#hexes.push(new Hex(this.x,this.y - this.size * Math.sqrt(3), this.size * 0.95, displaySettings.playerColors[1]));
                this.#hexes.push(new Hex(this.x + 1.5 * this.size, this.y - this.size*Math.sqrt(3)/2, this.size * 0.95,displaySettings.playerColors[2]));
                this.#hexes.push(new Hex(this.x + 1.5 * this.size, this.y + this.size*Math.sqrt(3)/2, this.size * 0.95,displaySettings.playerColors[3]));
                this.#hexes.push(new Hex(this.x,this.y + this.size * Math.sqrt(3), this.size * 0.95, displaySettings.playerColors[4]));
                this.#hexes.push(new Hex(this.x - 1.5 * this.size, this.y + this.size*Math.sqrt(3)/2, this.size * 0.95,displaySettings.playerColors[5]));
                break;
            default:
                //two players
                this.#hexes.push(new Hex(this.x - 1.5 * this.size, this.y - this.size*Math.sqrt(3)/2, this.size * 0.95,displaySettings.playerColors[0]));
                this.#hexes.push(new Hex(this.x + 1.5 * this.size, this.y - this.size*Math.sqrt(3)/2, this.size * 0.95,displaySettings.playerColors[1]));
                break;
        }
    }

    render(canvasHandler) {
        for (const hex of this.#hexes) {
            hex.render(canvasHandler);
        }

        let coordinates = canvasHandler.convertRelativeToCanvas([this.x,this.y]);
        let context = canvasHandler.canvas.get(0).getContext('2d');
        context.save();
        context.translate(...coordinates);
        const x = this.#hexes[this.turn + 1].x - this.x;
        const y = this.#hexes[this.turn + 1].y - this.y;
        const angle = Math.atan2(y,x);
        context.rotate(angle - Math.PI / 2);
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = (displaySettings.darkMode?'white':'black');
        context.font = 'bold ' + 1440*this.size + 'px Arial';
        context.fillText('v',0,0);
        context.restore();
    }

    eliminatePlayer(player) {
        let hex = this.#hexes[player + 1];
        this.#hexes.push(new Hex(hex.x,hex.y,hex.size * 0.8,'gray'));
    }

    setTurn(newTurn) {
        this.turn = newTurn % (this.#hexes.length - 1);
    }
}