//i am very tired rn, this is all probably somewhat bad
//if we need to change it, it's no big deal

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
    get newState() {
        return this.#newState;
    }
}

//too much of this is dependent on the way we end up doing input handling from the canvas
//i'm gonna focus on that then come back to this once i have a better idea of the formats
//-Chris

class Button extends InputDevice {
    //...
    constructor(newMode, x, y, scale){
        var newBounding = [];
        for (let i = 1; i <= 6; i++) {
            const angle = (Math.PI / 3) * i;
            const x1 = x + scale * Math.cos(angle);
            const y1 = y + scale * Math.sin(angle);
            newBounding.push([x1,y1]);
        }
        super(newMode,newBounding);
        this.selected=false;
        this.x = x;
        this.y = y;
        this.size = scale;
    }
    isSelected(){
        return this.selected;
    }
    render(canvasHandler) {
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
  
        //Fill the hexagon with a color based on the selected state
        context.fillStyle = this.selected ? 'white' : 'white';
        context.fill();
        
    }
}

class Switch extends InputDevice {
    //for dark/light mode, i.e.
}

class Slider extends InputDevice {
    //if we need this
    //we probably won't, but who knows
}

class Tile extends Button {
    //not sure if x and y should be here, but they're just leftover from tile.js
    //-Andrew
    constructor(letter, x, y, scale, player) {
        super(false, x, y, scale);
        this.letter = letter;
        this.player = player;   //tiles are owned by a player
    }

    //hexagon with letter (or capital)
    renderFull (canvasHandler) {
        const context = canvasHandler.canvas.get(0).getContext('2d');
        super.render(canvasHandler);
  
        // Add the letter in the middle of the hexagon
        let coordinates = canvasHandler.convertRelativeToCanvas([this.x,this.y])
        //maximum coefficient: 1440
        //minimum coefficient: 540
        let fontSize = Math.round((540 + displaySettings.fontSize*900)*this.size);
        context.fillStyle = this.selected ? 'white' : 'black';
        context.font = 'bold ' + fontSize+'px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(this.letter, coordinates[0], coordinates[1]);
    }
    //hexagon without letter
    renderEmpty (canvasHandler) {
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

        context.lineWidth = canvasHandler.convertRelLengthToCanvas(this.size * 0.05);
        context.stroke();
    }

    render (canvasHandler) {
        if (this.letter=='') {
            this.renderEmpty(canvasHandler);
        } else {
            this.renderFull(canvasHandler);
        }
    }
}