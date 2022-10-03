import { vbContainer } from "./vbContainer";
import { vbgame } from "./vbGame";
import { vbTimerManager } from "./vbTimer";


export class vbState {
    protected firstIn = true;
    protected nextStateType = 0;
    sType: number;
    stage: vbContainer;
    timers: vbTimerManager;

    constructor(stateType: number, name: string) {
        this.sType = stateType;
        this.stage = new vbContainer();
        this.stage.name = name;
        this.stage.enable = false;
        this.timers = new vbTimerManager();
    }

    get name() { return this.stage.name; }
    enter() {}
    exit() {}
    update(deltaFrame: number) {
        vbgame.timers.update(vbgame.DeltaMS);
        this.timers.update(vbgame.DeltaMS);
    }

    setNext(stateType: number) {
        this.nextStateType = stateType;
    }

    run(deltaFrame: number) {
        if (this.firstIn) {
            this.nextStateType = 0;
            this.firstIn = false;
            this.stage.enable = true;
            this.stage.renderable = true;
            this.enter();
            this.stage.enterState(this.sType);
        }
        this.update(deltaFrame);
        if (this.nextStateType != 0) {
            this.firstIn = true;
            this.stage.enable = false;
            this.stage.renderable = false;
            this.exit();
        }

        return this.nextStateType;
    }
}