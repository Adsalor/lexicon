class Dictionary {
    constructor(newDict) {
        this.dataSet = newDict;
    }

    verify(word) {
        return this.dataSet.has(word.toLowerCase());
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