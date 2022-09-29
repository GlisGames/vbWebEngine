import { vbContainer } from "./vbContainer";
import { getDeltaMS, vbGame } from "./vbGame";
import { vbTimerManager } from "./vbTimer";


export class vbState {
    protected firstIn = true;
    protected nextStateType = 0;
    stateType: number;
    container: vbContainer;
    timers: vbTimerManager;

    constructor(stateType: number, name: string) {
        this.stateType = stateType;
        this.container = new vbContainer();
        this.container.name = name;
        this.container.enable = false;
        this.timers = new vbTimerManager();
    }

    enter() {}
    exit() {}
    update(deltaFrame: number) {
        vbGame.timers.update(getDeltaMS());
        this.timers.update(getDeltaMS());
    }

    setNextState(stateType: number) {
        this.nextStateType = stateType;
    }

    run(deltaFrame: number) {
        if (this.firstIn) {
            this.nextStateType = 0;
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