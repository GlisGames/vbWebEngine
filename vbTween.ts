import * as TWEEN from '@tweenjs/tween.js'


type UnknownProps = Record<string, any>;

export class vbTween<T extends UnknownProps> extends TWEEN.Tween<T> {
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

    getMap() {
        return <vbTweenMap>((<any>this)._group);
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

    removeAll() {
        super.removeAll();
        this.twmap?.clear();
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