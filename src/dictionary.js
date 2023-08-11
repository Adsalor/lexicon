class Dictionary {
    //actual word set
    dataSet;

    //frequency counts of all letters (cache for performance)
    distribution;
    
    constructor(newDict) {
        this.dataSet = newDict;
        this.distribution = this.getFullLetterDist();
    }

    //check word is valid
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
    //gets distribution of "next letter" of word snippet
    //if snippet is "L", i.e., returns frequency of second letter of
    //words beginning with "L"
    getNextLetterDist(snippet) {
        //convert to lowercase since dict is lowercase
        snippet = snippet.toLowerCase();
        let charMap = {};
        for (const char of "abcdefghijklmnopqrstuvwxyz") charMap[char] = 0;

        //set is sorted so loop through, once we've hit something 
        //larger than snippet that doesn't start with it, we've
        //passed every possible match
        //so done
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