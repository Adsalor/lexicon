class mainMenu {
    constructor(menuItems) {
      this.menuItems = menuItems;
    }
  
    createMenu() {
      const mainMenuElement = document.getElementById('mainMenu');
  
      this.menuItems.forEach((item) => {
        const button = document.createElement('button');
        button.textContent = item.label;
        button.addEventListener('click', () => this.handleItemClick(item.url));
        mainMenuElement.appendChild(button);
      });
    }
  
    handleItemClick(url) {
      // Add your logic here to handle the button click, e.g., navigation to the URL
      console.log(`Navigating to: ${url}`);
      alert('Oh, you clicked me!')
    }
  }

    const menuItems = [
        { label: 'SinglePlayer', url: '#' },
        { label: 'Multiplayer', url: '#' },
        { label: 'Settings', url: '#' },
      ];
      
      const menu = new mainMenu(menuItems);
      menu.createMenu();
    // var button1 = new Button(false,1,16/9,0.1);
    // button1.render($("renderTarget#Menu"));



