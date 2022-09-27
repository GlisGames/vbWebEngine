import * as PIXI from 'pixi.js';
import { Container, ParticleContainer } from 'pixi.js';
import { PivotTransformRule, vbGraphicObject, vbGraphicObjectBase, StyleList, setPivotRule } from './vbGraphicObject'
import { getTotalMS } from './vbGame';
import { vbTweenMap } from './vbTween';
import { vb } from './vbUtils'
import { getLanguageObject, vbLanguageObject } from './renderable/vbText';


/**
 * As is discussed before ( @see vbGraphicObject.debugBox ), `width` and `height` can be dynamically changed, \
 * So a `desiredSize` will better help with designing the layout, setting the pivot point etc.
 */
export class vbContainer extends vbGraphicObjectBase(Container) implements vbLanguageObject {
    /** "Send to Back" layer */
    static readonly minLayer = -9999;
    /** "Bring to Front" layer */
    static readonly maxLayer = 9999;

    tweens = new vbTweenMap();
    desiredSize = new PIXI.Point();

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
        // If there's a debugBox, redraw with new size
        if (this._debugBox !== undefined) {
            this._debugBox.clear();
            let rect = new PIXI.Rectangle(0, 0, this.desiredSize.x, this.desiredSize.y);
            let fillStyle = (<any>this.constructor)._debugFillStyle;
            let lineStyle = (<any>this.constructor)._debugLineStyle;
            this._debugBox.geometry.drawShape(rect, fillStyle, lineStyle);
        }
    }

    get pivotRule() { return this._pivotRule; }
    set pivotRule(rule: PivotTransformRule) {
        this._pivotRule = rule;
        setPivotRule(this, rule, this.desiredSize.x, this.desiredSize.y);
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

    static _debugFillStyle = (() => { let s = new PIXI.FillStyle();
        s.visible = true; s.color = vb.White; s.alpha = 0.08; return s;
    })();
    static _debugLineStyle = (() => { let s = new PIXI.LineStyle();
        s.visible = true; s.color = vb.Red; s.alpha = 1; s.width = 2; return s;
    })();
    /**
     * Show a debug rectangle with desiredSize
     */
    get debugBox() {
        return (this._debugBox !== undefined) && (this._debugBox.renderable);
    }
    set debugBox(enable: boolean) {
        this._showDebugBox(enable, this.desiredSize.x, this.desiredSize.y);
    }
}


/** Further use ??? */
class vbBatchContainer extends vbGraphicObjectBase(ParticleContainer) {
    
}