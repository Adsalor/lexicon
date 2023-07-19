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
        this.numPlayers = localStorage.getItem('numPlayers');
        this.boardSize = localStorage.getItem('boardSize');
        this.boardLayout = localStorage.getItem('boardLayout');
    }

    exportSave() {
        localStorage.setItem('numPlayers',this.numPlayers);
        localStorage.setItem('boardSize',this.boardSize);
        localStorage.setItem('boardLayout',this.boardLayout);
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
        this.fontSize = "12px";
    }

    loadFromSave() {
        this.darkMode = localStorage.getItem('darkMode');
        this.colorblind = localStorage.getItem('colorblind');
        this.playerColors = localStorage.getItem('playerColors');
        this.fontSize = localStorage.getItem('fontSize');
    }

    exportSave() {
        localStorage.setItem('darkMode',this.darkMode);
        localStorage.setItem('colorblind',this.colorblind);
        localStorage.setItem('playerColors',this.playerColors);
        localStorage.setItem('fontSize',this.fontSize);
    }
}