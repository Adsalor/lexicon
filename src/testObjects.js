var game = new Game("game","mpMenu");
var singleplayer = new Game("singleplayerGame","spMenu",1);

var MPgameMenu = new PreGameMenu("mpMenu",game);
var SPgameMenu = new PreGameMenu("spMenu",singleplayer);

var program = new Program();