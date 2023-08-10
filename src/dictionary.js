class Dictionary {
    dataSet;
    distribution;
    
    constructor(newDict) {
        this.dataSet = newDict;
        this.distribution = this.getFullLetterDist();
    }

    verify(word) {
        return this.dataSet.has(word.toLowerCase());
    }

    //board letter gen helper
    getFullLetterDist() {
        let charMap = {};
        for (const char of "abcdefghijklmnopqrstuvwxyz") charMap[char] = 0;
        for (const word of this.dataSet) {
            for (const letter of word) {
                charMap[letter]++;
            }
        }
        return charMap;
    }

    //AI functionality
    getNextLetterDist(snippet) {
        snippet = snippet.toLowerCase();
        let charMap = {};
        for (const char of "abcdefghijklmnopqrstuvwxyz") charMap[char] = 0;
        for (const word of this.dataSet) {
            if (word <= snippet) continue;
            if (word.startsWith(snippet)) {
                charMap[word[snippet.length]]++;
            } else break;
        }
        return charMap;
    }
}

const dict = new Dictionary(englishDict);