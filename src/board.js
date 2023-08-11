//0 = normal tile, 1-6 = player start location, -1 = wall (if we implement this)
class BoardLayout {
    tileStates;
    size;

    //construct board layout, default args are the 'standard' board configuration
    constructor(newSize = [7,7],newPlayers = 2) {
        this.size = newSize; // number of columns, hexes in large column
        this.tileStates = [];

        //populate each column with 0s, set size to match correct column height (short on leftmost col, then alternating)
        //rightmost column is always 1 less than the one to its left
        for (let i = 0; i < this.size[0]; i++) {
            this.tileStates[i] = [];

            //upper limit alternates between max and 1 below max
            let upperLimit = this.size[1];
            if (i % 2 == 0) upperLimit--;

            //if last column is odd (would be tall) shorten by 2 to make board look nicer
            if (i % 2 == 1 && i == this.size[0] - 1) upperLimit -= 2;

            //populate array up to limit w/ 0s
            for (let j = 0; j < upperLimit; j++) {
                this.tileStates[i][j] = 0;
            }
        }

        //figure out new player placements
        //upper left corner is p1, lower right is p2, lower left is p3, lower right is p4
        //if 5 players, p5 gets center
        //if 6 players, p5 and p6 get midway side column centers
        this.tileStates[1][1] = 1;
        this.tileStates[this.tileStates.length - 2][this.tileStates[this.tileStates.length - 2].length - 2] = 2;
        if (newPlayers > 2) this.tileStates[1][this.tileStates[1].length - 2] = 3;
        if (newPlayers > 3) this.tileStates[this.tileStates.length - 2][1] = 4;
        
        //middle tile of middle column (spawning here sucks, but idk where else to put them)
        //at least aggressive play is strong there
        if (newPlayers == 5) this.tileStates[Math.floor((this.tileStates.length - 1) / 2)][Math.floor((this.tileStates[Math.floor((this.tileStates.length - 1) / 2)].length - 1) / 2)] = 5;
        else if (newPlayers == 6) {
            //middle tile of columns partway through the left and right (4th on left and right) go to players 5 and 6
            this.tileStates[3][Math.floor((this.tileStates[3].length - 1) / 2)] = 5;
            this.tileStates[this.tileStates.length - 4][Math.floor((this.tileStates[this.tileStates.length - 4].length - 1) / 2)] = 6;
        }
    }
}

class Board {
    tiles;
    size;

    //construction of a new board uses the selected board layout
    constructor(layout,centerY = 8/9) {
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
                let y = centerY + ((j - (Math.floor(layout.tileStates[i].length / 2) )) * 2 * innerRadius) + ((i + evenOddOffset) % 2) * innerRadius;

                //make new tile based on boardlayout slot
                let newTile;
                if (layout.tileStates[i][j] > 0) {
                    newTile = new Tile('',x,y,sideLength*0.95,layout.tileStates[i][j]);
                    newTile.isCapital = true;
                } else if (layout.tileStates[i][j] === 0) {
                    newTile = new Tile(this.#generateLetter(),x,y,sideLength * 0.95);
                } else {
                    newTile = null;
                }

                newTileCol[j] = newTile;
            }
            this.tiles[i] = newTileCol;
        }

