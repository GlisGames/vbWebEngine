import * as PIXI from 'pixi.js';
import { PivotPoint, setPivotRule, setSpritePivotRule } from './core/vbTransform';
import type { StyleItem } from './core/vbStyle';
import { c } from './misc/vbShared';
import type { vbContainer } from './vbContainer';


/** Define "Class" type */
export type TypeCons<T> = new (...args: any[]) => T;

/**
 * Create a vbEngine base class, inherited from Pixi.Js Container
 * 
 * Use Mixins to extend the class, similar to multiple inheritance in other languages.
 * https://www.typescriptlang.org/docs/handbook/mixins.html
 */
export function vbGraphicObjectBase<TOther extends TypeCons<PIXI.Container>>(Other: TOther) {
    return class GraphicObject extends Other {
        /**
         * `name` of an object is used for matching style or localized text style
         */
        name = '';

        protected _enable = true;
        protected _pivotRule = PivotPoint.TopLeft;
        // For some reason, this debugBox cannot be a derived class of vbGraphicObject (recursive dependency?)
        protected _debugBox?: PIXI.Graphics;
        /**
         * For some weird reason, `_width` is protected in PIXI.Container, but public in PIXI.Sprite.
         * Thus we have to declare it as public for consistency.
         */
        declare public _width: number;
        /**
         * For some weird reason, `_height` is protected in PIXI.Container, but public in PIXI.Sprite.
         * Thus we have to declare it as public for consistency.
         */
        declare public _height: number;
        
        /**
         * Enables or disable the "update" function \
         * Default Value: `true`
         */
        get enable() { return this._enable; }
        set enable(en: boolean) { this._enable = en; }

        /**
         * Pivot Rule affects positioning, scaling and roation. \
         * If it's a regular object, the pivot is calculated by width and height. \
         * If it's Container, the pivot is calculated by desiredSize, thus it should only be called when the size has been specified. \
         * If set to Custom, should call setCustomPivot \
         * Default Value: `TopLeft`
         */
        get pivotRule() { return this._pivotRule; }
        set pivotRule(rule: PivotPoint) {
            this._pivotRule = rule;
            if (this instanceof PIXI.Sprite) {
                setSpritePivotRule(this, rule);
                // Since the sprite pivot rule only set the anchor
                // we have to set pivot rule for debugBox as well or it won't be changed
                if ((this._debugBox !== undefined) && this._debugBox.renderable) {
                    setPivotRule(this._debugBox, rule, this.width, this.height);
                }
            }
            else {
                setPivotRule(this, rule, this.width, this.height);
            }
        }

        /**
         * x, y position relative to the width and height of the object itself.
         */
        setCustomPivot(x: number, y: number) {
            this.pivot.set(x, y);
        }

        /**
         * The larger the value, the highter it closes to the front,
         * and the greater the index in Container.children.
         */
        get layer() { return this.zIndex; }
        set layer(z: number) {
            this.zIndex = z;
        }

        get parentContainer() {
            return <vbContainer><any>this.parent;
        }
        hasParent() {
            return this.parent !== null;
        }

        sendToBack() {
            this.parentContainer.sendObjToBack(this);
        }
        bringToFront() {
            this.parentContainer.bringObjToFront(this);
        }

        /**
         * PixiJS uses deltaFrame instead of delatTime in milliseconds as the parameter of update function.
         * But sometimes we need delatTime, or even the total time since game started (for Tween.js),
         * Thus we could call `getDeltaMS`, `getTotalMS` etc, from vbGame. 
         * 
         * @param [deltaFrame] Number of (desired) frames since last call.
         *        It is calculated based on the target FPS (by default is 60). \
         *        e.g. If the real FPS is 45, deltaFrame is around 1.5
         */
        update(deltaFrame: number) {}

        /**
         * Apply the complete style with a given item.
         * @note [Can be used for type check]
         * 
         * @param [item] make sure `item` is not undefined.
         */
        applyStyle(item: StyleItem) {
            if (item.xy !== undefined) {
                this.x = item.xy[0];
                this.y = item.xy[1];
            }
            if (item.s !== undefined) {
                this.scale.set(item.s);
            }
            if (item.wh !== undefined) {
                this.width = item.wh[0];
                this.height = item.wh[1];
            }
        }


        /** Different classes can have different debugBox fill style. */
        protected static _debugFillStyle = (() => { let s = new PIXI.FillStyle();
            s.visible = false; return s;
        })();
        /** Different classes can have different debugBox line style. */
        protected static _debugLineStyle = (() => { let s = new PIXI.LineStyle();
            s.visible = true; s.color = c.Blue; s.alpha = 1; s.width = 2; return s;
        })();

        /**
         * Show a debug rectangle with `width` and `height`. \
         * `width` and `height` from PixJS Container are dynamically changed based on the object itself, children and scale. \
         * Therefore, the debugBox of some types whose sizes can change easily (e.g. Text) may not have much sense.
         */
        get debugBox() {
            return (this._debugBox !== undefined) && (this._debugBox.renderable);
        }
        set debugBox(enable: boolean) {
            this._showDebugBox(enable, this.width, this.height);
        }
        protected _showDebugBox(enable: boolean, width: number, height: number) {
            if (enable) {
                if (this._debugBox === undefined) {
                    let rect = new PIXI.Rectangle(0, 0, width, height);
                    // Access the static variable by instance.
                    let fillStyle = (<any>this.constructor)._debugFillStyle;
                    let lineStyle = (<any>this.constructor)._debugLineStyle;
                    this._debugBox = new PIXI.Graphics();
                    this._debugBox.name = 'debugBox';
                    this._debugBox.geometry.drawShape(rect, fillStyle, lineStyle);
                    this._debugBox.zIndex = 9998;
                    this.addChild(this._debugBox);
                }
                // update debugBox pivotRule
                if (this instanceof PIXI.Sprite) {
                    setPivotRule(this._debugBox, this._pivotRule, width, height);
                }
                this._debugBox.renderable = true;
            }
            else {
                if (this._debugBox === undefined) return;
                this._debugBox.renderable = false;
            }
        }
    }
}


class BaseClass extends vbGraphicObjectBase(PIXI.Container) {}
/**
 * The type of vbEngine base class. \
 * Generated by: `vbGraphicObjectBase(PIXI.Container)`
 */
export type vbGraphicObject = BaseClass;


/**
 * Typescript doesn't support function overloading with different numbers of parameters.
 * If we have to do overload with different signatures,
 * we should omit those methods in base class by using "Omit<T, K>" \
 * https://www.damirscorner.com/blog/posts/20190712-ChangeMethodSignatureInTypescriptSubclass.html \
 * https://stackoverflow.com/questions/48215950/exclude-property-from-type \
 * However, type (or interface) and class are different concepts in Typescript,
 * so we have to use a type constructor to construct the omitted class: \
 * https://stackoverflow.com/questions/68021829/i-want-to-extend-from-one-class-but-delete-some-property \
 * This solution is very tricky and can cause lot of issues, so we decided to not use it.
 * @returns "Class" object
 */
const OmitClassCons = <T, K extends string>(Base: new (...args: any) => T):
    new (...args: any) => Omit<T, K> => Base;
