import * as PIXI from 'pixi.js';
import { Container, ParticleContainer } from 'pixi.js';
import { PivotTransformRule, vbGraphicObject, vbGraphicObjectBase, StyleList } from './vbGraphicObject'
import { getTotalMS } from './vbGame';
import { vbTweenMap } from './vbTween';
import { vbPrimitive, vbRectangle } from './renderable/vbPrimitive';
import { vb } from './vbUtils'
import { getLanguageObject, vbLanguageObject } from './renderable/vbText';


/**
 * `width` and `height` from PixJS Container are dynamically changed based on the object itself, children and scale. \
 * So a `desiredSize` can better help with designing the layout, setting the pivot point etc.
 */
export class vbContainer extends vbGraphicObjectBase(Container) implements vbLanguageObject {
    /** "Send to Back" layer */
    static readonly minLayer = -9999;
    /** "Bring to Front" layer */
    static readonly maxLayer = 9999;

    tweens = new vbTweenMap();
    desiredSize = new PIXI.Point();
    protected _debugBox?: vbPrimitive;

    constructor(desiredWidth?: number, desiredHeight?: number) {
        super();
        this.sortableChildren = true;
        if (desiredWidth !== undefined && desiredHeight !== undefined) {
            this.setDesiredSize(desiredWidth, desiredHeight);
        }
    }

    /**
     * If no arguments are specified, use width and height as the desiredSize.
     * Will update the debug box size as well.
     */
    setDesiredSize(width?: number, height?: number) {
        if (width === undefined || height === undefined) {
            this.desiredSize.x = this.width;
            this.desiredSize.y = this.height;
        }
        else {
            this.desiredSize.x = width;
            this.desiredSize.y = height;
        }
        if (this._debugBox !== undefined) {
            this._debugBox.clear();
            let rect = new vbRectangle(this.desiredSize.x, this.desiredSize.y);
            this._debugBox.appendDraw(rect.fill(vb.White, 0.08).line(2, vb.Red));
        }
    }

    get pivotRule() { return this._pivotRule; }
    set pivotRule(rule: PivotTransformRule) {
        this._pivotRule = rule;
        if (rule == PivotTransformRule.TopLeft) {
            this.pivot.set(0);
        }
        else if (rule == PivotTransformRule.Center) {
            this.pivot.set(this.desiredSize.x/2, this.desiredSize.y/2);
        }
    }

    addObj(vbObj: vbGraphicObject, layer: number, name = '', style?: StyleList) {
        this.addChild(vbObj);
        vbObj.layer = layer;
        if (name != '') {
            vbObj.name = name;
        }
        if (style !== undefined) {
            vbObj.applyStyle(style[vbObj.name]);
        }
        return this;
    }

    removeObj(vbObj: vbGraphicObject) {
        this.removeChild(vbObj);
    }

    sendObjToBack(vbObj: vbGraphicObject) {
        // check if there's an object at the back
        let backObj = <vbGraphicObject>this.children.front();
        if (backObj === vbObj) return;
        if (backObj.layer == vbContainer.minLayer) {
            // move forward the current back object
            backObj.layer++;
        }
        vbObj.layer = vbContainer.minLayer;
    }

    bringObjToFront(vbObj: vbGraphicObject) {
        // check if there's an object at the front
        let frontObj = <vbGraphicObject>this.children.back();
        if (frontObj === vbObj) return;
        if (frontObj.layer == vbContainer.maxLayer) {
            // move backward the current front object
            frontObj.layer--;
        }
        vbObj.layer = vbContainer.maxLayer;
    }
    
    /**
     * Will be called when it enters any state, recursively call all containers. \
     * If there's no need for recursive call, the derived class don't have to call super.enterState.
     * @param stateType - State type enum as number
     */
    enterState(stateType: number) {
        for (let obj of this.children) {
            if (!(obj instanceof vbContainer)) continue;
            let container = <vbContainer>obj;
            container.enterState(stateType);
        }
    }

    update(deltaFrame: number) {
        this.tweens.update(getTotalMS());
        for (let obj of this.children) {
            let vbObj = <vbGraphicObject>obj;
            if (!vbObj.enable) continue;
            vbObj.update(deltaFrame);
        }
    }

    /**
     * Recursively apply style to all the children.
     */
    applyChildrenStyle(style: StyleList) {
        for (let obj of this.children) {
            let vbObj = <vbGraphicObject>obj;
            vbObj.applyStyle(style[vbObj.name]);
            if (!(vbObj instanceof vbContainer)) continue;
            let container = <vbContainer>obj;
            container.applyChildrenStyle(style);
        }
    }

    /**
     * Recursively set language to all language objects.
     */
    setLanguage(lang: string) {
        for (let obj of this.children) {
            let vbObj = <vbGraphicObject>obj;
            let langObj = getLanguageObject(vbObj);
            langObj?.setLanguage(lang);
        }
    }

    /**
     * Show a debug rectangle with desiredSize
     */
    get debugBox() {
        return (this._debugBox !== undefined) && (this._debugBox.renderable);
    }
    set debugBox(enable: boolean) {
        if (enable) {
            if (this._debugBox !== undefined) return;
            let rect = new vbRectangle(this.desiredSize.x, this.desiredSize.y);
            this._debugBox = new vbPrimitive(rect.fill(vb.White, 0.08).line(2, vb.Red));
            this.addObj(this._debugBox, vbContainer.maxLayer-1);
        }
        else {
            if (this._debugBox === undefined) return;
            this._debugBox.enable = false;
            this._debugBox.renderable = false;
        }
    }
}


/** Further use ??? */
class vbBatchContainer extends vbGraphicObjectBase(ParticleContainer) {
    
}