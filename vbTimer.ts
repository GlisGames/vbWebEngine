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
     * Preserved timer will stay in TimerManager to avoid constantly being added or removed.
     */
    preserved: boolean;
    protected _delayTime: number;
    protected _elapsedTime: number;
    protected _repeat: number;
    protected _timerManager: vbTimerManager;
    protected _next?: vbTimer;

    /**
     * Creates an instance of Timer. \
     *
     * @param [manager] must specify a TimerManager
     * @param [time] The time is ms before timer end or repedeated.
     * @param [repeat] Number of repeat times. If set to Infinity it will loop forever. (default 0)
     * @param [delay] Delay in ms before timer starts (default 0)
     * @param [preserved] Normal timer will only be added to the TimerManager when it's running, and will be removed when it's ended. \
     *              Preserved timer should be added manually and will stay to avoid constantly being added or removed.
     */
    constructor(manager: vbTimerManager, time: number, repeat = 0, delay = 0, preserved = false) {
        super();
        this.time = time;
        this.enable = false;
        this.delay = delay;
        this.repeat = repeat;
        this.preserved = preserved;
        this.isEnded = false;
        this.isStarted = false;
        this._delayTime = 0;
        this._elapsedTime = 0;
        this._repeat = 0;
        this._timerManager = manager;
        if (this.preserved) {
            manager.addTimer(this);
        }
    }
    /**
     * The TimerManager this timer is assigned to.
     */
    get timerManager() { return this._timerManager; }
    set timerManager(manager: vbTimerManager) {
        if (this._timerManager !== manager) {
            this._timerManager.removeTimer(this);
            this._timerManager = manager;
            if (this.preserved) {
                manager.addTimer(this);
            }
        }
    }
    /**
     * Start timer from it's current time. \
     * If it's not a preserved timer, add it to its TimerManager. \
     * A `start` event will be emitted.
     */
    start() {
        this.enable = true;
        if (!this.preserved) {
            this._timerManager.addTimer(this);
        }
        return this;
    }
    /**
     * Stop timer. \
     * An `end` event will be emitted.
     */
    stop(fireCallback = true) {
        this.isEnded = true;
        this.enable = false;
        if (fireCallback)
            this.emit('end', this._elapsedTime);
        return this;
    }
    /**
     * Rest timer to it's initial status.
     * (doesn't necessarily stop the timer)
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
     * Remove this timer from its TimerManager.
     */
    remove() {
        this._timerManager.removeTimer(this);
        return this;
    }
    /**
     * Start another timer when this one is ended.
     * @returns this
     */
    chain(next: vbTimer) {
        this._next = next;
        next.timerManager = this.timerManager;
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
                if (this._next !== undefined) {
                    this._next.start();
                }
            }
        }
    }

    /** Can add multiple callbacks */
    onStart(fn: (elapsedTime: number) => void) {
        this.on('start', fn); return this;
    }
    /** Can add multiple callbacks */
    onUpdate(fn: (elapsedTime: number, delta: number) => void) {
        this.on('update', fn); return this;
    }
    /** Can add multiple callbacks */
    onRepeat(fn: (elapsedTime: number, repeatCount: number) => void) {
        this.on('repeat', fn); return this;
    }
    /** Can add multiple callbacks */
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
                if (timer.isEnded && !timer.preserved) {
                    this.removeTimer(timer);
                }
            }
        }
    }
    /**
     * Add timer to this TimerManager. \
     * If it's not a preserved timer, only add when it starts.
     */
    addTimer(timer: vbTimer) {
        if (timer.preserved) {
            this._timers.push(timer);
        }
        else {
            if (timer.enable) {
                this._timers.push(timer);
            }
        }
    }
    /**
     * Remove timer from this TimerManager.
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