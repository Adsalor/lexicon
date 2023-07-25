// dictionary.js
class Dictionary {
    constructor() {
        this.dataSet = require('./dataSet');
    }

    readingFile(filename, callback) {
        fetch(filename)
            .then((response) => response.text())
            .then((data) => {
                const wordArray = data.trim().split('\n');
                this.dataSet = new Set(wordArray);
                callback();
            })
            .catch((error) => {
                console.error('Error reading the file:', error);
            });
    }

    verify(word) {
        return this.dataSet.has(word);
    }
}
