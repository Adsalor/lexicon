class CanvasHandler {
    //"singleton" that runs on window launch, handles canvas resizing and also handles raw input parsing
    wide

    constructor() {
        this.wide = true;
        this.thresholdResizeCanvas();
    }
    
    thresholdResizeCanvas() {
        //if the game canvas does not fit at 16x9, flip canvas to 9x16
        //use portrait display
        //space canvas can fill in is up to 85% of window height, and up to 100% of window width
        //header and footer take 10% and 5% of window size respectively
        //minimum height of window is a parameter i'll adjust by testing
        //but once the window needs to shrink below that proportion of window height to maintain 16x9, swap to 9x16
        var win = $(window);
        var height = win.height();
        var width = win.width();
        console.log("Window Height:", height, " Window Width:", width);
    
        var gameArea = $('#gameArea');
        var maxHeight = gameArea.height();
        var maxWidth = gameArea.width();
        console.log("game height:",maxHeight,"game width:",maxWidth);
    
        var minHeight = 0.3*height;
        var width;
        var height;
        if (maxWidth/16 * 9 < minHeight) {
            //9:16 aspect ratio
            //limiting factor is either max width or height
            //max height is limiting factor when is < 16/9*width
            //we know max height is ~.80*.85 of window height
            //minheight is 0.3 * height, we know: 
            //9/16 * width < 0.3*window height
            //so is ever:
            //16/9 * width > 0.68*window height?
            //there is overlap, so we need to check
            if (maxWidth * 16 / 9 > maxHeight) {
                height = maxHeight;
                width = height * 9 / 16;
            } else {
                width = maxWidth;
                height = width * 16 / 9;
            }
            this.wide = false;
        } else {
            //16:9 aspect ratio
            //max height or width could be limiter
            if (maxWidth * 9 / 16 > maxHeight) {
                //height is limiter
                height = maxHeight
                width = height * 16 / 9;
            } else {
                width = maxWidth;
                height = width * 9 / 16;
            }
            this.wide = true;
        }
    
        $('#Game').width(width).height(height);
    }
    
    //instead of switching to 9:16 on a threshold, pick whichever aspect ratio maximizes screen area
    maximumResizeCanvas() {
        //do this later
    }

    processCoordinates() {
        //do later
    }
}

var canvas = new CanvasHandler();

//$(window).on('resize',canvas.thresholdResizeCanvas);