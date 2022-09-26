import * as PIXI from 'pixi.js';
import { Sprite, Container } from 'pixi.js'
import type { vbContainer } from './vbContainer';
import { vb } from './vbUtils';


/** A single style element for a vbGraphicObject */
export type StyleElement = {
    /** position [x, y] */
    xy: number[],
    /** scale [x, y] */
    s?: number[],
    /** width and height [w, h] */
    wh?: number[],
}
export type StyleList = {
    /** Object name */
    [name: string]: StyleElement
}
/** Root containers hold all style elements of children objects */
export type Styles = {
    /** Root container name, could be state, GUI, etc. */
    [rootName: string]: StyleList
}

export enum PivotTransformRule {
    TopLeft,
    Center,
    Custom
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
     * @param deltaFrame - Number of (desired) frames since last call.
     *        It is calculated based on the target FPS (by default is 60). \
     *        e.g. If the real FPS is 45, deltaFrame is around 1.5
     */
    update(deltaFrame: number): void;
    /**
     * @return if `styleJson` is undefined, return false
     */
    applyStyle(styleJson?: StyleElement): boolean;
}
/** Define "Class" type */
export type TypeCons<T> = new (...args: any[]) => T;
/**
 * Use Mixins to extend the class, similar to multiple inheritance in other languages.
 * https://www.typescriptlang.org/docs/handbook/mixins.html
 */
export function vbGraphicObjectBase<TOther extends TypeCons<Container>>(Other: TOther) {
    return class GraphicObject extends Other implements vbGraphicObject {
        static _debugFillStyle = (() => { let s = new PIXI.FillStyle();
            s.visible = true; s.color = vb.White; s.alpha = 0.06; return s;
        })();
        static _debugLineStyle = (() => { let s = new PIXI.LineStyle;
            s.visible = true; s.color = vb.Red; s.alpha = 1; s.width = 2; return s;
        })();

        protected _enable = true;
        protected _pivotRule = PivotTransformRule.TopLeft;
        name = '';
        
        get enable() { return this._enable; }
        set enable(en: boolean) { this._enable = en; }

        get pivotRule() { return this._pivotRule; }
        set pivotRule(rule: PivotTransformRule) {
            this._pivotRule = rule;
            if (this instanceof Sprite) {
                let thisSprite = <Sprite>this;
                if (rule == PivotTransformRule.TopLeft) {
                    thisSprite.anchor.set(0);
                }
                else if (rule == PivotTransformRule.Center) {
                    thisSprite.anchor.set(0.5);
                }
            }
            else {
                if (rule == PivotTransformRule.TopLeft) {
                    this.pivot.set(0);
                }
                else if (rule == PivotTransformRule.Center) {
                    this.pivot.set(this.width/2, this.height/2);
                }
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
        applyStyle(styleJson?: StyleElement) {
            if (styleJson === undefined) return false;
            this.x = styleJson.xy[0];
            this.y = styleJson.xy[1];
            if (styleJson.s !== undefined) {
                this.scale.x = styleJson.s[0];
                this.scale.y = styleJson.s[1];
            }
            if (styleJson.wh !== undefined) {
                this.width = styleJson.wh[0];
                this.height = styleJson.wh[1];
            }
            return true;
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
