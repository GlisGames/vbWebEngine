import * as PIXI from 'pixi.js';
import { Sprite, Container } from 'pixi.js';
import type { vbContainer } from './vbContainer';
import { vb } from './vbUtils';


export enum PivotTransformRule {
    TopLeft,
    Center,
    TopMiddle,
    BottomMiddle,
    Custom
}

/** A single style element for a vbGraphicObject */
export type StyleItem = {
    /** position [x, y] */
    xy: [number, number],
    /** scale */
    s?: number,
    /** width and height [w, h] */
    wh?: [number, number],
}
export type StyleList = {
    /** Object name */
    [name: string]: StyleItem
}


/**
 * vbEngine base class, inherited from Pixi.Js Container
 */
export interface vbGraphicObject extends Container {
    /**
     * Enables or disable the "update" function \
     * Default Value: `true`
     */
    get enable(): boolean;
    set enable(en: boolean);
    /**
     * Pivot Rule affects positioning, scaling and roation. \
     * If it's a regular object, the pivot is calculated by width and height. \
     * If it's Container, the pivot is calculated by desiredSize, thus it should only be called when the size has been specified. \
     * If set to Custom, should call setCustomPivot \
     * Default Value: `TopLeft`
     */
    get pivotRule(): PivotTransformRule;
    set pivotRule(rule: PivotTransformRule);
    /**
     * x, y position relative to the width and height of the object itself.
     */
    setCustomPivot(x: number, y: number): void;
    /**
     * The larger the value, the highter it closes to the front,
     * and the greater the index in Container.children.
     */
    get layer(): number;
    set layer(z: number);

    readonly parentContainer: vbContainer;
    sendToBack(): void;
    bringToFront(): void;
    /**
     * PixiJS uses deltaFrame instead of delatTime in milliseconds as the parameter of update function.
     * But sometimes we need delatTime, or even the total time since game started (for Tween.js),
     * Thus we could call `getDeltaMS`, `getTotalMS` etc, from vbGame. 
     * @param [deltaFrame] Number of (desired) frames since last call.
     *        It is calculated based on the target FPS (by default is 60). \
     *        e.g. If the real FPS is 45, deltaFrame is around 1.5
     */
    update(deltaFrame: number): void;
    /**
     * @return if `item` is undefined, return false
     */
    applyStyle(item?: StyleItem): boolean;
    /**
     * Show a debug rectangle with `width` and `height`. \
     * `width` and `height` from PixJS Container are dynamically changed based on the object itself, children and scale. \
     * Therefore, the debugBox of some types whose sizes can change easily (e.g. Text) doesn't make too much sense.
     */
    get debugBox(): boolean;
    set debugBox(enable: boolean);
}
/** Define "Class" type */
export type TypeCons<T> = new (...args: any[]) => T;
/**
 * Use Mixins to extend the class, similar to multiple inheritance in other languages.
 * https://www.typescriptlang.org/docs/handbook/mixins.html
 */
export function vbGraphicObjectBase<TOther extends TypeCons<Container>>(Other: TOther) {
    return class GraphicObject extends Other implements vbGraphicObject {
        name = '';
        protected _enable = true;
        protected _pivotRule = PivotTransformRule.TopLeft;
        // For some reason, this debugBox cannot be a derived class (recursive dependency?)
        protected _debugBox?: PIXI.Graphics;
        
        get enable() { return this._enable; }
        set enable(en: boolean) { this._enable = en; }

        get pivotRule() { return this._pivotRule; }
        set pivotRule(rule: PivotTransformRule) {
            this._pivotRule = rule;
            if (this instanceof Sprite) {
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

        setCustomPivot(x: number, y: number) {
            this.pivot.set(x, y);
        }

        get layer() { return this.zIndex; }
        set layer(z: number) {
            this.zIndex = z;
        }

        get parentContainer() {
            return <vbContainer><any>this.parent;
        }
        sendToBack() {
            this.parentContainer.sendObjToBack(this);
        }
        bringToFront() {
            this.parentContainer.bringObjToFront(this);
        }

        update(deltaFrame: number) {}
        applyStyle(item?: StyleItem) {
            if (item === undefined) return false;
            this.x = item.xy[0];
            this.y = item.xy[1];
            if (item.s !== undefined) {
                this.scale.set(item.s);
            }
            if (item.wh !== undefined) {
                this.width = item.wh[0];
                this.height = item.wh[1];
            }
            return true;
        }

        // Different classes can have different debugBox style.
        protected static _debugFillStyle = (() => { let s = new PIXI.FillStyle();
            s.visible = false; return s;
        })();
        protected static _debugLineStyle = (() => { let s = new PIXI.LineStyle();
            s.visible = true; s.color = vb.Blue; s.alpha = 1; s.width = 2; return s;
        })();

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
                    this._debugBox.geometry.drawShape(rect, fillStyle, lineStyle);
                    this._debugBox.zIndex = 9998;
                    this.addChild(this._debugBox);
                }
                // update debugBox pivotRule
                setPivotRule(this._debugBox, this.pivotRule, this.width, this.height);
                this._debugBox.renderable = true;
            }
            else {
                if (this._debugBox === undefined) return;
                this._debugBox.renderable = false;
            }
        }
    }
}


export function setPivotRule(obj: Container, rule: PivotTransformRule, width: number, height: number) {
    switch (rule) {
        case PivotTransformRule.TopLeft: {
            obj.pivot.set(0); break;
        }
        case PivotTransformRule.Center: {
            obj.pivot.set(width/2, height/2); break;
        }
        case PivotTransformRule.TopMiddle: {
            obj.pivot.set(width/2, 0); break;
        }
        case PivotTransformRule.BottomMiddle: {
            obj.pivot.set(width/2, height); break;
        }
    }
}

export function setSpritePivotRule(obj: Sprite, rule: PivotTransformRule) {
    switch (rule) {
        case PivotTransformRule.TopLeft: {
            obj.anchor.set(0); break;
        }
        case PivotTransformRule.Center: {
            obj.anchor.set(0.5); break;
        }
        case PivotTransformRule.TopMiddle: {
            obj.anchor.set(0.5, 0); break;
        }
        case PivotTransformRule.BottomMiddle: {
            obj.anchor.set(0.5, 1); break;
        }
    }
}


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
