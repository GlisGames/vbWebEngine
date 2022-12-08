import type * as PIXI from 'pixi.js';
import { ColorOverlayFilter } from 'pixi-filters'
import type { TypeCons } from '@vb/vbGraphicObject';
import { isMobile } from '@vb/misc/WebUtils';
import type { vbContainer } from '@vb/vbContainer';
import { vbGraphicObject } from '@vb/vbGraphicObject';
import { vbTimer } from '@vb/vbTimer';
import type { vbTimerManager } from '@vb/vbTimer';


export type InteractionFn = (e: PIXI.InteractionEvent) => void;

type PointerEvent = 'tap'|'down'|'up'|'over'|'out'|'upoutside'|'cancel';

/**
 * Mixin to make other classes as InteractiveObject. \
 * A utility class to easily set or toggle events, with frequently used default effect. \
 * Technically the event system allows to bind multiple listener callbacks for one event,
 * but for simplicity we only set one at a time so that it's easier to toggle on/off.
 */
export function vbInteractiveObjectBase<TOther extends TypeCons<vbGraphicObject>>(Other: TOther) {
    return class InteractiveObject extends Other {
        interactive = true;
        isPointerDown = false;
        isPointerOver = false;
        protected _defaultColorFilter?: ColorOverlayFilter;
        /**
         * Stored event names and their listener callbacks. \
         * (Vanilla event system doesn't keep the callbacks after you remove them)
         */
        protected _assignedListeners: Record<string, InteractionFn> = {};

        getListenerFn(event: string): InteractionFn | undefined {
            return this._assignedListeners[event];
        }

        /**
         * Manually set a event listener callback. \
         * (Note that usually you don't need this since default methods are enough.)
         * 
         * @param [event] Event name
         * @param [fn] If it's a boolean and the function has already been given, the event will be toggled on/off.
         * @param [on] If `fn` is a function, `on` determines whether to turn on the event.
         * Sometimes you just want to initialize with a function but turn it on later.
         */
        setEvent(event: string, fn: InteractionFn | boolean, on=true) {
            let oldFn = this._assignedListeners[event];
            // clear the current callback anyway to prevent duplication
            if (oldFn !== undefined)
                this.off(event, oldFn);

            if (fn === true) {
                if (oldFn !== undefined)
                    this.on(event, oldFn);
            }
            else if (fn !== false) {
                this._assignedListeners[event] = fn;
                if (on) this.on(event, fn);
            }
            return this;
        }

        /**
         * Manually set a pointer event listener callback. \
         * This is just a shorthand of `setEvent` method since pointer events are most used.
         * 
         * @param [event] pointertap, pointerdown, pointerup, pointerover, pointerout, pointerupoutside, pointercancel
         */
        pointer(event: PointerEvent, fn: InteractionFn | boolean, on=true) {
            return this.setEvent('pointer' + event, fn, on);
        }

        /**
         * Set the click event (use `pointertap` currently)
         * 
         * @param see `setEvent` 
         */
        setOnClick(fn: InteractionFn | boolean, on=true) {
            return this.setEvent('pointertap', fn, on);
        }

        /**
         * Use default color overlay effect when the pointer hovers over it. (Ignore on mobile devices) \
         * Use `pointerover` and `pointerout` events.
         * 
         * @param [filter] Use this one if specified. Otherwise construct and assign to its own property.
         */
        defaultHoverEffect(color: number, alpha: number, filter?: ColorOverlayFilter) {
            if (isMobile()) {
                return this;
            }
            if (filter === undefined) {
                if (this._defaultColorFilter === undefined)
                    this._defaultColorFilter = new ColorOverlayFilter();
            }
            else
                this._defaultColorFilter = filter;
            const _filter = this._defaultColorFilter;
            const pointeroverFn = (e: PIXI.InteractionEvent) => {
                this.isPointerOver = true;
                if (this.isPointerDown) {
                    const pointerdown_fn = this.getListenerFn('pointerdown');
                    if (pointerdown_fn !== undefined) pointerdown_fn(e);
                    return;
                }
                _filter.color = color;
                _filter.alpha = alpha;
                if (!this.filters?.includes(_filter))
                    this.addFilter(_filter);
            };
            const pointeroutFn = () => {
                this.isPointerOver = false;
                this.filters?.removeOnce(_filter);
            }
            return this.pointer('over', pointeroverFn)
                       .pointer('out', pointeroutFn);
        }
        /**
         * Turn the hover effect on or off after you set it.
         */
        setHoverEffect(on: boolean) {
            return this.pointer('over', on).pointer('out', on);
        }

        /**
         * Use default color overlay effect when the pointer clicks on it. \
         * Use `pointerdown`, `pointerup` and `pointerupoutside` events.
         * 
         * @param [filter] Use this one if specified. Otherwise construct and assign to its own property.
         */
        defaultClickEffect(color: number, alpha: number, filter?: ColorOverlayFilter) {
            if (filter === undefined) {
                if (this._defaultColorFilter === undefined)
                    this._defaultColorFilter = new ColorOverlayFilter();
            }
            else
                this._defaultColorFilter = filter;
            const _filter = this._defaultColorFilter;
            const pointerdownFn = () => {
                this.isPointerDown = true;
                _filter.color = color;
                _filter.alpha = alpha;
                if (!this.filters?.includes(_filter))
                    this.addFilter(_filter);
            }
            const pointerupFn = () => {
                this.isPointerDown = false;
                this.filters?.removeOnce(_filter);
            }
            return this.pointer('down', pointerdownFn)
                       .pointer('up', pointerupFn)
                       .pointer('upoutside', pointerupFn);
        }
        /**
         * Turn the hover effect on or off after you set it.
         */
        setClickEffect(on: boolean) {
            return this.pointer('down', on).pointer('up', on).pointer('upoutside', on);
        }

        /**
         * It's is primarily used for clearing default hover effect.
         */
        clearEffect() {
            if (this.isPointerOver && this._defaultColorFilter !== undefined) {
                this.isPointerOver = false;
                this.filters?.removeOnce(this._defaultColorFilter);
            }
        }
    }
}


