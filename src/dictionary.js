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

// html used to run this
// <!-- index.html -->
// <!DOCTYPE html>
// <html>

// <head>
//     <title>Dictionary Verification</title>
// </head>

// <body>
//     <h1>Dictionary Verification</h1>
//     <form id="wordForm">
//         <label for="wordInput">Enter a word to verify:</label>
//         <input type="text" id="wordInput" required>
//         <button type="submit">Verify</button>
//     </form>

//     <div id="result"></div>

//     <script src="dictionary.js"></script>
// </body>

// </html>
