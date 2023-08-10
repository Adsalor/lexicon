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

        //what we already have typed in
        let ranks = this.rankLetters(selectedTiles,board,player);

        if (ranks === false) {
            return false;
        }

        //pick the best tile with that letter
        for (let i = 0; i < ranks.length; i++) {
            let tiles = board.tilesWithLetter(ranks[i]).filter((tile) => !selectedTiles.includes(tile));
            let bestTile = tiles[0]; //guaranteed to be at least one because if not on board then score = 0
            let bestUtility = this.utilityScore(selectedTiles,board,player,bestTile);
            for (const tile of tiles.slice(1)) {
                let utility = this.utilityScore(selectedTiles,board,player,tile);
                if (utility > bestUtility) {
                    bestTile = tile;
                    bestUtility = utility;
                }
            }
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
        //what we already have typed in
        let snippet = this.#word(selectedTiles);


        //get the distribution of next letters off of this
        let dictDist = dict.getNextLetterDist(snippet);

        //get the board tile distribution
        let boardDist = board.availableLetterDist(player,selectedTiles);

        let ranks = "abcdefghijklmnopqrstuvwxyz".split("");
        ranks.sort((l,r)=>(dictDist[r]*boardDist[r]-dictDist[l]*boardDist[l]));

        //filter invalid options
        ranks = ranks.filter((char)=>dictDist[char]*boardDist[char] > 0);

        if (dictDist[ranks[0]] * boardDist[ranks[0]] == 0) {
            return false;
        }
        return ranks;
    }

    pickWord(board,player) {
        //driver for recursive function
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