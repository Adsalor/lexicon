//Contains the core program logic: Program class and ProgramState class + subclasses
//Program and ProgramState form a State design pattern - Program is the context and
//ProgramStates are the states. Each state must be able to update with user input and render itself

//Best Practice explanation: 
//This pattern is used to manage the various states of gameplay. We chose to use it because
//a state pattern lends itself well to menus and game states with multiple potential transitions.
//For example, without the state pattern, we might have had to use a variable in the program class,
//store all potential displays in it, and use a switch statement to run in different contexts (menus, gameplay, etc)
//but with the state pattern, each game state is clearly compartmentalized and code is easier to work with and
//maintain. We also avoid having a 'god class' that does all the work.

class Program {
    //add your programState instantiations to Program.states
    #currentState;
    states = [];

    constructor() {
        this.states = [mainMenu,game,singleplayer,settingsMenu,gameSettingsMenu,displaySettingsMenu,MPgameMenu,SPgameMenu];
        this.#currentState = this.states[0]; // start from the main menu
    }

    //to update: take the current program state, update it, and switch to the new program state
    //then render the program
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

    //to render: clear the canvas, then draw the current state onto it
    render() {
        canvas.clear();
        this.#currentState.render(canvas);
    }
}

//'abstract' class
class ProgramState {
    #label; //string that is used to identify this programState

    constructor(newLabel) {
        this.#label = newLabel;
    }

    //'abstract' function
    update(input) {
        throw new Error("Update function must be implemented!");
    }
    
    //'abstract' function
    render(canvas) {
        throw new Error("Render function must be implemented!");
    }

    ID() {
        return this.#label;
    }
}

//Menus have a set of interactable and uninteractable elements that switch to other ProgramStates
class Menu extends ProgramState {
    #inputs = [];
    #displays = [];

    constructor(newLabel, newDevices, newDisplays = []) {
        super(newLabel);
        this.#inputs = newDevices;
        this.#displays = newDisplays;
    }

    //find the thing that was clicked on, update it, and return the new state it has
    update(input) {
        for (const device of this.#inputs) {

            //if we clicked on this thing, update it
            if (device.overlapping(input)) {
                device.update(input);

                //if updating it causes it to request a switch to a new ProgramState, return the new identifier
                if (device.newState()){
                    return device.newState();
                }

                //if not, we can only click one thing. so we're done.
                break;
            }
        }
        
        //if nothing special happened, stay on this menu
        return super.ID();
    }

    render(canvas) {
        //render all the inputdevices first
        for(let i = 0; i < this.#inputs.length;++i){
            this.#inputs[i].render(canvas);
        }

        //then render all the displays (we want text on top of the thing it's labeling, not below)
        for (const display of this.#displays) {
            display.render(canvas);
        }
    }
}

//the pregame menus are menus that allow the user to reset their targeted game or start playing it
//one for singleplayer and one for multiplayer
class PreGameMenu extends Menu {
    targetGame;
    resetButton;

    constructor(newLabel, targetGame) {
        let button = new Button(false,0.5,1.1,0.1);
        let devices = [new Button("mainMenu",0.1,0.1,0.07), new Button(targetGame.ID(),0.5,0.8,0.1), button];
        let displays = [new Label("return to menu",0.15,0.2,50,0.15,0.2), new Label("Play",0.5,0.8,50), new Label("Reset",0.5,1.1,50)];
        if(targetGame.ID()==="singleplayerGame"){
            //extra label for singleplayer to tell the player they are playing against a bot
            displays.push(new Label("Singleplayer:",0.5,0.5,75,0.95,0.2), new Label("Play against a bot",0.5,0.6,50,0.95,0.3));
        }
        super(newLabel,devices,displays);
        this.resetButton = button;
        this.targetGame = targetGame;
    }

    //if we clicked the reset button, reload the game
    //otherwise check that the menu button was clicked
    update(input) {
        if (this.resetButton.overlapping(input)) {
            this.targetGame.reload();
        }
        return super.update(input);
    }
}

//game settings menu: this is a bit ugly
//probably there's a more elegant design
//store the buttons and displays that do unique things
//and do the unique logic for them
class GameSettingsMenu extends Menu {
    //player count things
    playerUpButton;
    playerDownButton;
    playerCountDisplay;

    //board width things
    boardWidthUpButton;
    boardWidthDownButton;
    boardWidthDisplay;

    //board height things
    boardHeightUpButton;
    boardHeightDownButton;
    boardHeightDisplay;

