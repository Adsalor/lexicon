class Program {
    //add your programState to Program.states
    #currentState;
    constructor() {
        this.states = [mainMenu,game]
        this.#currentState = this.states[0];
    }
    update(input) {
        let newStateID = this.#currentState.update(input);
        for (const state of this.states) {
            if (newStateID === state.ID()) {
                this.#currentState = state;
                break;
            }
        }
        this.render();
    }

    render() {
        canvas.clear();
        this.#currentState.render(canvas);
    }
}

class ProgramState {
    #label;
    constructor(newLabel) {
        this.#label = newLabel;
    }
    update(input) {
        throw new Error("Update function must be implemented!");
    }
    
    render(canvas) {
        throw new Error("Render function must be implemented!");
    }
    ID() {
        return this.#label;
    }
}

class Menu extends ProgramState {
    #text;
    #titleRendered;
    #inputs = [];
    constructor(newText, newLabel,newDevices) {
        super(newLabel);
        this.#titleRendered = false
        this.#text = newText;
        this.#inputs = newDevices;
    }
    update(input) {
        for (const device of this.#inputs) {
            if (device.overlapping(input)) {
                device.update(input);
                if (device.newState()){
                    this.#titleRendered = false;
                    const parentElement = document.getElementById("title"); 
                    parentElement.removeChild(parentElement.firstChild);
                    return device.newState();
                }
                break;
            }
        }
        
        return super.ID();
    }
    render(canvas){
        if (!this.#titleRendered) {
            const newElement = document.createElement("p");
            newElement.textContent = this.#text;

            const parentElement = document.getElementById("title"); 
            parentElement.appendChild(newElement);

            this.#titleRendered = true; 
        }
        for(let i = 0; i < this.#inputs.length;++i){
            this.#inputs[i].render(canvas);
        }
    }
}

class Game extends ProgramState {
    #board;
    #players;
    #eliminatedPlayers;
    #selected = [];
    #wordDisplay;
    #submitButton;
    #currentPlayer;
    constructor(newLabel) {
        super(newLabel);
        //this.#wordDisplay = new Text("",0.5,0.1);
        this.#submitButton = new Button(false,0.1,0.1,0.07);
        this.reload();
    } 

    reload() {
        this.#board = new Board(gameSettings.boardLayout);
        this.#players = gameSettings.numPlayers;
        this.#eliminatedPlayers = [];
        this.#currentPlayer = 0;
        //this.#wordDisplay.text = "";
    }

    update(input) {
        if (this.#submitButton.overlapping(input)) {
            let word = this.#word();
            //if (dictionary.isValidWord(word)) {
                this.#board.playTiles(this.#selected,this.#currentPlayer);
                for (let i = 0; i < this.#players; i++) {
                    if (this.#board.isEliminated(i)) this.#eliminatedPlayers.push(i);
                }
                do {
                    this.#currentPlayer = (this.#currentPlayer + 1) % this.#players;
                } while (this.#eliminatedPlayers.includes(this.#currentPlayer));
                if (this.#eliminatedPlayers.length == this.#players - 1) {
                    //victory screen!
                }
                this.#selected = [];
            //} else {
            //  this.#wordDisplay.setColor(red);
            //}
            alert("'" + word + "' played!");
        } else {
            let newTile = this.#board.update(input);
            if (newTile && !newTile.territoryOf && newTile.letter != '') {
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
        this.#board.render(canvas,this.#selected,this.#currentPlayer);
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