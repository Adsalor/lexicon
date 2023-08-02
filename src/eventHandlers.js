function onLoad() {
    //stuff that should happen when the window fully loads goes here
    gameSettings.loadFromSave();
    displaySettings.loadFromSave();
    onResize();
}

function onResize() {
    canvas.resizeCanvas();
    program.render();
}

function onClick(click) {
    let relCoordinates = canvas.processCoordinates(click);
    //program.update(relCoordinates);

    //if (button.overlapping(relCoordinates)) {
    //    alert("Button clicked!");
    //}
    program.update(relCoordinates);
}

function onExit() {
    gameSettings.exportSave();
    displaySettings.exportSave();
}

$(window).on('load',onLoad);
$(window).on('resize',onResize);
$(window).on('unload',onExit);
$("#Game").on('click',onClick);