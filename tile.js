class Tile {
    constructor(canvasName, letter, x, y) {
        this.canvasName = canvasName;
        this.letter = letter;
        this.selected = false;
        this.x = x;
        this.y = y;
    }
  
    render() {
        const canvas = document.getElementById(this.canvasName);
        const context = canvas.getContext('2d');
  
        const size = 50; // Size of the hexagon
        const centerX = this.x;
        const centerY = this.y;
      
        // Draws the hexagon outline
        context.beginPath();
        context.moveTo(centerX + size * Math.cos(0), centerY + size * Math.sin(0));
  
        for (let i = 1; i <= 6; i++) {
            const angle = (Math.PI / 3) * i;
            const x = centerX + size * Math.cos(angle);
            const y = centerY + size * Math.sin(angle);
            context.lineTo(x, y);
        }
  
        context.closePath();
  
        // Fill the hexagon with a color based on the selected state
        context.fillStyle = this.selected ? 'black' : 'white';
        context.fill();
  
        // Add the letter in the middle of the hexagon
        context.fillStyle = this.selected ? 'white' : 'black';
        context.font = 'bold 20px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(this.letter, centerX, centerY);
    }
}
  
// Usage example:
const tile1 = new Tile('Tiles', 'A', 400, 200);
tile1.render();
  