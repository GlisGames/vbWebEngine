import type { STYPE } from '@g/states/StateTypes';
import { vbTimerManager } from '../vbTimer';


export class vbState {
    protected _firstIn = true;
    protected _name: STYPE;
    protected _nextState: STYPE;
    timers: vbTimerManager;

    constructor(stateName: STYPE) {
        this._name = stateName;
        this._nextState = '';
        this.timers = new vbTimerManager();
    }

    get name() { return this._name; }

    enter() {}
    exit() {}
    update(deltaFrame: number) {}

    setNext(stateName: STYPE) {
        this._nextState = stateName;
    }

    /** run finite state machine */
    runFSM(deltaFrame: number) {
        // enter
        if (this._firstIn) {
            this._firstIn = false;
            this._nextState = '';
            this.enter();
            globalThis.pgame.stage.enterState(this.name);
        }
        // firstly, update timers
        globalThis.pgame.timers.update(globalThis.pgame.DeltaMS);
        this.timers.update(globalThis.pgame.DeltaMS);
        // then update state logics
        this.update(deltaFrame);
        // exit
        if (this._nextState != '') {
            this._firstIn = true;
            globalThis.pgame.stage.exitState(this.name);
            this.exit();
        }

        return this._nextState;
    }
}
