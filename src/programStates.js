class Program {
    //add your programState to Program.states
    #currentState;
    constructor() {
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
        this.label = newLabel;
    }
    update(input) {
        throw new Error("Update function must be implemented!");
    }
    
    render(canvas) {
        throw new Error("Render function must be implemented!");
    }
    get ID() {
        return this.label;
    }
}

class Menu extends ProgramState {
    #inputs = [new Button(false,0.3,0.3,0.1)];
    constructor(newLabel,newDevices) {
        super(newLabel);
        this.inputs = newDevices;
    }
    update(input) {
        for (device of this.inputs) {
            //  if device.overlapping(input)
            //      device.update(input)
            //      return device.state
        }
        
        //return super.label
    }
    render(canvas){
        for(let i = 0; i < this.#inputs.length;++i){
            this.#inputs[i].render(canvas);
        }
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