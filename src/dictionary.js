const fs = require('fs');

class Dictionary {
    constructor(dict, dataList) {
        this.dict = dict;
        this.dataList = dataList;
    }

    // single letter words are valid
    readingFile(filename, callback) {
        fs.readFile(filename, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading the file:', err);
                return;
            }
            this.dataList = data.trim().split('\n');
            callback();
        });
    }

    verify(word, dataList) {
        return dataList.includes(word);
    }
}

const dict = new Dictionary();
dict.readingFile("dictionarydb.txt", function() {
    console.log(dict.verify("abandon", dict.dataList));
});
// need to accept input from external source
// abandon is used as a placeholder
