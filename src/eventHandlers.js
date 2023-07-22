function onLoad() {
    //stuff that should happen when the window fully loads goes here
}

function onResize() {
    canvas.thresholdResizeCanvas();
    canvas.clear();
    game.render(canvas);
}

function onClick(click) {
    let relCoordinates = canvas.processCoordinates(click);
    //program.update(relCoordinates);

    //if (button.overlapping(relCoordinates)) {
    //    alert("Button clicked!");
    //}
    game.update(relCoordinates);
    canvas.clear();
    game.render(canvas);
}

$(window).on('load',onLoad);
$(window).on('resize',onResize);
$("#Game").on('click',onClick);