class CanvasHandler {
    //"singleton" that runs on window launch, handles canvas resizing and also handles raw input parsing
    wide
    canvas

    constructor() {
        this.wide = true;
        this.canvas = $('#Game');
        this.resizeCanvas();
    }
    
    resizeCanvas() {
        let width, height;
        [width,height] = this.maximumResizeCanvas();
        
        this.canvas.width(width).height(height);
        
        //set canvas internal resolution
        if (this.wide) {
            this.canvas.get(0).height = 1080;
            this.canvas.get(0).width = 1920;
        } else {
            this.canvas.get(0).height = 1920;
            this.canvas.get(0).width = 1080;
        }
    }

    thresholdResizeCanvas() {
        //if the game canvas does not fit at 16x9, flip canvas to 9x16
        //use portrait display
        //space canvas can fill in is up to 85% of window height, and up to 100% of window width
        //header and footer take 10% and 5% of window size respectively
        //minimum height of window is a parameter i'll adjust by testing
        //but once the window needs to shrink below that proportion of window height to maintain 16x9, swap to 9x16
        let width, height;
    
        let gameArea = $('#gameArea');
        let maxHeight = gameArea.height();
        let maxWidth = gameArea.width();
    
        let minHeight = 0.3*height;
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

        return [width,height];
    }

    clear() {
        this.canvas.get(0).getContext('2d').clearRect(0,0,this.canvas.get(0).width,this.canvas.get(0).height);
    }
    
    //instead of switching to 9:16 on a threshold, pick whichever aspect ratio maximizes screen area
    maximumResizeCanvas() {
        let width, height;
        let landscapeArea, portraitArea;
        let lHLimiter, pHLimiter;

        let gameArea = $('#gameArea');
        let maxHeight = gameArea.height();
        let maxWidth = gameArea.width();

        //calculate portraitArea
        //for portrait, we want height to be 16/9 * width
        //height is limiter if rect is shorter than this: so if height is less than 16/9 * width
        if (maxWidth * 16 / 9 > maxHeight) {
            //height is limiter
            portraitArea = maxHeight * maxHeight * 9/16; //when height is limiter area is (height) * (9/16 * height = width)
            pHLimiter = true;
        } else {
            //width is limiter
            portraitArea = maxWidth * maxWidth * 16/9; //when width is limiter area is (width) * (16/9 * width = height)
            pHLimiter = false;
        }

        //for landscape, we want width to be 16/9 * height
        //height is limiter when rect is wider than this: so if width is greater than 16/9 * height
        if (maxWidth > 16 / 9 * maxHeight) {
            //height is limiter
            landscapeArea = maxHeight * maxHeight * 16/9; //area is (height) * (16/9 * height = width)
            lHLimiter = true;
        } else {
            //width is limiter
            landscapeArea = maxWidth * maxWidth * 9/16; //area is (width) * (9/16 * width = height)
            lHLimiter = false;
        }

        if (landscapeArea > portraitArea) {
            //use landscape
            if (lHLimiter) {
                height = maxHeight;
                width = height * 16 / 9;
            } else {
                width = maxWidth;
                height = width * 9 / 16;
            }

            this.wide = true;
        } else {
            //use portrait
            if (pHLimiter) {
                height = maxHeight;
                width = height * 9 / 16;
            } else {
                width = maxWidth;
                height = width * 16 / 9;
            }

            this.wide = false;
        }

        return [width,height];
    }

    processCoordinates(click) {
        return this.convertOffsetToRelative([click.offsetX,click.offsetY]);
    }

    convertRelativeToCanvas(coordinates) {
        let shortSide = Math.min(this.canvas.get(0).height,this.canvas.get(0).width);
        return [coordinates[0] * shortSide,coordinates[1] * shortSide];
    }

    convertOffsetToRelative(coordinates) {
        let shortSide = Math.min(this.canvas.width(),this.canvas.height());
        return [coordinates[0] / shortSide, coordinates[1] / shortSide];
    }

    convertRelLengthToCanvas(len) {
        return len*Math.min(this.canvas.get(0).height,this.canvas.get(0).width);
    }
}

var canvas = new CanvasHandler();