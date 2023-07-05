//i am very tired rn, this is all probably somewhat bad
//if we need to change it, it's no big deal

class InputDevice {
    #isChanger //whether should update to new program state on interaction
    #bounding
    constructor(newMode,newBounding) {
        this.#isChanger = newMode;
        this.#bounding = newBounding;
    }
    render(canvas) {
        throw new Error("Render method must be implemented!")
    }
    overlapping(input) {
        var intersections = 0;
        for (segment of bounding) {
            //if (x-intersect) intersections++;
        }
        return intersections % 2;
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
    constructor(){
        super();
        this.selected=false;
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
    //...
    constructor(letter, x, y) {
        super();
        this.letter = letter;
        this.x = x;
        this.y = y;
    }

    //hexagon with letter (or capital)
    renderFull(canvas){
        const context = canvas.getContext('2d');
        const size = 50; // Size of the hexagon
        const centerX = this.x;
        const centerY = this.y;
        // Draws the hexagon outline
        context.beginPath();
        context.moveTo(centerX + size * Math.cos(0), centerY + size * Math.sin(0));
  
        for (let i = 1; i <= 6; i++) {
            const angle = (Math.PI / 3) * i;
            const x = centerX + size * Math.cos(angle);
            const y = centerY + size * Math.sin(angle);
            context.lineTo(x, y);
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
    renderEmpty(canvas){
        const context = canvas.getContext('2d');
        const size = 25; // Size of the hexagon
        const centerX = this.x;
        const centerY = this.y;
        // Draws the hexagon outline
        context.beginPath();
        context.moveTo(centerX + size * Math.cos(0), centerY + size * Math.sin(0));
        context.lineWidth=5;
        context.strokeStyle='black';
        for (let i = 1; i <= 6; i++) {
            const angle = (Math.PI / 3) * i;
            const x = centerX + size * Math.cos(angle);
            const y = centerY + size * Math.sin(angle);
            context.lineTo(x, y);
        }
  
        context.closePath();
        context.stroke();
    }

    render(canvas) {
        if(this.letter==''){
            this.renderEmpty(canvas);
        }else{
            this.renderFull(canvas);
        }
        
    }
}