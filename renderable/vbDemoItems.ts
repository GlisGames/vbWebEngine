/** Here to put some simple objects used for demo purpose, like a message box...  */
import { c } from '@vb/misc/vbShared';
import { vbButton } from './vbButton';
import { vbPrimitive, vbShape } from './vbPrimitive';
import { vbText } from './vbText';
import type { vbTextInitOptions } from './vbText';
import type { vbTween, vbTweenMap } from '@vb/vbTween';


/**
 * A pop up message box that shows some texts and fades out after a while
 */
export class vbPopMessage extends vbButton<vbPrimitive> {
    fadeTween: vbTween<this>;
    onStartFadingFn = (obj: this) => {};
    onFadeEndFn = (obj: this) => {};

    /**
     * @param [shape] Primitive shape of the message box
     * @param [txtOptions] Options for text
     * @param [tweens] Reference of the containers' tween map
     */
    constructor(shape: vbShape, txtOptions: vbTextInitOptions, tweens: vbTweenMap) {
        super(new vbPrimitive(shape));
        this.fadeTween = tweens.create('fade', this, {alpha: 0});
        this.addDefaultText(txtOptions);
        // disable at start
        this.displayed = false;
        // set callback
        this.fadeTween.onStart((obj: this) => {
            this.onStartFadingFn(obj);
        })
        .onComplete((obj: this) => {
            this.displayed = false;
            this.onFadeEndFn(obj);
        });
    }

    get displayed() { return this.renderable; }
    set displayed(en: boolean) {
        this.renderable = this.interactive = this.interactiveChildren = en;
    }

    /**
     * Pop up the message.
     * (Won't do anything if it's not enabled)
     * 
     * @param [displayTime]
     * @param [fadeTime] 
     */
    pop(displayTime: number, fadeTime: number) {
        if (!this.enable) return;
        this.displayed = true;
        this.alpha = 1;
        this.fadeTween.delay(displayTime).duration(fadeTime).restart();
    }
}


/** Show the average over N_FRAME */
export class FPSCounter extends vbText {
    static N_FRAME = 10;
    protected _totalFrames = 0;
    protected _totalFPS = 0;

    constructor() {
        super({ font: 'Arial', size: 20, color: c.Green });
        this.style.dropShadow = true;
        this.style.dropShadowColor = c.Black;
        this.style.dropShadowDistance = 4;
    }

    update(deltaFrame: number) {
        this._totalFrames++;
        this._totalFPS += globalThis.pgame.FPS;
        if (this._totalFrames >= FPSCounter.N_FRAME) {
            this.text = (this._totalFPS / this._totalFrames).toFixed(0);
            this._totalFrames = 0;
            this._totalFPS = 0;
        }
    }
}