        //clear border tiles that aren't adjacent to a player's territory
        this.#resetNonAdjacent();
    }

    //render the board on the canvas
    render(canvas,selectedTiles,player) {
        //get tile information given the selected tiles
        let expansible,adjacent;
        [expansible,adjacent] = this.processTiles(selectedTiles,player);

        //render each tile
        for (let i = 0; i < this.tiles.length; i++) {
            for (let j = 0; j < this.tiles[i].length; j++) {
                const tile = this.tiles[i][j];
                //rendermode is a rendering flag that says what fancy preview the tile should use
                //see inputDevices::Tile::render for more info
                const renderMode = ((expansible.includes(tile))?1:(adjacent.includes(tile)?2:(selectedTiles.includes(tile)?3:0)));
                tile.render(canvas,player,renderMode);
            }
        }
    }

    //returns the adjacent tiles to the tile in that slot
    //private bc everything else calls this through adjacentTilesToTile
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

    //get adjacent tiles to a given tile in the board
    //TODO: reconstruct indices from tile coordinates and call directly
    adjacentTilesToTile(tile) {
        for (let i = 0; i < this.tiles.length; i++) {
            let j = this.tiles[i].indexOf(tile);
            if (j == -1) continue;
            return this.#adjacentTilesToSlot(i,j);
        }
        throw new Error("Invalid tile, not in board!");
    }

    //update the board (return the tile that was clicked on, or false if none was clicked)
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

    //clear border tiles which aren't adjacent to a player's territory
    //this keeps the letter selection from ballooning and makes the board look nice
    #resetNonAdjacent() {
        //for each non-owned tile, if no adjacent tiles are territory, set their letter to ''
        for (let i = 0; i < this.size[0]; i++) {
            for (let j = 0; j < this.tiles[i].length; j++) {
                let tile = this.tiles[i][j];
                
                //if the tile is a player's territory we don't care about it
                if (tile.territoryOf) continue;
                
                //if some adjacent tile is territory, we don't reset
                //otherwise clear the letter from it
                let adjacent = this.#adjacentTilesToSlot(i,j);
                if (adjacent.some((tile)=>tile.territoryOf)) continue;
                tile.letter = '';
            }
        }
    }

    //returns the set of tiles from selected tiles which will be expanded to
    //and the set of tiles which is adjacent to those tiles
    processTiles(selectedTiles,player) {
        let expansible = [];
        let expandAdjacent = [];

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
                //if some adjacent tile is going to be expanded or is territory of the player, this one is too
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

    //actually update the board in response to a play
    //returns whether a capital tile was captured, for game logic
    playTiles(selectedTiles,player) {
        let expansible,adjacent;
        [expansible,adjacent] = this.processTiles(selectedTiles,player);

        //selected tiles are either going to be territory or get their letter rerolled
        for (let tile of selectedTiles) {
            if (expansible.includes(tile)) {
                tile.letter = '';
                tile.territoryOf = player + 1;
            } else {
                tile.letter = this.#generateLetter();
            }
        }

        //make adjacencies into borders, if a capital was adjacent store it
        let capitalCaptured = false;

        for (let tile of adjacent) {
            tile.territoryOf = 0;
            if (tile.isCapital) {
                capitalCaptured = true;
                tile.isCapital = false;
            }
            tile.letter = this.#generateLetter();
        }

        //after the board update, reset non-adjacent tiles
        this.#resetNonAdjacent();

        return capitalCaptured;
    }

    regenerateCapitals() {
        //check that each player in the game has a capital
        //if not, regenerate their capital by making the tile adjacent to fewest borders a capital
        let playersInGame = new Set();
        let playersHaveCapital = new Set();

        //identify players and players with capitals
        for (const col of this.tiles) {
            for (const tile of col) {
                if (tile.territoryOf) playersInGame.add(tile.territoryOf);
                if (tile.capitalOf) playersHaveCapital.add(tile.capitalOf);
            }
        }

        //set subtract for players who need capitals
        let playersNeedRegen = [...playersInGame].filter((player) => !playersHaveCapital.has(player));

        //give each player who needs it a new capital
        for (const player of playersNeedRegen) {
            let territory = [];

            //find all tiles of player territory
            for (const col of this.tiles) {
                for (const tile of col) {
                    if (tile.territoryOf == player) territory.push(tile);
                }
            }

            //the new capital is the tile in the player's territory adjacent to the most other tiles of theirs
            //this ugly code does that, by reducing the array to the single element with the highest count
            const newCapital = territory.reduce((prev,current) => ((this.adjacentTilesToTile(prev).filter((tile) => (tile.territoryOf == player)).length < this.adjacentTilesToTile(current).filter((tile) => (tile.territoryOf == player)).length)?current:prev))
            newCapital.isCapital = true;
        }
    }

    //check if a player is completely gone from the board
    isEliminated(player) {
        return !this.tiles.some(col => col.some(tile => tile.territoryOf == player + 1));
    }

    //AI and letter generation stuff

    //get the weighted distribution of playable letters (letters on tiles)
    availableLetterDist(player,selectedTiles = []) {

        //initialize dict to 0 in each letter of alphabet
        let charMap = {};
        for (const char of "abcdefghijklmnopqrstuvwxyz") charMap[char] = 0;

        //check all tiles
        for (const col of this.tiles) {
            for (const tile of col) {
                //only count unused tiles with letters that are borders
                if (!selectedTiles.includes(tile) && !tile.territoryOf && tile.letter) {

                    //normal tiles get weight 1, tiles on the player's border get weight 2
                    //TODO: experiment with different values
                    let weight = 1;
                    if (this.adjacentTilesToTile(tile).some((adj) => adj.territoryOf == player + 1)) weight += 1;
                    charMap[tile.letter.toLowerCase()] += weight;
                }
            }
        }
        return charMap;
    }

    //get the list of all tiles with a given letter on them
    tilesWithLetter(letter) {
        let result = [];
        for (const col of this.tiles) {
            for (const tile of col) {
                if (!tile.territoryOf && tile.letter.toLowerCase() == letter) result.push(tile);
            }
        }
        return result;
    }

    //letter generation
    #generateLetter() {
        return this.#distrandomNewLetter();
    }

    //fully random
    #fullyRandomNewLetter() {
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        return alphabet[Math.floor(Math.random() * 26)];
    }

    //random following the distribution of letter frequencies in game dictionary
    #distrandomNewLetter() {

        //get the count of all letters in the dictionary
        //dict.distribution is the count of occurrences of each letter
        let totalLetters = 0;
        for (const [key, value] of Object.entries(dict.distribution)) {
            totalLetters += value;
        }

        //random within that range, then check if it's within each slot and if not cut that slot out
        let selection = Math.floor(Math.random() * totalLetters);
        for (const [key, value] of Object.entries(dict.distribution)) {
            if (selection < value) return key.toUpperCase();
            else selection -= value;
        }
    }

    //TODO (or not needed): random following frequency in all english
    #langRandomNewLetter() {

    }
}