import * as PIXI from 'pixi.js';
import { Container, ParticleContainer } from 'pixi.js';
import { PivotPoint, vbGraphicObject, vbGraphicObjectBase, StyleList, setPivotRule, StyleItem } from './vbGraphicObject'
import { vbgame } from './vbGame';
import { vbTweenMap } from './vbTween';
import { c } from './vbMisc';
import { getLocalizedObject, LocalizationList } from './renderable/vbText';


/**
 * As is discussed before ( @see vbGraphicObject.debugBox ), `width` and `height` can be dynamically changed, \
 * So a `desiredSize` will better help with designing the layout, setting the pivot point etc.
 */
export class vbContainer extends vbGraphicObjectBase(Container) {
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
     * Will redraw the debug box size as well.
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
    set pivotRule(rule: PivotPoint) {
        this._pivotRule = rule;
        setPivotRule(this, rule, this.desiredSize.x, this.desiredSize.y);
    }

    addObj(vbObj: vbGraphicObject, layer: number, name = '', useStyle = false) {
        this.addChild(vbObj);
        vbObj.layer = layer;
        if (name != '') {
            vbObj.name = name;
        }
        if (useStyle) {
            let style = vbgame.currentStyle;
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
     * @param [stateType] State type enum as number
     */
    enterState(stateType: number) {
        for (let obj of this.children) {
            if (!(obj instanceof vbContainer)) continue;
            let container = <vbContainer>obj;
            container.enterState(stateType);
        }
    }

    update(deltaFrame: number) {
        this.tweens.update(vbgame.TotalMS);
        for (let obj of this.children) {
            let vbObj = <vbGraphicObject>obj;
            if (!vbObj.enable) continue;
            vbObj.update(deltaFrame);
        }
    }

    applyStyle(item?: StyleItem) {
        if (item === undefined) return false;
        this.x = item.xy[0];
        this.y = item.xy[1];
        if (item.s !== undefined) {
            this.scale.set(item.s);
        }
        if (item.wh !== undefined) {
            this.desiredSize.x = item.wh[0];
            this.desiredSize.y = item.wh[1];
            this.setDesiredSize();
        }
        return true;
    }

    /**
     * Recursively apply style to all the children.
     */
    applyChildrenStyle(style: StyleList) {
        for (let obj of this.children) {
            let vbObj = <vbGraphicObject>obj;
            if (vbObj.applyStyle === undefined) continue;
            vbObj.applyStyle(style[vbObj.name]);
            if (!(vbObj instanceof vbContainer)) continue;
            let container = <vbContainer>obj;
            container.applyChildrenStyle(style);
        }
    }

    /**
     * Recursively set language to all language objects.
     */
    localizeChildren(dictionary: LocalizationList) {
        for (let obj of this.children) {
            if (obj instanceof vbContainer) {
                let container = <vbContainer>obj;
                container.localizeChildren(dictionary);
            }
            else {
                let locObj = getLocalizedObject(<vbGraphicObject>obj);
                locObj?.localize(dictionary[locObj.name]);
            }
        }
    }

    static _debugFillStyle = (() => { let s = new PIXI.FillStyle();
        s.visible = true; s.color = c.White; s.alpha = 0.08; return s;
    })();
    static _debugLineStyle = (() => { let s = new PIXI.LineStyle();
        s.visible = true; s.color = c.Red; s.alpha = 1; s.width = 2; return s;
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