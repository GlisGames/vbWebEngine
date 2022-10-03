/** Here to put some simple objects used for demo purpose, like a message box...  */
import { vbTween, vbTweenMap } from '@vb/vbTween'
import { vbShape, vbPrimitive } from './vbPrimitive';
import { vbButton } from './vbButton';
import { vbTextInitOptions } from './vbText';


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
        this.enable = false;
        // set callback
        this.fadeTween.onStart((obj: this) => {
            this.onStartFadingFn(obj);
        })
        .onComplete((obj: this) => {
            this.enable = false;
            this.onFadeEndFn(obj);
        });
    }

    get enable() { return this._enable; }
    set enable(en: boolean) {
        // set everything
        this._enable = this.renderable = this.interactive = en;
    }

    /**
     * Pop up the message
     * 
     * @param [displayTime]
     * @param [fadeTime] 
     */
    pop(displayTime: number, fadeTime: number) {
        this.enable = true;
        this.alpha = 1;
        this.fadeTween.delay(displayTime).duration(fadeTime).restart();
    }
}