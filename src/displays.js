class Display {
    x;
    y;
    constructor(newX,newY) {
        this.x = newX;
        this.y = newY;
    }

    render(canvas) {
        throw new Error("render must be implemented!");
    }
}

class Label extends Display {
    #text;
    #fontSize;
    #fontColorLight;
    #fontColorDark;
    
    //TODO: reword fontsize param to scale from min to max based on displaySettings.fontSize
    constructor(text, x, y, fontSize = 16, fontColorLight = 'black', fontColorDark = 'white') {
        super(x,y);
        this.#text = text;
        this.#fontSize = fontSize;
        this.#fontColorLight = fontColorLight;
        this.#fontColorDark = fontColorDark;
    }
  
    render(canvasHandler) {
        const context = canvasHandler.canvas.get(0).getContext('2d');
        const fontColor = displaySettings.darkMode ? this.#fontColorDark : this.#fontColorLight;
        context.fillStyle = fontColor;
        context.font = `${this.#fontSize}px Arial`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        let coordinates = canvasHandler.convertRelativeToCanvas([this.x,this.y])
        context.fillText(this.#text, ...coordinates);
    }

    setText(newText) {
        this.#text = newText;
    }

    setColor(newColor) {
        if (newColor == 'default') {
            this.#fontColorLight = 'black';
            this.#fontColorDark = 'white';
            return;
        }
        if (displaySettings.darkMode) this.#fontColorDark = newColor;
        else this.#fontColorLight = newColor;
    }
}
  
class Image extends Display {
    image;
    width;
    height;

    constructor(imageSrc, x, y, width, height) {
        super(x,y);
        this.image = new Image();
        this.image.src = imageSrc;
        this.width = width;
        this.height = height;
    }
  
    render(canvasHandler) {
        const context = canvasHandler.canvas.get(0).getContext('2d');
        let coordinates = canvasHandler.convertRelativeToCanvas([this.x,this.y])
        context.drawImage(this.image, ...coordinates, this.width, this.height);
    }
}
  