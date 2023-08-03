class Program {
    //add your programState to Program.states
    #currentState;
    states = [];
    constructor() {
        this.states = [mainMenu,game,singleplayer,settingsMenu,gameSettingsMenu,displaySettingsMenu]
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
    #inputs = [];
    #displays = [];
    constructor(newLabel, newDevices, newDisplays = []) {
        super(newLabel);
        this.#inputs = newDevices;
        this.#displays = newDisplays;
    }
    update(input) {
        for (const device of this.#inputs) {
            if (device.overlapping(input)) {
                device.update(input);
                if (device.newState()){
                    return device.newState();
                }
                break;
            }
        }
        
        return super.ID();
    }
    render(canvas){
        for(let i = 0; i < this.#inputs.length;++i){
            this.#inputs[i].render(canvas);
        }

        for (const display of this.#displays) {
            display.render(canvas);
        }
    }
}

class Game extends ProgramState {
    #board;
    #people; //people is number of actual humans playing, vs players which includes AI plays
    #players;
    #eliminatedPlayers;
    #selected = [];
    #wordDisplay;
    #submitButton;
    #exitButton;
    #reloadButton;
    #currentPlayer;
    #ai;
    constructor(newLabel,numPeople = gameSettings.numPlayers) {
        super(newLabel);
        this.#ai = new AI();
        this.#people = numPeople;
        this.#wordDisplay = new Label("",0.5,0.21,90);
        this.#submitButton = new Button(false,0.1,0.1,0.07);
        this.#exitButton = new Button("mainMenu",0.9,0.1,0.07);
        this.#reloadButton = new Button(false,0.1,1.7,0.07);
        this.reload();
    } 

    reload() {
        if (this.#people == 1) this.#board = new Board(gameSettings.singleplayerLayout);
        else this.#board = new Board(gameSettings.boardLayout);
        this.#players = gameSettings.numPlayers;
        this.#eliminatedPlayers = [];
        this.#currentPlayer = 0;
        this.#selected = [];
        this.#wordDisplay.setText("");
    }

    update(input) {
        let exiting = this.#exitButton.overlapping(input);
        if (this.#currentPlayer >= this.#people) {
            if (exiting) {
                this.#board.playTiles(this.#ai.mostRecentWord,this.#currentPlayer);
                this.#advancePlayer();
                return this.#exitButton.newState(); //if player quits while AI playing, play the word out
            } else {
                if (this.#selected.length != this.#ai.mostRecentWord.length) {
                    this.#selected.push(this.#ai.mostRecentWord[this.#selected.length]);
                } else {
                    this.#board.playTiles(this.#selected,this.#currentPlayer);
                    this.#advancePlayer();
                }
            }
            return; //no input while the AI is doing its thing
        }
        if (exiting) return this.#exitButton.newState();
        if (this.#reloadButton.overlapping(input)) {
            this.reload();
            return;
        }
        if (this.#submitButton.overlapping(input)) {
            let word = this.#word().toLowerCase();
            if (dict.verify(word)) {
                this.#board.playTiles(this.#selected,this.#currentPlayer);
                this.#advancePlayer();
                if (this.#eliminatedPlayers.length == this.#players - 1) {
                    //victory screen!
                }
            } else {
                this.#wordDisplay.setColor('red');
            }
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
            this.#wordDisplay.setColor('default');
        }
    }

    render(canvas) {
        this.#board.render(canvas,this.#selected,this.#currentPlayer);
        this.#wordDisplay.setText(this.#word());
        this.#wordDisplay.render(canvas);
        this.#submitButton.render(canvas);
        this.#exitButton.render(canvas);
        this.#reloadButton.render(canvas);
    }

    #advancePlayer() {
        this.#selected = [];
        for (let i = 0; i < this.#players; i++) {
            if (this.#board.isEliminated(i)) this.#eliminatedPlayers.push(i);
        }
        do {
            this.#currentPlayer = (this.#currentPlayer + 1) % this.#players;
        } while (this.#eliminatedPlayers.includes(this.#currentPlayer));
        if (this.#currentPlayer >= this.#people) this.#ai.pickWord(this.#board,this.#currentPlayer);
    }

    #word() {
        let word = "";
        for (const tile of this.#selected) {
            word += tile.letter.toUpperCase();
        }
        return word;
    }
}