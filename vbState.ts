import { vbContainer } from "./vbContainer";
import { vbGame } from "./vbGame";


export class vbState {
    protected firstIn = true;
    protected nextStateType = 0;
    stateType: number;
    container: vbContainer;

    constructor(stateType: number, name: string) {
        this.stateType = stateType;
        this.container = new vbContainer();
        this.container.name = name;
        this.container.enable = false;
    }

    enter() {}
    exit() {}
    update(deltaFrame: number) {
        
    }

    setNextState(stateType: number) {
        this.nextStateType = stateType;
    }

    run(deltaFrame: number) {
        if (this.firstIn) {
            this.firstIn = false;
            this.container.enable = true;
            this.container.renderable = true;
            this.enter();
            this.container.enterState(this.stateType);
        }
        this.update(deltaFrame);
        if (this.nextStateType != 0) {
            this.firstIn = true;
            this.container.enable = false;
            this.container.renderable = false;
            this.exit();
        }

        return this.nextStateType;
    }
}