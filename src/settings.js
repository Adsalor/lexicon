//Contains both settings classes, game and display
//both would be singletons but js doesn't have those
//so they're just global variable instances instead

class GameSettings {
    //actual settings
    numPlayers;
    boardSize;
    boardLayout;

    //configuration
    minSizes;
    maxSize;

    constructor() {
        this.numPlayers = 2;
        this.boardSize = [7,7];
        this.boardLayout = new BoardLayout();
        this.minSizes = [7,8,9,11,13];
        this.maxSize = [13,13];
    }

    //if a save exists, load the settings from it
    loadFromSave() {
        if (localStorage.getItem('displayStored') !== null) {
            this.numPlayers = JSON.parse(localStorage.getItem('numPlayers'));
            this.boardSize = JSON.parse(localStorage.getItem('boardSize'));
            this.boardLayout = JSON.parse(localStorage.getItem('boardLayout'));
        }
    }

    //save the settings and indicate that a save does exist
    exportSave() {
        localStorage.setItem('numPlayers',JSON.stringify(this.numPlayers));
        localStorage.setItem('boardSize',JSON.stringify(this.boardSize));
        localStorage.setItem('boardLayout',JSON.stringify(this.boardLayout));
        localStorage.setItem('displayStored',"y");
    }

    //if the number of players is 2, the layout is valid
    //if it's for more than 2 players, it's not, so make the default
    get singleplayerLayout() {
        if (this.numPlayers == 2) return this.boardLayout;
        else return new BoardLayout();
    }

    //gets legal changes to the settings
    get legalActions() {
        let actions = {};
        //can only increase player count if the board is large enough and player count isn't at its max
        actions['pU'] = (this.numPlayers < 6) && (Math.min(...this.boardSize) >= this.minSizes[this.numPlayers - 1]);
        //can only decrease if isn't at min
        actions['pD'] = (this.numPlayers > 2);
        //can only increase width/height if not at max
        actions['wU'] = (this.boardSize[0] < this.maxSize[0]);
        actions['hU'] = (this.boardSize[1] < this.maxSize[1]);
        //can only decrease width/height if the player count fits on the smaller board
        actions['wD'] = (this.boardSize[0] > 7) && (this.boardSize[0] > this.minSizes[this.numPlayers - 2]);
        actions['hD'] = (this.boardSize[1] > 7) && (this.boardSize[1] > this.minSizes[this.numPlayers - 2]);
        return actions;
    }

    //attempt to increase player count (only works if legal)
    increasePlayers() {
        if (this.legalActions['pU']) {
            this.numPlayers++;
            this.boardLayout = new BoardLayout(this.boardSize,this.numPlayers);
        }
    }
    
    //attempt to decrease player count (only works if legal)
    decreasePlayers() {
        if (this.legalActions['pD']) {
            this.numPlayers--;
            this.boardLayout = new BoardLayout(this.boardSize,this.numPlayers);
        }
    }

    //you get the idea
    increaseWidth() {
        if (this.legalActions['wU']) {
            this.boardSize[0]++;
            this.boardLayout = new BoardLayout(this.boardSize,this.numPlayers);
        }
    }

    decreaseWidth() {
        if (this.legalActions['wD']) {
            this.boardSize[0]--;
            this.boardLayout = new BoardLayout(this.boardSize,this.numPlayers);
        }
    }

    increaseHeight() {
        if (this.legalActions['hU']) {
            this.boardSize[1]++;
            this.boardLayout = new BoardLayout(this.boardSize,this.numPlayers);
        }
    }

    decreaseHeight() {
        if (this.legalActions['hD']) {
            this.boardSize[1]--;
            this.boardLayout = new BoardLayout(this.boardSize,this.numPlayers);
        }
    }
}

//not currently implemented: colorblind mode, variable font size
class DisplaySettings {
    darkMode;
    colorblind;
    playerColors;
    fontSize;

    constructor() {
        this.darkMode = false;
        this.colorblind = false;
        this.playerColors = ["FireBrick","SteelBlue","ForestGreen","GoldenRod","DarkOrchid","DarkOrange"];
        this.fontSize = 0.5;
    }

    //same as gameSettings but also:
    loadFromSave() {
        if (localStorage.getItem('gameSettingsStored') !== null) {
            this.darkMode = JSON.parse(localStorage.getItem('darkMode'));
            this.colorblind = JSON.parse(localStorage.getItem('colorblind'));
            this.playerColors = JSON.parse(localStorage.getItem('playerColors'));
            this.fontSize = JSON.parse(localStorage.getItem('fontSize'));
        }
        //update the page to match the stored setting
        this.updateDarkMode();
    }

    //same as gameSettings
    exportSave() {
        localStorage.setItem('darkMode',JSON.stringify(this.darkMode));
        localStorage.setItem('colorblind',JSON.stringify(this.colorblind));
        localStorage.setItem('playerColors',JSON.stringify(this.playerColors));
        localStorage.setItem('fontSize',JSON.stringify(this.fontSize));
        localStorage.setItem('gameSettingsStored','y');
    }

    //toggle all the page elements to match the dark mode setting (or update darkmode then match page to it)
    updateDarkMode(newDarkMode = this.darkMode) {
        this.darkMode = newDarkMode;
        $("body, body *").toggleClass('darkMode',this.darkMode);
    }
}

var gameSettings = new GameSettings();
var displaySettings = new DisplaySettings();