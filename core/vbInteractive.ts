import * as Filter from 'pixi-filters'
import type * as PIXI from 'pixi.js';
import type { TypeCons, vbGraphicObject } from '@vb/vbGraphicObject';


export type InteractionFn = (e: PIXI.InteractionEvent) => void;
/**
 * A utility class to easily set or toggle pointer events, with default effect.
 */
 export interface vbInteractiveObject extends vbGraphicObject {
    readonly pointerdownFn?: InteractionFn;
    readonly pointerupFn?: InteractionFn;
    readonly pointeroverFn?: InteractionFn;
    readonly pointeroutFn?: InteractionFn;
    /**
     * Use default color overlay effect when the pointer hovers over it.
     */
    defaultHoverEffect(color: number, alpha: number): this;
    /**
     * @param [fn] Set pointerdown event.
     * If it's a boolean and the function has already been given, the event will be toggled on/off.
     * @param [on] If `fn` is a function, `on` determines whether to turn on the event.
     * Sometimes you just want to initialize with a function but turn it on later.
     */
    setPointerdown(fn: InteractionFn | boolean, on: boolean): this;
    /**
     * @param [fn] Set pointerup event.
     * If it's a boolean and the function has already been given, the event will be toggled on/off.
     * @param [on] If `fn` is a function, `on` determines whether to turn on the event.
     * Sometimes you just want to initialize with a function but turn it on later.
     */
    setPointerup(fn: InteractionFn | boolean, on: boolean): this;
    /**
     * @param [fn] Set pointerover event.
     * If it's a boolean and the function has already been given, the event will be toggled on/off.
     * @param [on] If `fn` is a function, `on` determines whether to turn on the event.
     * Sometimes you just want to initialize with a function but turn it on later.
     */
    setPointerover(fn: InteractionFn | boolean, on: boolean): this;
    /**
     * @param [fn] Set pointerout event.
     * If it's a boolean and the function has already been given, the event will be toggled on/off.
     * @param [on] If `fn` is a function, `on` determines whether to turn on the event.
     * Sometimes you just want to initialize with a function but turn it on later.
     */
    setPointerout(fn: InteractionFn | boolean, on: boolean): this;
}


/**
 * Mixin to make other classes as InteractiveObject. \
 * Technically the event emitter allows to bind multiple callbacks for one event,
 * but for simplicity we only set one at a time.
 */
export function vbInteractiveObjectBase<TOther extends TypeCons<vbGraphicObject>>(Other: TOther) {
    return class InteractiveObject extends Other implements vbInteractiveObject {
        interactive = true;
        protected _defaultHoverFilter = new Filter.ColorOverlayFilter(0, 0);
        protected _pointerdown_fn?: InteractionFn;
        protected _pointerup_fn?: InteractionFn;
        protected _pointerover_fn?: InteractionFn;
        protected _pointerout_fn?: InteractionFn;
        get pointerdownFn() { return this._pointerdown_fn; }
        get pointerupFn() { return this._pointerup_fn; }
        get pointeroverFn() { return this._pointerover_fn; }
        get pointeroutFn() { return this._pointerout_fn; }
        
        defaultHoverEffect(color: number, alpha: number) {
            if (this.filters === null) {
                this.filters = [];
            }
            this._defaultHoverFilter.color = color;
            this._defaultHoverFilter.alpha = 0;
            if (!this.filters.includes(this._defaultHoverFilter)) {
                this.filters.push(this._defaultHoverFilter);
            }
            this.setPointerover(() => {
                this._defaultHoverFilter.alpha = alpha;
            })
            .setPointerout(() => {
                this._defaultHoverFilter.alpha = 0;
            });
            return this;
        }

        setPointerdown(fn: InteractionFn | boolean, on = true) {
            this._pointerdown_fn = this._setEventCallback('pointerdown', this._pointerdown_fn, fn, on);
            return this;
        }

        setPointerup(fn: InteractionFn | boolean, on = true) {
            this._pointerup_fn = this._setEventCallback('pointerup', this._pointerup_fn, fn, on);
            return this;
        }

        setPointerover(fn: InteractionFn | boolean, on = true) {
            this._pointerover_fn = this._setEventCallback('pointerover', this._pointerover_fn, fn, on);
            return this;
        }

        setPointerout(fn: InteractionFn | boolean, on = true) {
            this._pointerout_fn = this._setEventCallback('pointerout', this._pointerout_fn, fn, on);
            return this;
        }

        protected _setEventCallback(eventName: string, oldFn: InteractionFn | undefined, fn: InteractionFn | boolean, on: boolean) {
            let newFn = oldFn;
            // clear the current callback anyway to prevent duplication
            this.off(eventName);

            if (fn === true) {
                if (oldFn !== undefined)
                    this.on(eventName, oldFn);
            }
            else if (fn !== false) {
                newFn = fn;
                if (on) this.on(eventName, fn);
            }
            return newFn;
        }
    }
}
