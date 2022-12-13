import type { STYPE } from '@g/states/StateTypes';
import { vbTimer, vbTimerManager } from '../vbTimer';


export class vbState {
    protected _firstIn = true;
    protected _firstOut = true;
    protected _canExit = false;
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
    // eslint-disable-next-line unused-imports/no-unused-vars
    update(deltaFrame: number) {}

    /**
     * Things to do before the actual exit, set `_canExit` to true when it's ready to exit.
     */
    prepareExit() {
        this._canExit = true;
    }
    /**
     * The actual exit() is called when `_canExit` set to true.
     */
    exit() {}

    setNext(stateName: STYPE) {
        this._nextState = stateName;
    }

    /** run finite state machine */
    runFSM(deltaFrame: number): STYPE {
        // enter
        if (this._firstIn) {
            this._firstIn = false;
            this._firstOut = true;
            this._canExit = false;
            this._nextState = '';
            this.enter();
        }
        // firstly, update timers
        globalThis.pgame.timers.update(globalThis.pgame.DeltaMS);
        this.timers.update(globalThis.pgame.DeltaMS);
        // then update state logics
        this.update(deltaFrame);
        // exit
        if (this._nextState != '') {
            if (this._firstOut) {
                this._firstOut = false;
                this.prepareExit();
            }
            if (this._canExit) {
                this._firstIn = true;
                this.exit();
                return this._nextState;
            }
        }
        return '';
    }

    /**
     * Creates an instance of Timer for this state.
     *
     * @param [time] The time is ms before timer end or repedeated.
     * @param [repeat] Number of repeat times. If set to Infinity it will loop forever. (default 0)
     * @param [delay] Delay in ms before timer starts (default 0)
     * @param [preserved] Normal timer will only be added to the TimerManager when it's running, and will be removed when it's ended. \
     *              Preserved timer will stay to avoid constantly being added or removed.
     */
    createTimer(time: number, repeat = 0, delay = 0, preserved = false) {
        return new vbTimer(this.timers, time, repeat, delay, preserved);
    }
}
