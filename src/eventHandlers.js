function onLoad() {
    //stuff that should happen when the window fully loads goes here
}

function onResize() {
    canvas.thresholdResizeCanvas();
    board.render($("#Game"));
    //button.render($("#Game"));
}

function onClick(click) {
    let relCoordinates = canvas.processCoordinates(click);
    //if (button.overlapping(relCoordinates)) {
    //    alert("Button clicked!");
    //}
}

$(window).on('load',onLoad);
$(window).on('resize',onResize);
$("#Game").on('click',onClick);