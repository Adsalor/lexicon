class Program {
    //add your programState to Program.states
    #currentState;
    states = [];
    constructor() {
        this.states = [mainMenu,game,singleplayer,settingsMenu,gameSettingsMenu,displaySettingsMenu,MPgameMenu,SPgameMenu];
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

class PreGameMenu extends Menu {
    targetGame;
    resetButton;
    constructor(newLabel, targetGame) {
        let button = new Button(false,0.5,1.1,0.1);
        let devices = [new Button("mainMenu",0.1,0.1,0.07), new Button(targetGame.ID(),0.5,0.8,0.1), button];
        let displays = [new Label("return to menu",0.15,0.2,50,0.15,0.2), new Label("Play",0.5,0.8,50), new Label("Reset",0.5,1.1,50)];
        super(newLabel,devices,displays);
        this.resetButton = button;
        this.targetGame = targetGame;
    }
    update(input) {
        if (this.resetButton.overlapping(input)) {
            this.targetGame.reload();
        }
        return super.update(input);
    }
}

class GameSettingsMenu extends Menu {
    playerUpButton;
    playerDownButton;
    playerCountDisplay;
    boardWidthUpButton;
    boardWidthDownButton;
    boardWidthDisplay;
    boardHeightUpButton;
    boardHeightDownButton;
    boardHeightDisplay;
    constructor(newLabel) {
        let pUB = new Button(false,0.9,0.4,0.05);
        let pDB = new Button(false,0.6,0.4,0.05);
        let pCD = new Label(gameSettings.numPlayers.toString(),0.75,0.4,50);
        let bWUB = new Button(false,0.9,0.7,0.05);
        let bWDB = new Button(false,0.6,0.7,0.05);
        let bWD = new Label(gameSettings.boardSize[0].toString(),0.75,0.7,50);
        let bHUB = new Button(false,0.9,1.0,0.05);
        let bHDB = new Button(false,0.6,1.0,0.05);
        let bHD = new Label(gameSettings.boardSize[1].toString(),0.75,1.0,50);
        
        let devices = [new Button("settingsMenu",0.1,0.1,0.07),pUB,pDB,bWUB,bWDB,bHUB,bHDB];
        let displays = [new Label("return to menu",0.15,0.2,50),new Label("Player Count",0.3,0.4,70),
            new Label("Board Width",0.3,0.7,70),new Label("Board Height",0.3,1.0,70),pCD,bWD,bHD];
        
        super(newLabel,devices,displays);
        this.playerUpButton = pUB;
        this.playerDownButton = pDB;
        this.boardWidthUpButton = bWUB;
        this.boardWidthDownButton = bWDB;
        this.boardHeightUpButton = bHUB;
        this.boardHeightDownButton = bHDB;
        this.playerCountDisplay = pCD;
        this.boardWidthDisplay = bWD;
        this.boardHeightDisplay = bHD;
    }

    update(input) {
        if (this.playerUpButton.overlapping(input)) {
            gameSettings.increasePlayers();
        } else if (this.playerDownButton.overlapping(input)) {
            gameSettings.decreasePlayers();
        } else if (this.boardWidthUpButton.overlapping(input)) {
            gameSettings.increaseWidth();
        } else if (this.boardWidthDownButton.overlapping(input)) {
            gameSettings.decreaseWidth();
        } else if (this.boardHeightUpButton.overlapping(input)) {
            gameSettings.increaseHeight();
        } else if (this.boardHeightDownButton.overlapping(input)) {
            gameSettings.decreaseHeight();
        } else {
            return super.update(input); //update for new menu state
        }
        return; // if we clicked one of the settings buttons we didn't click exit
    }

    render(canvasHandler) {
        this.playerCountDisplay.setText(gameSettings.numPlayers.toString());
        this.boardWidthDisplay.setText(gameSettings.boardSize[0].toString());
        this.boardHeightDisplay.setText(gameSettings.boardSize[1].toString());
        super.render(canvasHandler);
    }
}

class DisplaySettingsMenu extends Menu {
    // mimic the game settings
    darkModeSwitch;

    constructor(newLabel) {
        let menuButton = new Button("settingsMenu",0.1,0.1,0.07);
        let dmSwitch = new Switch(false, 0.7,0.5,0.1);
        let dmLabel = new Label("Dark Mode", 0.3,0.5,50);
        let menuLabel = new Label("return to menu",0.15,0.2,50);
        let devices = [menuButton, dmSwitch];
        let displays = [dmLabel, menuLabel];
        super(newLabel, devices, displays);

        this.darkModeSwitch = dmSwitch;
        this.darkModeSwitch.toggle = displaySettings.darkMode;
    }

    update(input) {
        if (this.darkModeSwitch.overlapping(input)) {
            this.darkModeSwitch.update(input);
            displaySettings.updateDarkMode(this.darkModeSwitch.toggle);
            return;
        } else return super.update(input);
    }

    render(canvasHandler) {
        this.darkModeSwitch.toggle = displaySettings.darkMode;
        super.render(canvasHandler);
    }
}

class Game extends ProgramState {
    #board;
    #people; //people is number of actual humans playing, vs players which includes AI plays
    #players;
    #eliminatedPlayers;
    #selected;
    #wordDisplay;
    #submitButton;
    #exitButton;
    #currentPlayer;
    #turner;
    #ai;
    #popup;
    constructor(newLabel,aboveMenu = "mainMenu",singleplayer = false) {
        super(newLabel);
        this.#ai = new AI();
        this.#people = (singleplayer?1:gameSettings.numPlayers);
        this.#wordDisplay = new Label("",0.5,0.32,90);
        this.#submitButton = new Button(false,0.1,0.1,0.07);
        this.#exitButton = new Button(aboveMenu,0.9,0.1,0.07);
        this.reload();
    } 

    reload() {
        if (this.#people == 1) this.#board = new Board(gameSettings.singleplayerLayout,10/9);
        else {
            this.#board = new Board(gameSettings.boardLayout,10/9);
            this.#people = gameSettings.numPlayers;
        }
        this.#players = gameSettings.numPlayers;
        this.#turner = new TurnIndicator(0.5,0.15,0.05,this.#players);
        this.#eliminatedPlayers = [];
        this.#currentPlayer = 0;
        this.#selected = [];
        this.#wordDisplay.setText("");
        this.#popup = [false,null];//what type of popup is active, and pointer to it
    }

    update(input) {
        if (this.#popup[0]) { //if pop-up window active, no input goes to board itself
            if (this.#popup[0] == 'reset') {
                this.reload();
            } else {
                this.#popup = [false,null];
            }
            return;
        }
        let exiting = this.#exitButton.overlapping(input);
        if (this.#currentPlayer >= this.#people) {
            if (exiting) {
                let capitalCaptured = this.#board.playTiles(this.#ai.mostRecentWord,this.#currentPlayer);
                this.#advancePlayer(capitalCaptured);
                return this.#exitButton.newState(); //if player quits while AI playing, play the word out
            } else {
                if (this.#selected.length != this.#ai.mostRecentWord.length) {
                    this.#selected.push(this.#ai.mostRecentWord[this.#selected.length]);
                } else {
                    let capitalCaptured = this.#board.playTiles(this.#selected,this.#currentPlayer);
                    this.#advancePlayer(capitalCaptured);
                    if (this.#eliminatedPlayers.length == this.#players - 1) {
                        this.#popup = ['reset',new PopUp("You lost... Click to reset.",[0.6,0.2])];
                    }
                }
            }
            return; //no input while the AI is doing its thing
        }
        if (exiting) return this.#exitButton.newState();
        if (this.#submitButton.overlapping(input)) {
            let word = this.#word().toLowerCase();
            if (dict.verify(word)) {
                let capitalCaptured = this.#board.playTiles(this.#selected,this.#currentPlayer);
                this.#advancePlayer(capitalCaptured);
                if (this.#eliminatedPlayers.length == this.#players - 1) {
                    this.#popup = ['reset',new PopUp("Player " + (this.#currentPlayer + 1) + " wins! Click to reset.",[0.7,0.2])];
                } else if (capitalCaptured) {
                    //if it's a player's turn and they just captured a capital, popup about it
                    this.#popup = ['info',new PopUp("Capital captured! Extra turn!",[0.7,0.2])];
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
        //draw all the things on the board
        this.#board.render(canvas,this.#selected,this.#currentPlayer);
        this.#wordDisplay.setText(this.#word());
        this.#wordDisplay.render(canvas);
        this.#submitButton.render(canvas);
        this.#exitButton.render(canvas);
        this.#turner.render(canvas);
        if (this.#popup[0]) {
            this.#popup[1].render(canvas);
        }
    }

    #advancePlayer(capitalCaptured) {
        this.#selected = [];
        for (let i = 0; i < this.#players; i++) {
            if (!this.#eliminatedPlayers.includes(i) && this.#board.isEliminated(i)) {
                this.#eliminatedPlayers.push(i);
                this.#turner.eliminatePlayer(i);
            }
        }
        if (!capitalCaptured) {
            this.#board.regenerateCapitals();
            do {
                this.#currentPlayer = (this.#currentPlayer + 1) % this.#players;
            } while (this.#eliminatedPlayers.includes(this.#currentPlayer));
        }
        if (this.#currentPlayer >= this.#people) this.#ai.pickWord(this.#board,this.#currentPlayer);
        this.#turner.setTurn(this.#currentPlayer);
    }

    #word() {
        let word = "";
        for (const tile of this.#selected) {
            word += tile.letter.toUpperCase();
        }
        return word;
    }
}