    //we know what they should be
    constructor(newLabel) {
        let pUB = new Button(false,0.9,0.4,0.05,0.2,0.6);
        let pDB = new Button(false,0.6,0.4,0.05,0.2,0.9);
        //start by setting label to what the actual current count is
        let pCD = new Label(gameSettings.numPlayers.toString(),0.75,0.4,50,0.2,0.75);

        let bWUB = new Button(false,0.9,0.7,0.05,0.7,0.6);
        let bWDB = new Button(false,0.6,0.7,0.05,0.7,0.9);
        //set label to actual current width
        let bWD = new Label(gameSettings.boardSize[0].toString(),0.75,0.7,50);
        
        let bHUB = new Button(false,0.9,1.0,0.05,1.2,0.6);
        let bHDB = new Button(false,0.6,1.0,0.05,1.2,0.9);
        //set label to actual current height
        let bHD = new Label(gameSettings.boardSize[1].toString(),0.75,1.0,50,1.2,0.75);
        
        let devices = [new Button("settingsMenu",0.1,0.1,0.07),pUB,pDB,bWUB,bWDB,bHUB,bHDB];
        let displays = [new Label("return to menu",0.15,0.2,50,0.15,0.2),new Label("Player Count",0.3,0.4,70,0.2,0.4),
            new Label("Board Width",0.3,0.7,70,0.7,0.4),new Label("Board Height",0.3,1.0,70,1.2,0.4),

            //+ and - labels on the increase/decrease buttons
            new Label("+",0.9,0.4,70,0.2,0.6),new Label("-",0.6,0.4,70,0.2,0.9),
            new Label("+",0.9,0.7,70,0.7,0.6),new Label("-",0.6,0.7,70,0.7,0.9),
            new Label("+",0.9,1.0,70,1.2,0.6),new Label("-",0.6,1.0,70,1.2,0.9),

            //actual status displays
            pCD,bWD,bHD];
        
        super(newLabel,devices,displays);

        //store all the things
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
        //for each button that does something, do the associated thing
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

    //update all display contents before rendering
    render(canvasHandler) {
        this.playerCountDisplay.setText(gameSettings.numPlayers.toString());
        this.boardWidthDisplay.setText(gameSettings.boardSize[0].toString());
        this.boardHeightDisplay.setText(gameSettings.boardSize[1].toString());
        super.render(canvasHandler);
    }
}

//display settings menu looks nicer than game settings but that's just because there's
//less stuff in it. end of the day, it's still kind of gross and there's probably a better way
class DisplaySettingsMenu extends Menu {
    // mimic the game settings (save special objects)
    darkModeSwitch;

    constructor(newLabel) {
        let menuButton = new Button("settingsMenu",0.1,0.1,0.07);
        let dmSwitch = new Switch(false, 0.7,0.5,0.1);
        let dmLabel = new Label("Dark Mode", 0.3,0.5,50,0.7,0.3);
        let menuLabel = new Label("return to menu",0.15,0.2,50,0.15,0.2);
        let devices = [menuButton, dmSwitch];
        let displays = [dmLabel, menuLabel];
        super(newLabel, devices, displays);

        this.darkModeSwitch = dmSwitch;
        //update switch starting position to match settings
        this.darkModeSwitch.toggle = displaySettings.darkMode;
    }

    update(input) {
        //if we clicked the switch do stuff otherwise check if we left
        if (this.darkModeSwitch.overlapping(input)) {
            this.darkModeSwitch.update(input);
            displaySettings.updateDarkMode(this.darkModeSwitch.toggle);
            return;
        } else return super.update(input);
    }

    render(canvasHandler) {
        //make sure switch has right value on it, then render
        this.darkModeSwitch.toggle = displaySettings.darkMode;
        super.render(canvasHandler);
    }
}

//the meat
//this is probably the biggest class
//it handles all the game logic: board, players, AI, selected tiles
class Game extends ProgramState {
    #board; //board game is played on
    #people; //people is number of actual humans playing, vs players which includes AI plays
    #players; //number of players (including AI)
    #eliminatedPlayers; //set of players who have been eliminated in current game
    #selected; //set of selected tiles
    #wordDisplay; //Label that displays selected word
    #submitButton; //button players use to submit word
    #submitLabel; //text to describe button
    #exitButton; //button to exit game and return to menu
    #exitLabel; //text to describe exit button
    #currentPlayer; //the player currently playing the game
    #turner; //the turn indicator display
    #ai; //game AI
    #popup; //array, first value is mode of popup, second is actual object

    constructor(newLabel,aboveMenu = "mainMenu",singleplayer = false) {
        super(newLabel);
        //stuff that's always constant
        this.#ai = new AI();
        this.#people = (singleplayer?1:gameSettings.numPlayers);
        this.#wordDisplay = new Label("",0.5,0.32,90);
        this.#submitButton = new Button(false,0.1,0.1,0.07);
        this.#submitLabel = new Label("Submit",0.1,0.2,50,0.25,0.1);
        this.#exitButton = new Button(aboveMenu,0.9,0.1,0.07);
        this.#exitLabel = new Label("Exit",0.9,0.2,50,0.22,0.9);
        //stuff that changes every reload
        this.reload();
    } 

    //reset game content
    reload() {
        //if singleplayer, use the singleplayer board / 2 players (person and AI)
        //otherwise, update the player count and use the normal board layout
        if (this.#people == 1) {
            this.#board = new Board(gameSettings.singleplayerLayout,10/9);
            this.#players = 2;
        } else {
            this.#board = new Board(gameSettings.boardLayout,10/9);
            this.#people = gameSettings.numPlayers;
            this.#players = gameSettings.numPlayers;
        }
        //reset the turn indicator to match player count
        this.#turner = new TurnIndicator(0.5,0.15,0.05,this.#players);
        this.#eliminatedPlayers = []; //clear eliminated players
        this.#currentPlayer = 0; //start at player 1
        this.#selected = [];
        this.#wordDisplay.setText("");
        this.#popup = [false,null]; //clear any existing popups
    }

