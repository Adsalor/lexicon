var gameSettings = new GameSettings();

var displaySettings = new DisplaySettings();

//var board = new Board(new BoardLayout([7,7],2));
//var button = new Button(false,1,16/9,0.1);
var game = new Game("game","mpMenu");
var singleplayer = new Game("singleplayerGame","spMenu",1);
var MPgameMenu = new PreGameMenu("mpMenu",game);
var SPgameMenu = new PreGameMenu("spMenu",singleplayer);
var program = new Program();