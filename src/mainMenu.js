


// if(ProgramState == "mainMenu"){

//     const textToDisplay = "Capitals";
//     const newElement = document.createElement("p");
//     newElement.textContent = textToDisplay;

// // Add the new element to an existing element or the document body
//     const parentElement = document.getElementById("title"); // Replace with the actual ID of the parent element
//     parentElement.appendChild(newElement);
// }



let mainMenuButtons = [ new Tile ("P1",0.2,0.2,0.1), new Tile ("P2",0.8,0.2,0.1), 
    new Button("singleplayerGame",0.5,0.8,0.1), new Button("game",0.5,1.1,0.1), new Button("settingsMenu",0.5,1.4,0.1)];
let mainMenuDisplays = [ new Label("CAPITALS",0.5,0.5,90) ]
var mainMenu = new Menu("mainMenu", mainMenuButtons, mainMenuDisplays);