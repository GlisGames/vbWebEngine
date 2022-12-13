/* eslint-disable @typescript-eslint/no-explicit-any */
import * as TWEEN from '@tweenjs/tween.js'


type UnknownProps = Record<string, any>;

export class vbTween<T extends UnknownProps> extends TWEEN.Tween<T> {
    protected _onCompleteCallbacks: ((object: T) => void)[] = [];
    protected _enableMultiCallbacks = false;
    name: string;

    constructor(name: string, obj: T, group: TWEEN.Group) {
        super(obj, group);
        this.name = name;
    }

    start() {
        return super.start(globalThis.pgame.TotalMS);
    }

    pause() {
        return super.pause(globalThis.pgame.TotalMS);
    }

    resume() {
        return super.resume(globalThis.pgame.TotalMS);
    }

    /**
     * Different from `stop()`,
     * `end()` will set the duration and repeat to zero so that the tween completes instantly upon next update
     */
    end() {
        (<any>this)._goToEnd = true;
        (<any>this)._repeat = 0;
        return this.duration(0.01);
    }

    getMap() {
        return <vbTweenMap>((<any>this)._group);
    }

    /**
     * A frequent usage scenario is that multiple entities want to add each of their on complete callback
     * to a single tween. So this method enables support for multiple callbacks.
     */
    addOnComplete(callback: (object: T) => void) {
        if (!this._enableMultiCallbacks) {
            this._enableMultiCallbacks = true;
            super.onComplete((object: T) => {
                for (const callback of this._onCompleteCallbacks) {
                    callback(object);
                }
            });
        }
        this._onCompleteCallbacks.push(callback);
        return this;
    }
    /**
     * Clear onComplete callbacks added via `addOnComplete`
     */
    clearMultiOnComplete() {
        this._onCompleteCallbacks.clear();
        return this;
    }
    /**
     * This method will only keep one callback at a time
     */
    onComplete(callback: (object: T) => void) {
        if (this._enableMultiCallbacks) {
            this._enableMultiCallbacks = false;
        }
        return super.onComplete(callback);
    }

    update(time: number, autoStart: boolean) {
        let stillPlaying = super.update(time, autoStart);
        if (!stillPlaying) {
            // delete from map
            (<any>this.getMap()).twmap?.delete(this.name);
        }
        // the tween group will do the remaining jobs
        return stillPlaying;
    }

    reset() {
        let thisany = <any>this;
        thisany._startTime = globalThis.pgame.TotalMS + thisany._delayTime;
        return this;
    }

    /**
     * @param [fireCallback] Whether to fire the onStart callback again. Default true.
     */
    restart(fireCallback = true) {
        if (!this.isPlaying()) {
            return this.start();
        }
        // hack the private variables
        let thisany = <any>this;
        thisany._startTime = globalThis.pgame.TotalMS + thisany._delayTime;
        thisany._onStartCallbackFired = !fireCallback;
        return this;
    }
}


export class vbTweenMap extends TWEEN.Group {
    /** Map the name of tweens */
    protected twmap: Map<string, vbTween<any>> | undefined;

    /**
     * @param [name] Cannot be duplicated
     * @param [obj] Owner object of the properties in `to`
     * @param [to] A collection of properties from `obj`.
     * @param [duration] Time in ms.
     */
    create<T extends UnknownProps>(name: string, obj: T, to: UnknownProps, duration?: number) {
        if (this.twmap === undefined) {
            this.twmap = new Map<string, vbTween<any>>();
        }
        let tw = new vbTween(name, obj, this).to(to, duration);
        if (this.twmap.has(name)) throw ReferenceError(`Tween "${name}" already exists!`);
        this.twmap.set(name, tw);
        return tw;
    }

    getByName(name: string) {
        return this.twmap?.get(name);
    }

    size() {
        if (this.twmap === undefined) return 0;
        else return this.twmap.size;
    }

    addTween(tw: vbTween<UnknownProps>) {
        if (this.twmap === undefined) {
            this.twmap = new Map<string, vbTween<UnknownProps>>();
        }
        if (this.twmap.has(tw.name)) throw ReferenceError(`Tween "${tw.name}" already exists!`);
        this.twmap.set(tw.name, tw);
        tw.group(this);
    }

    removeAll() {
        super.removeAll();
        this.twmap?.clear();
    }

    endAll() {
        if (this.twmap === undefined) return;
        for (const item of this.twmap) {
            item[1].end();
        }
        // do a force update to remove all tweens
        this.update(Infinity, false);
    }

    remove(tween: vbTween<UnknownProps>, force = false) {
        super.remove(tween);
        // if the tween is paused, don't remove it from the name map,
        // only remove when the tween stops playing.
        if (!tween.isPlaying() || force) {
            this.twmap?.delete(tween.name);
        }
    }
}