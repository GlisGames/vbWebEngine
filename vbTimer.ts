/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Celsius online
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
 import * as PIXI from 'pixi.js'


/**
 * A Simple Timer class extending [EventEmitter3](https://github.com/primus/eventemitter3)
 *
 * Auther: Shen Yiming(soimy@163.com)
 *
 * Repo: https://github.com/soimy/eventemitter3-timer
 */
export class vbTimer extends PIXI.utils.EventEmitter {
    /**
     * The time until timer triggered.
     */
    public time: number;
    /**
     * The activation status of timer.
     */
    public enable: boolean;
    /**
     * Status indicator: whether this timer is ended.
     */
    public isEnded: boolean;
    /**
     * Status indicator: whether this timer is started.
     */
    public isStarted: boolean;
    /**
     * Delay in ms before timer starts
     */
    public delay: number;
    /**
     * The repeat count before timer stop
     */
    public repeat: number;
    /**
     * Whether this timer loops forever
     */
    public loop: boolean;
    /**
     * Whether this timer is expired and should be removed from timerManager.
     */
    public expire: boolean;
    /**
     * The timerManager this timer is assigned to.
     */
    public get timerManager() { return this._timerManager; }
    public set timerManager(value: TimerManager | undefined) { this._timerManager = value; }
    private _delayTime: number;
    private _elapsedTime: number;
    private _repeat: number;
    private _timerManager?: TimerManager;

    /**
     * Creates an instance of Timer.
     *
     * Newly created timers will be default to be added to the global timerManager.
     * Can manually create TimerManager and assign timers.
     *
     * @param {number} [time] The time is ms before timer end or repedeated.
     */
    constructor(time: number, delay = 0, timerManager?: TimerManager) {
        super();
        this.time = time;
        this.enable = false;
        this.isEnded = false;
        this.isStarted = false;
        this.expire = false;
        this.delay = delay;
        this.repeat = 0;
        this.loop = false;
        this._delayTime = 0;
        this._elapsedTime = 0;
        this._repeat = 0;
        this.timerManager = timerManager;
    }

    /**
     * Start timer from it's current time.
     *
     * A `start` event will be emitted.
     */
    public start() {
        this.enable = true;
    }
    /**
     * Pause timer, current time stop updated.
     *
     * A `stop` event will be emitted.
     */
    public pause() {
        this.enable = false;
        this.emit('pause', this._elapsedTime);
    }
    /**
     * Rest timer to it's initial status.
     */
    public reset() {
        this._elapsedTime = 0;
        this._repeat = 0;
        this._delayTime = 0;
        this.isStarted = false;
        this.isEnded = false;
    }
    /**
     * Remove this timer from it's timerManager.
     */
    public remove() {
        if (!this._timerManager) return this;
        this._timerManager.removeTimer(this);
    }

    /**
     * Increment timer's time. Should be put in main logic loop.
     *
     * Using `TimerManager.update()` method instead is recommended.
     *
     * @param {number} delta The amount of increment in ms.
     */
    public update(delta: number) {
        if (this.delay > this._delayTime) {
            this._delayTime += delta;
            return;
        }

        if (!this.isStarted) {
            this.isStarted = true;
            this.emit('start', this._elapsedTime);
        }

        if (this.time > this._elapsedTime) {
            const t = this._elapsedTime + delta;
            const ended = (t >= this.time);

            this._elapsedTime = (ended) ? this.time : t;
            this.emit('update', this._elapsedTime, delta);

            if (ended) {
                if (this.loop || this.repeat > this._repeat) {
                    this._repeat++;
                    this.emit('repeat', this._elapsedTime, this._repeat);
                    this._elapsedTime = 0;
                    return;
                }

                this.isEnded = true;
                this.enable = false;
                this.emit('end', this._elapsedTime);
            }
        }
    }
}


/**
 * Manager class for Timers
 */
export class TimerManager {
    public timers: vbTimer[] = [];
    private _timersToDelete: vbTimer[] = [];
    private _last = 0;

    /**
     * Increment all managed timers' time.
     *
     * Better to use this method instead of `timers.update()` for centralized control.
     *
     * @param {number} [delta] The increment amount in ms. Omit to use internal deltams.
     */
    public update(delta: number) {
        if (this._timersToDelete.length) {
            for (const timerToDel of this._timersToDelete) {
                this._remove(timerToDel);
            }
            this._timersToDelete.length = 0;
        }

        for (const timer of this.timers) {
            if (timer.enable) {
                timer.update(delta);
                if (timer.isEnded && timer.expire) {
                    this.removeTimer(timer);
                }
            }
        }
    }

    /**
     * Remove timer from this timerManager.
     *
     * @param {vbTimer} timer The timer to be removed.
     */
    public removeTimer(timer: vbTimer) {
        this._timersToDelete.push(timer);
        timer.timerManager = undefined;
    }

    /**
     * Add timer to this timerManager, and remove timer from it's original timerManager.
     *
     * @param {vbTimer} timer The timer to be added.
     */
    public addTimer(timer: vbTimer) {
        this.timers.push(timer);
        if (timer.timerManager) timer.timerManager.removeTimer(timer);
        timer.timerManager = this;
    }

    /**
     * Create a new timer under this timerManager.
     *
     * @param {number} time time of newly created timer.
     * @returns {vbTimer} The newly created timer.
     */
    public createTimer(time: number, delay = 0) {
        const timer = new vbTimer(time, delay, this);
        this.timers.push(timer);
        return timer;
    }

    private _remove(timer: vbTimer) {
        const index = this.timers.indexOf(timer);
        if (index > -1) {
            this.timers.splice(index, 1);
        }
    }
}