/**
 * An empty interactive object base class. \
 * Generated by: `vbInteractiveObjectBase(vbGraphicObject)` \
 * It is suggested that only use this as type hint.
 */
export class vbInteractiveObject extends vbInteractiveObjectBase(vbGraphicObject) {}


export class vbInteractionManager {
    protected _delayEnableExit: vbTimer;
    protected _delayEnableClick: vbTimer;
    
    constructor(globalTimer: vbTimerManager) {
        this._delayEnableExit = new vbTimer(globalTimer, 200);
        this._delayEnableClick = new vbTimer(globalTimer, 200);
    }

    /**
     * This method is only used in a specific scenario,
     * where there's a button to open an object (typically a container), and you expect to click anywhere on the screen
     * except that object to close it.
     * 
     * @param [btn] the button to set onClick event
     * @param [enterFn] the callback to open the object
     * @param [exitFn] the callback to close the object
     * @param [bound] a container to detect if the exitFn should be called
     */
    wrapGlobalClickEvent(btn: vbInteractiveObject, enterFn: InteractionFn, exitFn: InteractionFn, bound?: vbContainer) {
        const wrappedEnterFn = (e: PIXI.InteractionEvent) => {
            enterFn(e);
            btn.setOnClick(false);
            this._delayEnableExit.restart();
        }

        const wrappedExitFn = (e: PIXI.InteractionEvent) => {
            if (bound?.containsInteraction(e)) {
                // player clicks inside bound, does nothing
                return;
            }

            exitFn(e);
            globalThis.pgame.stage.off('pointertap', wrappedExitFn);
            this._delayEnableClick.restart();
        }

        // take a short delay when player open or close the object to avoid immediate re-enter.
        this._delayEnableExit.clearOnEnd().onEnd(() => {
            globalThis.pgame.stage.on('pointertap', wrappedExitFn);
        });
        this._delayEnableClick.clearOnEnd().onEnd(() => {
            btn.setOnClick(true);
        });

        btn.setOnClick(wrappedEnterFn);
    }
}
