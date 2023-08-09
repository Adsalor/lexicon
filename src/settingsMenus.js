let settingsButtons = [new Button("mainMenu",0.1,0.1,0.07), new Button("gameSettings",0.5,0.8,0.1), new Button("displaySettings",0.5,1.1,0.1)];
let settingsDisplays = [new Label("return to menu",0.15,0.2,50,0.15,0.2), new Label("Game Settings",0.5,0.8,50), new Label("Display Settings",0.5,1.1,50)];

var settingsMenu = new Menu("settingsMenu",settingsButtons,settingsDisplays);

let GSButtons = [new Button("settingsMenu",0.1,0.1,0.07)];
let GSDisplays = [new Label("Come back later!",0.5,0.5,70),new Label("return to menu",0.15,0.2,50,0.15,0.2)];

var gameSettingsMenu = new Menu("gameSettings",GSButtons,GSDisplays);

let DSButtons = [new Button("settingsMenu",0.1,0.1,0.07),new Switch(false,0.7,0.5,0.1)];
let DSDisplays = [new Label("Dark Mode",0.3,0.5,50),new Label("return to menu",0.15,0.2,50,0.15,0.2)];

var displaySettingsMenu = new Menu("displaySettings",DSButtons,DSDisplays);