import * as TWEEN from '@tweenjs/tween.js'
import { vbgame } from './vbGame'


type UnknownProps = Record<string, any>;

export class vbTween<T extends UnknownProps> extends TWEEN.Tween<T> {
    name: string;

    constructor(name: string, obj: T, group: TWEEN.Group) {
        super(obj, group);
        this.name = name;
    }

    start() {
        return super.start(vbgame.TotalMS);
    }

    pause() {
        return super.pause(vbgame.TotalMS);
    }

    resume() {
        return super.resume(vbgame.TotalMS);
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
        thisany._startTime = vbgame.TotalMS + thisany._delayTime;
        thisany._onStartCallbackFired = !fireCallback;
        return this;
    }
}


export class vbTweenMap extends TWEEN.Group {
    /** Map the name of tweens */
    protected twmap: Map<string, vbTween<UnknownProps>> | undefined;

    /**
     * @param [name] Cannot be duplicated
     * @param [obj] Owner object of the properties in `to`
     * @param [to] A collection of properties from `obj`.
     * @param [duration] Time in ms.
     */
    create<T extends UnknownProps>(name: string, obj: T, to: UnknownProps, duration?: number) {
        if (this.twmap === undefined) {
            this.twmap = new Map<string, vbTween<UnknownProps>>();
        }
        let tw = new vbTween(name, obj, this).to(to, duration);
        this.twmap.set(name, tw);
        return tw;
    }

    getByName(name: string) {
        return this.twmap?.get(name);
    }

    addTween(tw: vbTween<UnknownProps>) {
        if (this.twmap === undefined) {
            this.twmap = new Map<string, vbTween<UnknownProps>>();
        }
        this.twmap?.set(tw.name, tw);
        tw.group(this);
    }

    remove(tween: vbTween<UnknownProps>) {
        super.remove(tween);
        // if the tween is paused, don't remove it from the name map,
        // only remove when the tween stops playing.
        if (!tween.isPlaying()) {
            this.twmap?.delete(tween.name);
        }
    }
}