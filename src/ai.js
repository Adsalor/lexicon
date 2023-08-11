//The AI class is responsible for automatically picking a word for the AI to play. It does so using
//a modified depth-first search implementation.

class AI {
    //the word the AI most recently generated
    mostRecentWord;

    constructor() {
        this.mostRecentWord = [];
    }

    //calculates a utility score for a tile given a player, board to play on, and set of tiles
    utilityScore(selectedTiles,board,player,tile) {
        //calculate utility score of tile
        //tile is useful if helps expand our territory
        //*very* useful if defends capital
        //useful if captures opponent territory
        //more useful if captures opponent capital

        //TODO: fix bug, see repo issues

        let utility = 0;
        
        //expansible tiles are selected tiles which will be expanded to on submission
        //adjacent tiles are territory tiles adjacent to the expansible tiles
        let expansible,adjacent;
        [expansible,adjacent] = board.processTiles(selectedTiles,player);

        //tiles surrounding the tile we calculate the score of
        let adjacencies = board.adjacentTilesToTile(tile);

        //if tile is adjacent to currently expansible tiles, it helps capture more territory
        if (adjacent.includes(tile)) {
            utility++;

            //if tile is adjacent to an opponent's capital, it's more useful
            if (adjacencies.some((adj) => adj.capitalOf != 0 && adj.capitalOf != player + 1)) {
                utility += 2;
            } else if (adjacencies.some((adj) => adj.territoryOf != 0 && adj.territoryOf != player + 1)) {
                //if it captures non-capital opponent territory, it's still useful
                utility++;
            }
        }

        //if it helps defend our capital, it's the most useful
        if (adjacencies.some((adj) => adj.capitalOf == player + 1)) utility += 3; 

        return utility;
    }
    
    //picks the best next tile given a set of tiles, or false if no next tile is possible
    pickTile(selectedTiles, board, player) {

        //rank letters based on what we've already selected
        let ranks = this.rankLetters(selectedTiles,board,player);

        //if we have no next letter option, return false
        if (ranks === false) {
            return false;
        }

        //iterate through possible letters and try the highest utility tile with that letter
        for (let i = 0; i < ranks.length; i++) {

            //get tiles that are not already selected with that letter
            let tiles = board.tilesWithLetter(ranks[i]).filter((tile) => !selectedTiles.includes(tile));

            //find the maximum-utility tile of those tiles
            let bestTile = tiles[0]; //guaranteed to be at least one because if not on board then score = 0
            let bestUtility = this.utilityScore(selectedTiles,board,player,bestTile);
            for (const tile of tiles.slice(1)) {
                let utility = this.utilityScore(selectedTiles,board,player,tile);
                if (utility > bestUtility) {
                    bestTile = tile;
                    bestUtility = utility;
                }
            }

            //select the best tile and recurse
            selectedTiles.push(bestTile);
            let result = this.pickTile(selectedTiles,board,player);

            //if we don't get any results from that letter, jump to the next one
            if (result === false) {
                selectedTiles.pop();
                continue;
            }

            //if we found a word, return it (result != false means that there's a valid word)
            if (true/*utility of word is above certain amount*/) return result;
        }

        //if no extension is possible, if what we've got is a word, great
        //otherwise return false
        if (dict.verify(this.#word(selectedTiles)) && true/*other conditions (length?)*/) return selectedTiles;
        return false;
    }

    //ranks letters by a composite score computed by 
    //multiplying weighted board occurrences with dictionary frequency
    rankLetters(selectedTiles,board,player) {
        //what we already have typed in
        let snippet = this.#word(selectedTiles);

        //get the distribution of next letters off of this
        let dictDist = dict.getNextLetterDist(snippet);

        //get the board tile distribution
        let boardDist = board.availableLetterDist(player,selectedTiles);

        //array of all chars, sorted by the composite score
        let ranks = "abcdefghijklmnopqrstuvwxyz".split("");
        ranks.sort((l,r)=>(dictDist[r]*boardDist[r]-dictDist[l]*boardDist[l]));

        //filter invalid options (score 0 means unselectable)
        ranks = ranks.filter((char)=>dictDist[char]*boardDist[char] > 0);

        //if there are *no* valid options, return false
        if (ranks.length == 0 || dictDist[ranks[0]] * boardDist[ranks[0]] == 0) {
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

    //concatenates tile letters into a word
    #word(selectedTiles) {
        let word = "";
        for (const tile of selectedTiles) {
            word += tile.letter.toUpperCase();
        }
        return word;
    }
}