//0 = normal tile, 1-6 = player start location, -1 = wall (if we implement this)
class BoardLayout {
    tileStates;
    size;
    numPlayers;

    //default board layout
    constructor() {
        this.numPlayers = 2;
        this.size = [7,7]; // number of columns, hexes in large column
        this.tileStates = [];
        for (let i = 0; i < this.size[0]; i++) {
            this.tileStates[i] = [];
            var upperLimit = this.size[1];
            if (i % 2 == 0) upperLimit--;
            if (i % 2 == 1 && i == this.size[0] - 1) upperLimit -= 2;
            for (let j = 0; j < upperLimit; j++) {
                this.tileStates[i][j] = 0;
            }
        }

        this.tileStates[1][1] = 1;
        this.tileStates[5][5] = 2;
    }
}

class Board {
    tiles;
    size;

    //construction of a new board uses the selected board layout
    constructor(layout) {
        this.size = layout.size;
        //the hexagon flat side will be directed along the shorter side
        //we want the hexagons to use the full width of the shorter side
        //every 2 rows/columns (depending on orientation) is 3 side lengths
        //so width of board is this many side lengths:
        const lengthsToFill = Math.floor(layout.size[0] / 2) * 3 + ((layout.size[0] % 2 == 0)?0.5:2);

        //and since side length * number of lengths to fill board = shorter side = 1:
        const sideLength = 1 / lengthsToFill;
        const innerRadius = (Math.sqrt(3) / 2) * sideLength;

        this.tiles = [];
        //now, start constructing tiles in board according to board layout
        for (let i = 0; i < layout.tileStates.length; i++) {
            let newTileCol = [];
            for (let j = 0; j < layout.tileStates[i].length; j++) {
                let x = (1.5*i + 1) * sideLength;
                //y should be centered on 0.5 of the longer side = 8/9
                //2*(hexes in large column) - 1 possible slots
                //middle slot = 8/9, rest are off by innerRadius
                //if i % 2 == 1, long column
                //if == 0, short column
                //short columns have offset from 8/9 by innerRadius, increment by 2*innerRadius
                let y = 8/9 + ((j - (Math.floor(layout.tileStates[i].length / 2) )) * 2 * innerRadius) + ((i + 1) % 2) * innerRadius;
                newTileCol[j] = new Tile('',x,y,sideLength * 0.95);
            }
            this.tiles[i] = newTileCol;
        }
    }

    render (canvas) {
        for (let i = 0; i < this.tiles.length; i++) {
            for (let j = 0; j < this.tiles[i].length; j++) {
                this.tiles[i][j].render(canvas);
            }
        }
    }
}