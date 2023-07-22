class Program {
    //add your programState to Program.states
    #currentState;
    constructor() {
        this.states = [mainMenu]
        this.#currentState = this.states[0].ID();
    }
    update(input) {
        for (state of this.states) {
            if (state.ID() === this.#currentState) {
                this.#currentState = state.update(input);
                state.render(canvas);
                return;
            }
        }
        throw new Error("No program state with ID = " + this.#currentState + " exists!");
    }
}

class ProgramState {
    #label;
    constructor(newLabel) {
        this.label = newLabel;
    }
    update(input) {
        throw new Error("Update function must be implemented!");
    }
    
    render(canvas) {
        throw new Error("Render function must be implemented!");
    }
    get ID() {
        return this.#label;
    }
}

class Menu extends ProgramState {
    #inputs = [];
    constructor(newLabel,newDevices) {
        super(newLabel);
        this.inputs = newDevices;
    }
    update(input) {
        for (device of this.inputs) {
            if (device.overlapping(input)) {
                device.update(input);
                if (device.newState()) return device.newState();
                break;
            }
        }
        
        return super.ID();
    }
    render(canvas){
        for(let i = 0; i < this.#inputs.length;++i){
            this.#inputs[i].render(canvas);
        }
    }
}

class Game extends ProgramState {
    #board;
    #players;
    #selected = [];
    #wordDisplay;
    #submitButton;
    constructor() {
        super("Game");
        this.#board = new Board(gameSettings.boardLayout);
        this.#submitButton = new Button(false,0.1,0.1,0.07);
    } 

    update(input) {
        if (this.#submitButton.overlapping(input)) {
            //if (dictionary.isValidWord(this.word())) {
            //  this.#board.playTiles(this.#selected,this.currentPlayer);
            //}
            alert("'" + this.#word() + "' played!");
            this.#selected = [];
        } else {
            let newTile = this.#board.update(input);
            if (newTile) {
                let index = this.#selected.indexOf(newTile);
                if (index === -1) {
                    this.#selected.push(newTile);
                } else {
                    this.#selected.splice(index,1);
                }
            }
        }
    }

    render(canvas) {
        this.#board.render(canvas,this.#selected,this.currentPlayer);
        //this.#wordDisplay.setText(this.#word());
        //this.#wordDisplay.render(canvas);
        this.#submitButton.render(canvas);
    }

    #word() {
        let word = "";
        for (const tile of this.#selected) {
            word += tile.letter;
        }
        return word;
    }
}