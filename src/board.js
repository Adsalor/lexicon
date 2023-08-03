//0 = normal tile, 1-6 = player start location, -1 = wall (if we implement this)
class BoardLayout {
    tileStates;
    size;

    //default board layout
    constructor(newSize = [7,7],newPlayers = 2) {
        this.size = newSize; // number of columns, hexes in large column
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

        //figure out new player placements
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
        //each hex is 1.5 side lengths, and the cap is an extra 0.5:
        //        __
        //  __   /   + \
        // /   + \__   /
        // \__   /
        // 1.5 + 1.5 + 0.5
        const lengthsToFill = 0.5 + this.size[0]*1.5;

        //and since side length * number of lengths to fill board = shorter side = 1:
        const sideLength = 1 / lengthsToFill;
        const innerRadius = (Math.sqrt(3) / 2) * sideLength;

        this.tiles = [];
        const evenOddOffset = this.size[1] % 2;
        //now, start constructing tiles in board according to board layout
        for (let i = 0; i < layout.tileStates.length; i++) {
            let newTileCol = [];
            for (let j = 0; j < layout.tileStates[i].length; j++) {
                let x = (1.5*i + 1) * sideLength;
                //y should be centered on 0.5 of the longer side = 8/9
                //2*(hexes in large column) - 1 possible slots
                //middle slot = 8/9, rest are off by innerRadius
                //even height columns have offset from 8/9 by innerRadius, increment by 2*innerRadius
                let y = 8/9 + ((j - (Math.floor(layout.tileStates[i].length / 2) )) * 2 * innerRadius) + ((i + evenOddOffset) % 2) * innerRadius;

                let newTile;
                if (layout.tileStates[i][j] > 0) {
                    newTile = new Tile('',x,y,sideLength*0.95,layout.tileStates[i][j]);
                } else if (layout.tileStates[i][j] === 0) {
                    newTile = new Tile(this.#generateLetter(),x,y,sideLength * 0.95);
                } else {
                    newTile = null;
                }

                newTileCol[j] = newTile;
            }
            this.tiles[i] = newTileCol;
        }

        
        this.#resetNonAdjacent();
    }

    render(canvas,selectedTiles,player) {
        let expansible,adjacent;
        [expansible,adjacent] = this.processTiles(selectedTiles,player);

        for (let i = 0; i < this.tiles.length; i++) {
            for (let j = 0; j < this.tiles[i].length; j++) {
                const tile = this.tiles[i][j];
                const renderMode = ((expansible.includes(tile))?1:(adjacent.includes(tile)?2:(selectedTiles.includes(tile)?3:0)));
                tile.render(canvas,player,renderMode);
            }
        }
    }

    #adjacentTilesToSlot(col,row) {
        //cheat a little
        const sideLength = this.tiles[0][0].size / 0.95;
        const innerRadius = (Math.sqrt(3) / 2) * sideLength;

        let output = [];
        if (col != 0) {
            for (let i = 0; i < this.tiles[col - 1].length; i++) {
                const xDist = this.tiles[col - 1][i].x - this.tiles[col][row].x;
                const yDist = this.tiles[col - 1][i].y - this.tiles[col][row].y;
                if (Math.sqrt(xDist*xDist + yDist*yDist) <= 2.05*sideLength) {
                    output.push(this.tiles[col - 1][i]);
                }
            }
        }
        if (col != this.size[0] - 1) {
            for (let i = 0; i < this.tiles[col + 1].length; i++) {
                const xDist = this.tiles[col + 1][i].x - this.tiles[col][row].x;
                const yDist = this.tiles[col + 1][i].y - this.tiles[col][row].y;
                if (Math.sqrt(xDist*xDist + yDist*yDist) <= 2.05*sideLength) {
                    output.push(this.tiles[col + 1][i]);
                }
            }
        }
        if (row != 0) output.push(this.tiles[col][row - 1]);
        if (row != this.tiles[col].length - 1) output.push(this.tiles[col][row + 1]);

        return output;
    }

    adjacentTilesToTile(tile) {
        for (let i = 0; i < this.tiles.length; i++) {
            let j = this.tiles[i].indexOf(tile);
            if (j == -1) continue;
            return this.#adjacentTilesToSlot(i,j);
        }
        throw new Error("Invalid tile, not in board!");
    }

