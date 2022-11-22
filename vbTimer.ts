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
 * Original Auther: Shen Yiming(soimy@163.com)
 *
 * Repo: https://github.com/soimy/eventemitter3-timer
 * 
 * Modified by Glis Games
 */
export class vbTimer extends PIXI.utils.EventEmitter {
    /**
     * The activation status of timer.
     */
    enable: boolean;
     /**
     * The time until timer triggered.
     */
    time: number;
    /**
     * Delay in ms before timer starts
     */
    delay: number;
    /**
     * The repeat count before timer stop
     */
    repeat: number;
    /**
     * Status indicator: whether this timer is ended.
     */
    isEnded: boolean;
     /**
      * Status indicator: whether this timer is started.
      */
    isStarted: boolean;
    /**
     * Tmp timer will only be added to the timerManager when it's running, and will be removed when it's ended.
     */
    tmp: boolean;
    protected _delayTime: number;
    protected _elapsedTime: number;
    protected _repeat: number;
    protected _timerManager?: vbTimerManager;
    protected _next?: vbTimer;

    /**
     * Creates an instance of Timer. \
     * Newly created timers will be default to be added to the global timerManager.
     * Can manually create TimerManager and assign timers.
     *
     * @param [time] The time is ms before timer end or repedeated.
     * @param [repeat] Number of repeat times. If set to Infinity it will loop forever. (default 0)
     * @param [delay] Delay in ms before timer starts (default 0)
     * @param [tmp] Tmp timer will only be added to the timerManager when it's running, and will be removed when it's ended.
     */
    constructor(time: number, repeat = 0, delay = 0, tmp = true) {
        super();
        this.time = time;
        this.enable = false;
        this.delay = delay;
        this.repeat = repeat;
        this.tmp = tmp;
        this.isEnded = false;
        this.isStarted = false;
        this._delayTime = 0;
        this._elapsedTime = 0;
        this._repeat = 0;
    }
    /**
     * The timerManager this timer is assigned to.
     */
    get timerManager() { return this._timerManager; }
    set timerManager(value: vbTimerManager | undefined) {
        if (this._timerManager !== value) {
            if (this._timerManager !== undefined) {
                this._timerManager.removeTimer(this);
            }
            this._timerManager = value;
        }
    }
    /**
     * Start timer from it's current time. \
     * If it's a tmp timer, add it to its timerManager. \
     * A `start` event will be emitted.
     */
    start() {
        this.enable = true;
        if (this.tmp && this._timerManager !== undefined) {
            this._timerManager.addTimer(this);
        }
        return this;
    }
    /**
     * Stop timer. \
     * An `end` event will be emitted.
     */
    stop() {
        this.isEnded = true;
        this.enable = false;
        this.emit('end', this._elapsedTime);
        return this;
    }
    /**
     * Rest timer to it's initial status.
     */
    reset() {
        this._elapsedTime = 0;
        this._repeat = 0;
        this._delayTime = 0;
        this.isStarted = false;
        this.isEnded = false;
        return this;
    }
    /**
     * Remove this timer from its timerManager.
     */
    remove() {
        if (this._timerManager === undefined) return;
        this._timerManager.removeTimer(this);
        return this;
    }
    /**
     * Start another timer when this one is ended.
     * @returns this
     */
    chain(next: vbTimer) {
        this._next = next;
        return this;
    }
    /**
     * Increment timer's time. Should be put in main logic loop. \
     * Using `TimerManager.update()` method instead is recommended.
     *
     * @param [delta] The amount of increment in ms.
     */
    update(delta: number) {
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
                if (this.repeat > this._repeat) {
                    this._repeat++;
                    this.emit('repeat', this._elapsedTime, this._repeat);
                    this._elapsedTime = 0;
                    return;
                }
                this.stop();
                if (this._next !== undefined) this._next.start();
            }
        }
    }

    onStart(fn: (elapsedTime: number) => void) {
        this.on('start', fn); return this;
    }
    onUpdate(fn: (elapsedTime: number, delta: number) => void) {
        this.on('update', fn); return this;
    }
    onRepeat(fn: (elapsedTime: number, repeatCount: number) => void) {
        this.on('repeat', fn); return this;
    }
    onEnd(fn: (elapsedTime: number) => void) {
        this.on('end', fn); return this;
    }
}


/**
 * Manager class for Timers
 */
export class vbTimerManager {
    protected _timers: vbTimer[] = [];
    protected _timersToDelete: vbTimer[] = [];

    count() { return this._timers.length; }
    /**
     * Increment all managed timers' time.\
     * Better to use this method instead of `timers.update()` for centralized control.
     *
     * @param [delta] The increment amount in ms.
     */
    update(delta: number) {
        if (this._timersToDelete.length) {
            for (const timerToDel of this._timersToDelete) {
                this._remove(timerToDel);
            }
            this._timersToDelete.length = 0;
        }

        for (const timer of this._timers) {
            if (timer.enable) {
                timer.update(delta);
                if (timer.isEnded && timer.tmp) {
                    this.removeTimer(timer);
                }
            }
        }
    }
    /**
     * Add timer to this timerManager. \
     * If it's a tmp timer, only add when it starts.
     */
    addTimer(timer: vbTimer) {
        if (!timer.tmp) {
            this._timers.push(timer);
            timer.timerManager = this;
        }
        else {
            if (timer.enable) {
                this._timers.push(timer);
            }
            else {
                timer.timerManager = this;
            }
        }
    }
    /**
     * Remove timer from this timerManager.
     */
    removeTimer(timer: vbTimer) {
        this._timersToDelete.push(timer);
    }
    protected _remove(timer: vbTimer) {
        const index = this._timers.indexOf(timer);
        if (index > -1) {
            this._timers.splice(index, 1);
        }
    }
}