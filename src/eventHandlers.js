function onResize() {
    canvas.thresholdResizeCanvas();
    button.render($("#Game"));
}

function onClick(click) {
    let relCoordinates = canvas.processCoordinates(click);
    if (button.overlapping(relCoordinates)) {
        alert("Button clicked!");
    }
}

$(window).on('resize',onResize);
$("#Game").on('click',onClick);