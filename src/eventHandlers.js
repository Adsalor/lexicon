function onLoad() {
    //stuff that should happen when the window fully loads goes here
    gameSettings.loadFromSave();
    displaySettings.loadFromSave();
    onResize();
}

function onResize() {
    //on window resize things happen here
    canvas.resizeCanvas();
    program.render();
}

function onClick(click) {
    //player input handled here
    let relCoordinates = canvas.processCoordinates(click);
    program.update(relCoordinates);
}

function onExit() {
    //when the window closes, handle things here
    gameSettings.exportSave();
    displaySettings.exportSave();
}

//jQuery event handlers
$(window).on('load',onLoad);
$(window).on('resize',onResize);
$(window).on('unload',onExit);
$("#Game").on('click',onClick);