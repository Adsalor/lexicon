//i am very tired rn, this is all probably somewhat bad
//if we need to change it, it's no big deal

class InputDevice {
    #isChanger //whether should update to new program state on interaction
    #bounding
    constructor(newMode,newBounding) {
        this.#isChanger = newMode;
        this.#bounding = newBounding;
    }
    render(canvas) {
        throw new Error("Render method must be implemented!")
    }
    overlapping(input) {
        var intersections = 0;
        for (segment of bounding) {
            //if (x-intersect) intersections++;
        }
        return intersections % 2;
    }
    update(input) {
        throw new Error("Update method must be implemented!");
    }
    get changeState() {
        return this.#isChanger;
    }
}

//too much of this is dependent on the way we end up doing input handling from the canvas
//i'm gonna focus on that then come back to this once i have a better idea of the formats
//-Chris

class Button extends InputDevice {
    //...
}

class Switch extends InputDevice {
    //for dark/light mode, i.e.
}

class Slider extends InputDevice {
    //if we need this
    //we probably won't, but who knows
}

class Tile extends Button {
    //...
}