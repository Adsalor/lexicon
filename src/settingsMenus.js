//Define settings navigation menu and settings menus

let settingsButtons = [new Button("mainMenu",0.1,0.1,0.07), new Button("gameSettings",0.5,0.5,0.2), new Button("displaySettings",0.5,1.1,0.2)];
let settingsDisplays = [new Label("return to menu",0.15,0.2,50,0.15,0.2), new Label("Game Settings",0.5,0.5,50), new Label("Display Settings",0.5,1.1,50)];

var settingsMenu = new Menu("settingsMenu",settingsButtons,settingsDisplays);

var gameSettingsMenu = new GameSettingsMenu("gameSettings");

var displaySettingsMenu = new DisplaySettingsMenu("displaySettings");