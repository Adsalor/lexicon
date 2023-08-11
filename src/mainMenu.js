//Defines the main menu

let mainMenuButtons = [new Button("spMenu",0.5,0.6,0.15,0.5,0.5), new Button("mpMenu",0.5,1,0.15,0.9,0.5), new Button("settingsMenu",0.5,1.4,0.15,1.3,0.5)];
let mainMenuDisplays = [new Label("CAPITALS",0.5,0.3,90,8/9,0.2), new Label("Singleplayer",0.5,0.6,50,0.5,0.5), new Label("Multiplayer",0.5,1,50,0.9,0.5), new Label("Settings",0.5,1.4,50,1.3,0.5)/*, new ImageRenderer("./assets/logos/capitals-mainMenu-transparent.png",0.7,0.7,0.3,0.3)*/];
    // new Image("../lexicon/assets/logos/capitals-mainMenu.png", 0.35, 0.1, 300, 300)]
var mainMenu = new Menu("mainMenu", mainMenuButtons, mainMenuDisplays);