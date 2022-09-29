import * as PIXI from 'pixi.js';
import * as Filter from 'pixi-filters'
import { TypeCons, vbGraphicObject } from '@vb/vbGraphicObject';
import { vbLabel } from './vbText';
import { vbImage } from '@vb/renderable/vbImage';
import { vbPrimitive } from './vbPrimitive';


/**
 * A utility class to easily set or toggle pointer events, with default effect.
 */
export interface vbInteractiveObject extends vbGraphicObject {
    readonly pointerdownFn?: (e: PIXI.InteractionEvent) => void;
    readonly pointerupFn?: (e: PIXI.InteractionEvent) => void;
    readonly pointeroverFn?: (e: PIXI.InteractionEvent) => void;
    readonly pointeroutFn?: (e: PIXI.InteractionEvent) => void;
    /**
     * Use default color overlay effect when the pointer hovers over it.
     */
    defaultHoverEffect(color: number, alpha: number): this;
    /**
     * @param [fn] Set pointerdown event.
     * If it's a boolean and the function has already been given, the event will be toggled on/off.
     */
    setPointerdown(fn: ((e: PIXI.InteractionEvent) => void) | boolean): this;
    /**
     * @param [fn] Set pointerup event.
     * If it's a boolean and the function has already been given, the event will be toggled on/off.
     */
    setPointerup(fn: ((e: PIXI.InteractionEvent) => void) | boolean): this;
    /**
     * @param [fn] Set pointerover event.
     * If it's a boolean and the function has already been given, the event will be toggled on/off.
     */
    setPointerover(fn: ((e: PIXI.InteractionEvent) => void) | boolean): this;
    /**
     * @param [fn] Set pointerout event.
     * If it's a boolean and the function has already been given, the event will be toggled on/off.
     */
    setPointerout(fn: ((e: PIXI.InteractionEvent) => void) | boolean): this;
}
/**
 * Mixin to make other classes as InteractiveObject.
 */
export function vbInteractiveObjectBase<TOther extends TypeCons<vbGraphicObject>>(Other: TOther) {
    return class InteractiveObject extends Other implements vbInteractiveObject {
        interactive = true;
        protected _defaultHoverFilter = new Filter.ColorOverlayFilter(0, 0);
        protected _pointerdown_fn?: (e: PIXI.InteractionEvent) => void;
        protected _pointerup_fn?: (e: PIXI.InteractionEvent) => void;
        protected _pointerover_fn?: (e: PIXI.InteractionEvent) => void;
        protected _pointerout_fn?: (e: PIXI.InteractionEvent) => void;
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

        setPointerdown(fn: ((e: PIXI.InteractionEvent) => void) | boolean) {
            if (fn === true) {
                if (this._pointerdown_fn !== undefined)
                    this.on('pointerdown', this._pointerdown_fn);
            }
            else if (fn === false)
                this.off('pointerdown');
            else {
                this.on('pointerdown', fn);
                this._pointerdown_fn = fn;
            }
            return this;
        }

        setPointerup(fn: ((e: PIXI.InteractionEvent) => void) | boolean) {
            if (fn === true) {
                if (this._pointerup_fn !== undefined)
                    this.on('pointerup', this._pointerup_fn);
            }
            else if (fn === false)
                this.off('pointerup');
            else {
                this.on('pointerup', fn);
                this._pointerup_fn = fn;
            }
            return this;
        }

        setPointerover(fn: ((e: PIXI.InteractionEvent) => void) | boolean) {
            if (fn === true) {
                if (this._pointerover_fn !== undefined)
                    this.on('pointerover', this._pointerover_fn);
            }
            else if (fn === false)
                this.off('pointerover');
            else {
                this.on('pointerover', fn);
                this._pointerover_fn = fn;
            }
            return this;
        }

        setPointerout(fn: ((e: PIXI.InteractionEvent) => void) | boolean) {
            if (fn === true) {
                if (this._pointerout_fn !== undefined)
                    this.on('pointerout', this._pointerout_fn);
            }
            else if (fn === false)
                this.off('pointerout');
            else {
                this.on('pointerout', fn);
                this._pointerout_fn = fn;
            }
            return this;
        }
    }
}


const _vbImageButton = vbInteractiveObjectBase(vbImage);
export class vbImageButton extends _vbImageButton {}
const _vbPrimitiveButton = vbInteractiveObjectBase(vbPrimitive);
export class vbPrimitiveButton extends _vbPrimitiveButton {}
/**
 * Basically it's an interactive vbLabel. 
 */
export class vbButton<T extends vbGraphicObject> extends vbInteractiveObjectBase(vbLabel)<T> {
    
}