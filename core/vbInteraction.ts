import type * as PIXI from 'pixi.js';
import type { ColorOverlayFilter } from 'pixi-filters'
import type { TypeCons, vbGraphicObject } from '@vb/vbGraphicObject';
import { isMobile } from '@vb/misc/WebUtils';


export type InteractionFn = (e: PIXI.InteractionEvent) => void;

/**
 * A utility class to easily set or toggle pointer events, with default effect.
 */
 export interface vbInteractiveObject extends vbGraphicObject {
    readonly clickFn?: InteractionFn;
    readonly pointerdownFn?: InteractionFn;
    readonly pointerupFn?: InteractionFn;
    readonly pointeroverFn?: InteractionFn;
    readonly pointeroutFn?: InteractionFn;
    /**
     * Set the click event (use `pointerup` currently)
     * 
     * @param [fn] If it's a boolean and the function has already been given, the event will be toggled on/off.
     * @param [on] If `fn` is a function, `on` determines whether to turn on the event.
     * Sometimes you just want to initialize with a function but turn it on later.
     */
    setOnClick(fn: InteractionFn | boolean, on: boolean): this;
    /**
     * Use default color overlay effect when the pointer hovers over it.
     * Ignore it on mobile devices.
     * 
     * @param [on] see setClick
     */
    defaultHoverEffect(filter: ColorOverlayFilter, color: number, alpha: number, on?: boolean): this;
    /**
     * Turn the hover effect on or off after you set it.
     */
    setHoverEffect(on: boolean): this;
    /**
     * Use default color overlay effect when the pointer clicks on it.
     * 
     * @param [on] see setClick
     */
    defaultClickEffect(filter: ColorOverlayFilter, color: number, alpha: number, on?: boolean): this;
    /**
     * Turn the hover effect on or off after you set it.
     */
    setClickEffect(on: boolean): this;
    /**
     * Manually set a pointer event. \
     * Note that usually you don't need this since default methods are enough.
     * 
     * @param [event] pointerdown / pointerup / pointerover / pointerout
     * @param [fn] see setClick
     * @param [on] see setClick
     */
    pointer(event: 'down'|'up'|'over'|'out', fn: InteractionFn | boolean, on?: boolean): this;
}


/**
 * Mixin to make other classes as InteractiveObject. \
 * Technically the event emitter allows to bind multiple callbacks for one event,
 * but for simplicity we only set one at a time.
 */
export function vbInteractiveObjectBase<TOther extends TypeCons<vbGraphicObject>>(Other: TOther) {
    return class InteractiveObject extends Other implements vbInteractiveObject {
        interactive = true;

        protected _click_fn?: InteractionFn;
        protected _down_fn?: InteractionFn;
        protected _up_fn?: InteractionFn;
        protected _over_fn?: InteractionFn;
        protected _out_fn?: InteractionFn;
        get clickFn() { return this._click_fn; }
        get pointerdownFn() { return this._down_fn; }
        get pointerupFn() { return this._up_fn; }
        get pointeroverFn() { return this._over_fn; }
        get pointeroutFn() { return this._out_fn; }

        setOnClick(fn: InteractionFn | boolean, on=true) {
            this._click_fn = this._setEventCallback('pointerup', this._click_fn, fn, on);
            return this;
        }
        
        defaultHoverEffect(filter: ColorOverlayFilter, color: number, alpha: number, on=true) {
            if (this.filters === null) {
                this.filters = [];
            }
            if (isMobile()) {
                return this;
            }
            const pointeroverFn = (e: PIXI.InteractionEvent) => {
                filter.color = color;
                filter.alpha = alpha;
                if (!this.filters?.includes(filter))
                    this.filters?.push(filter);
            };
            const pointeroutFn = () => {
                this.filters?.removeOnce(filter);
            }
            this.pointer('over', pointeroverFn, on).pointer('out', pointeroutFn, on);
            return this;
        }

        setHoverEffect(on: boolean) {
            return this.pointer('over', on).pointer('out', on);
        }

        defaultClickEffect(filter: ColorOverlayFilter, color: number, alpha: number, on=true) {
            if (this.filters === null) {
                this.filters = [];
            }
            const pointerdownFn = () => {
                filter.color = color;
                filter.alpha = alpha;
                if (!this.filters?.includes(filter))
                    this.filters?.push(filter);
            }
            const pointerupFn = () => {
                this.filters?.removeOnce(filter);
            }
            return this.pointer('down', pointerdownFn, on).pointer('up', pointerupFn, on);
        }

        setClickEffect(on: boolean) {
            return this.pointer('down', on).pointer('up', on);
        }

        pointer(event: 'down'|'up'|'over'|'out', fn: InteractionFn | boolean, on=true) {
            switch (event) {
                case 'down': {
                    this._down_fn = this._setEventCallback('pointerdown', this._down_fn, fn, on); break;
                }
                case 'up': {
                    this._up_fn = this._setEventCallback('pointerup', this._up_fn, fn, on); break;
                }
                case 'over': {
                    this._over_fn = this._setEventCallback('pointerover', this._over_fn, fn, on); break;
                }
                case 'out': {
                    this._out_fn = this._setEventCallback('pointerout', this._out_fn, fn, on); break;
                }
            }
            return this;
        }

        protected _setEventCallback(eventName: string, oldFn: InteractionFn | undefined, fn: InteractionFn | boolean, on: boolean) {
            let newFn = oldFn;
            // clear the current callback anyway to prevent duplication
            if (oldFn !== undefined)
                this.off(eventName, oldFn);

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
