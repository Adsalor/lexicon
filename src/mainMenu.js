let mainMenuButtons = [new Button("spMenu",0.5,0.8,0.1), new Button("mpMenu",0.5,1.1,0.1), new Button("settingsMenu",0.5,1.4,0.1)];
let mainMenuDisplays = [new Label("CAPITALS",0.5,0.5,90,8/9,0.3), new Label("Singleplayer",0.5,0.8,50), new Label("Multiplayer",0.5,1.1,50), new Label("Settings",0.5,1.4,50)];
    // new Image("../lexicon/assets/logos/capitals-mainMenu.png", 0.35, 0.1, 300, 300)]
var mainMenu = new Menu("mainMenu", mainMenuButtons, mainMenuDisplays);