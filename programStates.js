class Program {
    //add your programState to the Program initialization method
    #currentState;
    constructor() {
        mainMenu = new Menu("Main Menu",mainMenuButtons/* */);
        this.states = [mainMenu]
        this.#currentState = this.states[0];
    }
    update(Input) {
        for (state of this.states) {
            if (state.ID() === this.#currentState) {
                this.#currentState = state.update(Input);
                state.render($("canvas#Game"));
                return;
            }
        }
        throw new Error("No program state with ID = " + this.#currentState + " exists!");
    }
}

class ProgramState {
    #label;
    constructor(newLabel) {
        label = newLabel;
    }
    update(input) {
        throw new Error("Update method must be implemented!");
    }
    render(canvas)
    get ID() {
        return this.label;
    }
}

class Menu extends ProgramState {
    #buttons = {/*A list of buttons that can be pressed*/};
    constructor(newLabel,newButtons) {
        this.buttons = newButtons;
        super(newLabel);
    }
    update(input) {
        for (button of this.buttons) {
            //  if input.on(button)
            //      return button.state
        }
        
        //return super.label
    }
}

class Game extends ProgramState {
    #board;
    #players;
    //...
    constructor() {
        super("Game");
        board = new Board();
    } //you get the idea
    update(input) {

    }
}