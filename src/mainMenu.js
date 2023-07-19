mainButtons = [];

//var mainMenu = new Menu();
//mainMenu.render($("canvas#Game"));
var button = new Button(false,100,100,20);

function onResize() {
    canvas.thresholdResizeCanvas();
    button.render($("#Game"));
}

$(window).on('resize',onResize);