class AI {
    mostRecentWord;

    constructor() {
        this.mostRecentWord = [];
    }

    utilityScore(selectedTiles,board,player,tile) {
        //calculate utility score of tile
        //tile is useful if helps expand our territory
        //*very* useful if defends capital
        //useful if captures opponent territory
        //more useful if captures opponent capital

        let utility = 0;
        
        //TODO: make this more efficient, we can construct expansible/adjacent as we add new tiles
        let expansible,adjacent;
        [expansible,adjacent] = board.processTiles(selectedTiles,player);

        let adjacencies = board.adjacentTilesToTile(tile);

        //if tile is adjacent to currently expansible tiles, it helps capture more territory
        if (adjacent.includes(tile)) {
            utility++;
            if (adjacencies.some((adj) => adj.capitalOf != 0 && adj.capitalOf != player + 1)) {
                utility += 2;
            } else if (adjacencies.some((adj) => adj.territoryOf != 0 && adj.territoryOf != player + 1)) {
                utility++;
            }
        }

        if (adjacencies.some((adj) => adj.capitalOf == player + 1)) utility += 3; 

        return utility;
    }
    
    pickTile(selectedTiles, board, player) {
        console.log("searching for next tile with selected tiles",selectedTiles);

        //what we already have typed in
        let ranks = this.rankLetters(selectedTiles,board,player);

        if (ranks === false) {
            console.log("dead end hit at",selectedTiles);
            return false;
        }

        //pick the best tile with that letter
        for (let i = 0; i < ranks.length; i++) {
            console.log("attempting to use letter",ranks[i],"with selected tiles",selectedTiles);
            let tiles = board.tilesWithLetter(ranks[i]).filter((tile) => !selectedTiles.includes(tile));
            console.log("available tiles with ",ranks[i],tiles);
            let bestTile = tiles[0]; //guaranteed to be at least one because if not on board then score = 0
            let bestUtility = this.utilityScore(selectedTiles,board,player,bestTile);
            for (const tile of tiles.slice(1)) {
                let utility = this.utilityScore(selectedTiles,board,player,tile);
                if (utility > bestUtility) {
                    bestTile = tile;
                    bestUtility = utility;
                }
            }
            console.log("selected best utility tile",bestTile);
            selectedTiles.push(bestTile);
            let result = this.pickTile(selectedTiles,board,player);
            if (result === false) {
                selectedTiles.pop();
                continue;
            }
            if (true/*utility of word is above certain amount*/) return result;
        }

        //if no extension is possible, if what we've got is a word, great
        //otherwise return false
        if (dict.verify(this.#word(selectedTiles)) && true/*other conditions (length?)*/) return selectedTiles;
        return false;
    }

    rankLetters(selectedTiles,board,player) {
        console.log("ranking letters given selected",selectedTiles);
        //what we already have typed in
        let snippet = this.#word(selectedTiles);
        console.log("current snippet",snippet);


        //get the distribution of next letters off of this
        let dictDist = dict.getNextLetterDist(snippet);
        console.log("current dictionary distribution",dictDist);

        //get the board tile distribution
        let boardDist = board.availableLetterDist(player,selectedTiles);
        console.log("current board availability distribution",boardDist);

        let ranks = "abcdefghijklmnopqrstuvwxyz".split("");
        ranks.sort((l,r)=>(dictDist[r]*boardDist[r]-dictDist[l]*boardDist[l]));

        //filter invalid options
        ranks = ranks.filter((char)=>dictDist[char]*boardDist[char] > 0);

        console.log("ranked letters as",ranks.join(""));

        if (dictDist[ranks[0]] * boardDist[ranks[0]] == 0) {
            console.log("best letter",ranks[0],"is invalid!");
            return false;
        }
        return ranks;
    }

    pickWord(board,player) {
        //driver for recursive function
        console.log("beginning search for word to play");
        let chosenTiles = [];
        this.mostRecentWord = this.pickTile(chosenTiles,board,player);
        return this.mostRecentWord;
    }

    #word(selectedTiles) {
        let word = "";
        for (const tile of selectedTiles) {
            word += tile.letter.toUpperCase();
        }
        return word;
    }
}