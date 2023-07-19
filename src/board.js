class Board {
    tiles;
    size;

    //construction of a new board uses the selected board layout
    constructor(layout) {
        this.size = layout.size;
    }
}


//0 = normal tile, 1-6 = player start location, -1 = wall (if we implement this)
class BoardLayout {
    tileStates;
    size;
    numPlayers;

    //default board layout
    constructor() {
        this.numPlayers = 2;
        this.size = [7,7];
        this.tileStates = [];
        for (let i = 0; i < size[0]; i++) {
            tiles[i] = [];
            var upperLimit = size[1];
            if (i % 2 == 0) upperLimit--;
            if (i % 2 == 1 && i == size[0] - 1) upperLimit -= 2;
            for (let j = 0; j < upperLimit; j++) {
                tiles[i][j] = 0;
            }
        }

        this.tileStates[1][1] = 1;
        this.tileStates[6][6] = 2;
    }
}