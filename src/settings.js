class GameSettings {
    numPlayers;
    boardSize;
    boardLayout;
    minSizes;
    maxSize;

    constructor() {
        this.numPlayers = 2;
        this.boardSize = [7,7];
        this.boardLayout = new BoardLayout();
        this.minSizes = [7,8,9,11,13];
        this.maxSize = [13,13];
    }

    loadFromSave() {
        if (localStorage.getItem('displayStored') !== null) {
            this.numPlayers = JSON.parse(localStorage.getItem('numPlayers'));
            this.boardSize = JSON.parse(localStorage.getItem('boardSize'));
            this.boardLayout = JSON.parse(localStorage.getItem('boardLayout'));
        }
    }

    exportSave() {
        localStorage.setItem('numPlayers',JSON.stringify(this.numPlayers));
        localStorage.setItem('boardSize',JSON.stringify(this.boardSize));
        localStorage.setItem('boardLayout',JSON.stringify(this.boardLayout));
        localStorage.setItem('displayStored',"y");
    }

    get singleplayerLayout() {
        if (this.numPlayers == 2) return this.boardLayout;
        else return new BoardLayout();
    }

    get legalActions() {
        let actions = {};
        actions['pU'] = (this.numPlayers < 6) && (Math.min(...this.boardSize) >= this.minSizes[this.numPlayers - 1]);
        actions['pD'] = (this.numPlayers > 2);
        actions['wU'] = (this.boardSize[0] < 13);
        actions['wD'] = (this.boardSize[0] > 7) && (this.boardSize[0] > this.minSizes[this.numPlayers - 2]);
        actions['hU'] = (this.boardSize[1] < 13);
        actions['hD'] = (this.boardSize[1] > 7) && (this.boardSize[1] > this.minSizes[this.numPlayers - 2]);
        return actions;
    }

    increasePlayers() {
        if (this.legalActions['pU']) {
            this.numPlayers++;
            this.boardLayout = new BoardLayout(this.boardSize,this.numPlayers);
        }
    }

    decreasePlayers() {
        if (this.legalActions['pD']) {
            this.numPlayers--;
            this.boardLayout = new BoardLayout(this.boardSize,this.numPlayers);
        }
    }

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

    loadFromSave() {
        if (localStorage.getItem('gameSettingsStored') !== null) {
            this.darkMode = JSON.parse(localStorage.getItem('darkMode'));
            this.colorblind = JSON.parse(localStorage.getItem('colorblind'));
            this.playerColors = JSON.parse(localStorage.getItem('playerColors'));
            this.fontSize = JSON.parse(localStorage.getItem('fontSize'));
        }
        this.updateDarkMode();
    }

    exportSave() {
        localStorage.setItem('darkMode',JSON.stringify(this.darkMode));
        localStorage.setItem('colorblind',JSON.stringify(this.colorblind));
        localStorage.setItem('playerColors',JSON.stringify(this.playerColors));
        localStorage.setItem('fontSize',JSON.stringify(this.fontSize));
        localStorage.setItem('gameSettingsStored','y');
    }

    updateDarkMode() {
        $("body, body *").toggleClass('darkMode',this.darkMode);
    }
}

var gameSettings = new GameSettings();

var displaySettings = new DisplaySettings();