class Label {
    constructor(text, x, y, fontSize = 16, fontColorLight = 'black', fontColorDark = 'white', font = 'Arial') {
      this.text = text;
      this.x = x;
      this.y = y;
      this.fontSize = fontSize;
      this.font = font;
      this.fontColorLight = fontColorLight;
      this.fontColorDark = fontColorDark;
    }
  
    render(canvasHandler, isDarkMode) {
      const context = canvasHandler.canvas.get(0).getContext('2d');
      const fontColor = isDarkMode ? this.fontColorDark : this.fontColorLight;
      context.fillStyle = fontColor;
      context.font = `${this.fontSize}px ${this.font}`;
      context.textAlign = 'left';
      context.textBaseline = 'top';
      context.fillText(this.text, this.x, this.y);
    }
  }
  
class ImageRenderer {
    constructor(imageSrc, x, y, width, height) {
      this.image = new Image();
      this.image.src = imageSrc;
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
    }
  
    render(canvasHandler) {
      const context = canvasHandler.canvas.get(0).getContext('2d');
      context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
  }
  