    update(input) {
        for (let i = 0; i < this.size[0]; i++) {
            for (let j = 0; j < this.tiles[i].length; j++) {
                if (this.tiles[i][j].overlapping(input)) {
                    return this.tiles[i][j];
                }
            }
        }
        return false;
    }

    #resetNonAdjacent() {
        //for each non-owned tile, if no adjacent tiles are territory, set their letter to ''
        for (let i = 0; i < this.size[0]; i++) {
            for (let j = 0; j < this.tiles[i].length; j++) {
                let tile = this.tiles[i][j];
                if (tile.territoryOf) continue;
                let adjacent = this.#adjacentTilesToSlot(i,j);
                let territoryAdjacentFlag = false;
                for (const adjacentTile of adjacent) {
                    if (adjacentTile.territoryOf) {
                        territoryAdjacentFlag = true;
                        break;
                    }
                }
                if (territoryAdjacentFlag) continue;
                tile.letter = '';
            }
        }
    }

    //returns the set of tiles from selected tiles which will be expanded to
    //and the set of tiles which is adjacent to those tiles
    processTiles(selectedTiles,player) {
        var expansible = [];
        var expandAdjacent = [];

        //to get expansible tiles, repeatedly iterate the selected list checking for non-expansible tiles
        //adjacent to either player territory or other expansible tiles
        //until there are no new changes
        let newTilesFound = true;
        while (newTilesFound) {
            newTilesFound = false;
            for (let i = 0; i < selectedTiles.length; i++) {
                const currentTile = selectedTiles[i];
                if (expansible.includes(currentTile)) continue;
                let adjacencies = this.adjacentTilesToTile(currentTile);
                if (adjacencies.some(tile => (expansible.includes(tile) || tile.territoryOf === player + 1))) {
                    expansible.push(currentTile);
                    newTilesFound = true;
                }
            }
        }

        //to get adjacent tiles to expansible tiles, just combine all the sets of tiles adjacent to each
        //expansible tile with tiles owned by the same player and expansible tiles filtered out
        for (const tile of expansible) {
            let fullAdjacencies = this.adjacentTilesToTile(tile);
            //combine arrays after filtering out already owned tiles
            expandAdjacent = [...new Set([...expandAdjacent,...fullAdjacencies.filter(tile => 
                (tile.territoryOf != player + 1 && !expansible.includes(tile) && tile.letter === ''))])];
        }

        return [expansible,expandAdjacent];
    }

    playTiles(selectedTiles,player) {
        let expansible,adjacent;
        [expansible,adjacent] = this.processTiles(selectedTiles,player);

        for (let tile of selectedTiles) {
            if (expansible.includes(tile)) {
                tile.letter = '';
                tile.territoryOf = player + 1;
            } else {
                tile.letter = this.#generateLetter();
            }
        }

        for (let tile of adjacent) {
            tile.territoryOf = 0;
            tile.letter = this.#generateLetter();
        }

        this.#resetNonAdjacent();
    }

    isEliminated(player) {
        return !this.tiles.some(col => col.some(tile => tile.territoryOf == player + 1));
    }

    //AI and letter generation stuff
    availableLetterDist(player,selectedTiles = []) {
        let charMap = {};
        for (const char of "abcdefghijklmnopqrstuvwxyz") charMap[char] = 0;
        for (const col of this.tiles) {
            for (const tile of col) {
                if (!selectedTiles.includes(tile) && !tile.territoryOf && tile.letter) {
                    let weight = 1;
                    if (this.adjacentTilesToTile(tile).some((adj) => adj.territoryOf == player + 1)) weight += 1;
                    charMap[tile.letter.toLowerCase()] += weight;
                }
            }
        }
        return charMap;
    }

    tilesWithLetter(letter) {
        let result = [];
        for (const col of this.tiles) {
            for (const tile of col) {
                if (!tile.territoryOf && tile.letter.toLowerCase() == letter) result.push(tile);
            }
        }
        return result;
    }

    #generateLetter() {
        return this.#fullyRandomNewLetter();
    }

    //fully random
    #fullyRandomNewLetter() {
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        return alphabet[Math.floor(Math.random() * 26)];
    }

    //random following the distribution of letter frequencies in game dictionary
    #distrandomNewLetter() {

    }

    //random following frequency in all english
    #langRandomNewLetter() {

    }
}