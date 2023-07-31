class GameSettings {
    numPlayers;
    boardSize;
    boardLayout;

    constructor() {
        this.numPlayers = 2;
        this.boardSize = [7,7];
        this.boardLayout = new BoardLayout();
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