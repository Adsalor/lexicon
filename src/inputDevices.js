//i am very tired rn, this is all probably somewhat bad
//if we need to change it, it's no big deal

class InputDevice {
    #isChanger //whether should update to new program state on interaction
    bounding
    constructor(newMode,newBounding) {
        this.#isChanger = newMode;
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
    get changeState() {
        return this.#isChanger;
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
    render(renderTarget) {
        const context = renderTarget.get(0).getContext('2d');
        // Draws the hexagon outline
        context.beginPath();
        let coordinates = canvas.convertRelativeToCanvas(this.bounding[0]);
        context.moveTo(coordinates[0],coordinates[1]);
  
        for (let i = 1; i < this.bounding.length; i++) {
            coordinates = canvas.convertRelativeToCanvas(this.bounding[i]);
            context.lineTo(coordinates[0],coordinates[1]);
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
    constructor(letter, x, y, scale) {
        super(false, x, y, scale);
        this.letter = letter;
    }

    //hexagon with letter (or capital)
    renderFull (canvas) {
        const context = canvas[0].getContext('2d');
        const centerX = this.x;
        const centerY = this.y;
        // Draws the hexagon outline
        context.beginPath();
        context.moveTo(this.bounding[this.bounding.length-1].x,this.bounding[this.bounding.length-1].y);
  
        for (let i = 0; i < this.bounding.length; i++) {
            context.lineTo(this.bounding[i].x,this.bounding[i].y);
        }
  
        context.closePath();
  
        // Fill the hexagon with a color based on the selected state
        context.fillStyle = this.selected ? 'black' : 'white';
        context.fill();
  
        // Add the letter in the middle of the hexagon
        context.fillStyle = this.selected ? 'white' : 'black';
        context.font = 'bold 20px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(this.letter, centerX, centerY);
    }
    //hexagon without letter
    renderEmpty (canvas) {
        const context = canvas[0].getContext('2d');

        // Draws the hexagon outline
        context.beginPath();
        context.moveTo(centerX + size * Math.cos(0)/2, centerY + size/2 * Math.sin(0));
        context.lineWidth=5;
        context.strokeStyle='black';
        for (let i = 1; i <= 6; i++) {
            const angle = (Math.PI / 3) * i;
            const x = centerX + size/2 * Math.cos(angle);
            const y = centerY + size/2 * Math.sin(angle);
            context.lineTo(x, y);
        }
  
        context.closePath();
        context.stroke();
    }

    render (canvas) {
        // if (this.letter=='') {
        //     this.renderEmpty(canvas);
        // } else {
        //     this.renderFull(canvas);
        // }
        super.render(canvas);
    }
}