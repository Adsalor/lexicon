// dictionary.js
class Dictionary {
    constructor(newDict) {
        this.dataSet = newDict;
    }

    verify(word) {
        return this.dataSet.has(word);
    }

    //Later: word scoring functions for AI
}

const dict = new Dictionary(englishDict);

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