    //handle input and update (lots of stuff happens here)
    update(input) {
        if (this.#popup[0]) { //if pop-up window active, no input goes to board itself
            if (this.#popup[0] == 'reset') {
                //if the popup should reset the game on exit, do so
                this.reload();
            } else {
                //otherwise, clear the popup
                this.#popup = [false,null];
            }
            return;
        }

        //readability
        let exiting = this.#exitButton.overlapping(input);

        //if it's an AI turn
        if (this.#currentPlayer >= this.#people) {
            if (exiting) {
                let capitalCaptured = this.#board.playTiles(this.#ai.mostRecentWord,this.#currentPlayer);
                this.#advancePlayer(capitalCaptured);

                return this.#exitButton.newState(); //if player quits while AI playing, play the word out before quit
            } else {
                //if the AI hasn't finished typing yet, type the next character
                if (this.#selected.length != this.#ai.mostRecentWord.length) {
                    this.#selected.push(this.#ai.mostRecentWord[this.#selected.length]);
                } else {
                    //otherwise, play the word
                    let capitalCaptured = this.#board.playTiles(this.#selected,this.#currentPlayer);
                    this.#advancePlayer(capitalCaptured);

                    //if the AI won, do a popup so that the player knows they lost
                    if (this.#eliminatedPlayers.length == this.#players - 1) {
                        this.#popup = ['reset',new PopUp("You lost... Click to reset.",[0.6,0.2])];
                    }
                }
            }
            return; //no input while the AI is doing its thing
        }

        //player's turn, if they're leaving then leave
        if (exiting) return this.#exitButton.newState();

        //if they tried to submit the word:
        if (this.#submitButton.overlapping(input)) {
            let word = this.#word().toLowerCase();
            if (dict.verify(word)) { //if the word is legal, play it
                let capitalCaptured = this.#board.playTiles(this.#selected,this.#currentPlayer);
                this.#advancePlayer(capitalCaptured);

                //if the player won, do a winning popup
                if (this.#eliminatedPlayers.length == this.#players - 1) {
                    this.#popup = ['reset',new PopUp("Player " + (this.#currentPlayer + 1) + " wins! Click to reset.",[0.7,0.2])];
                } else if (capitalCaptured) {
                    //if it's a player's turn and they just captured a capital, notify them
                    this.#popup = ['info',new PopUp("Capital captured! Extra turn!",[0.7,0.2])];
                }
            } else { //if the word is invalid, make the display red so the player knows
                this.#wordDisplay.setColor('red');
            }
        } else {
            //if they didn't try to submit the word, check if they picked a tile
            let newTile = this.#board.update(input);
            if (newTile && !newTile.territoryOf && newTile.letter != '') {

                //if they did, toggle it into/out of the selected tiles
                let index = this.#selected.indexOf(newTile);
                if (index === -1) {
                    this.#selected.push(newTile);
                } else {
                    this.#selected.splice(index,1);
                }
            }

            //any change in the selected tiles clears the red/invalidity indicator
            this.#wordDisplay.setColor('default');
        }
    }

    render(canvas) {
        //draw all the things on the board
        this.#board.render(canvas,this.#selected,this.#currentPlayer);
        this.#wordDisplay.setText(this.#word());
        this.#wordDisplay.render(canvas);
        this.#submitButton.render(canvas);
        this.#submitLabel.render(canvas);
        this.#exitButton.render(canvas);
        this.#exitLabel.render(canvas);
        this.#turner.render(canvas);

        //if there's a popup, render it too
        if (this.#popup[0]) {
            this.#popup[1].render(canvas);
        }
    }

    //go to the next player
    #advancePlayer(capitalCaptured) {
        //clear the selected tiles so the new player starts fresh
        this.#selected = [];

        //check for and eliminate players
        for (let i = 0; i < this.#players; i++) {
            if (!this.#eliminatedPlayers.includes(i) && this.#board.isEliminated(i)) {
                this.#eliminatedPlayers.push(i);
                this.#turner.eliminatePlayer(i);
            }
        }

        //if no capital was captured, advance the turn (capturing a capital gives an extra turn)
        if (!capitalCaptured) {
            //don't regenerate capitals while the extra turn is starting
            this.#board.regenerateCapitals();
            do {
                this.#currentPlayer = (this.#currentPlayer + 1) % this.#players;
            } while (this.#eliminatedPlayers.includes(this.#currentPlayer)); //skip gone players
        }

        //if the AI is up, pick its word
        if (this.#currentPlayer >= this.#people) this.#ai.pickWord(this.#board,this.#currentPlayer);

        //update the turn indicator
        this.#turner.setTurn(this.#currentPlayer);
    }

    //concatenate tile letters
    #word() {
        let word = "";
        for (const tile of this.#selected) {
            word += tile.letter.toUpperCase();
        }
        return word;
    }
}
