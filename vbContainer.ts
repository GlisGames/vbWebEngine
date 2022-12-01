import * as PIXI from 'pixi.js';
import type { LocalizationTable, vbLocalizedObject } from './core/vbLocalization';
import { PivotPoint, setPivotRule } from './core/vbTransform';
import type { StyleItem, StyleList } from './core/vbStyle';
import { c } from './misc/vbPreset';
import type { vbGraphicObject } from './vbGraphicObject';
import { vbGraphicObjectBase } from './vbGraphicObject';
import { vbTweenMap } from './vbTween';


/**
 * As is discussed at @see vbGraphicObject.debugBox, `width` and `height` can be dynamically changed, \
 * So a `desiredSize` will better help with designing the layout, setting the pivot point etc.
 */
export class vbContainer extends vbGraphicObjectBase(PIXI.Container) {
    /** "Send to Back" layer */
    static readonly minLayer = -9999;
    /** "Bring to Front" layer */
    static readonly maxLayer = 9999;

    tweens = new vbTweenMap();
    /** @note [Can be used for type check] */
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
        setPivotRule(this, this._pivotRule, this.desiredSize.x, this.desiredSize.y);
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

    addObj(vbObj: vbGraphicObject, layer = NaN, name = '') {
        if (!isNaN(layer)) {
            vbObj.layer = layer;
        }
        if (name != '') {
            vbObj.name = name;
        }
        this.addChild(vbObj);
        return this;
    }

    /**
     * Try to recursively apply style and localization as well.
     * Usually it's only used when adding objects to root container.
     */
    addObjWithConfig(vbObj: vbGraphicObject) {
        let style = globalThis.pgame.currStyle.list;
        let table = globalThis.pgame.currLocale;
        // try to apply style
        let item = style[vbObj.name];
            if (item !== undefined)
                vbObj.applyStyle(style[vbObj.name]);
        // try to localize
        let locObj = <vbLocalizedObject>vbObj;
        if (locObj.localize !== undefined)
            locObj.localize(table, table.styles[locObj.name]);
        // try to apply recursively
        let container = <vbContainer>vbObj;
        if (container.desiredSize !== undefined) {
            container.applyChildrenStyle(style);
            container.localizeChildren(table);
        }
        this.addChild(vbObj);
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

    update(deltaFrame: number) {
        this.tweens.update(globalThis.pgame.TotalMS);
        for (let obj of this.children) {
            let vbObj = <vbGraphicObject>obj;
            if (!vbObj.enable) continue;
            vbObj.update(deltaFrame);
        }
    }

    /**
     * Check if an interaction event happens inside this container.
     * Use `localBounds` to match the point.
     */
    containsInteraction(e: PIXI.InteractionEvent) {
        let p = e.data.getLocalPosition(this);
        let rect = this.getLocalBounds(undefined, true);
        return rect.contains(p.x, p.y);
    }

    /**
     * Will be called when it enters any state, recursively call all containers. \
     * If there's no need for recursive call, the derived class don't have to call super.enterState.
     */
    enterState(stateName: string) {
        for (let obj of this.children) {
            let container = <vbContainer>obj;
            if (container.desiredSize === undefined) continue;
            if (!container.enable) continue;
            
            container.enterState(stateName);
        }
    }
    /**
     * Will be called when it exits any state, recursively call all containers. \
     * If there's no need for recursive call, the derived class don't have to call super.exitState.
     */
    exitState(stateName: string) {
        for (let obj of this.children) {
            let container = <vbContainer>obj;
            if (container.desiredSize === undefined) continue;
            if (!container.enable) continue;
            
            container.exitState(stateName);
        }
    }

    /**
     * Recursively apply style to all the children.
     */
    applyChildrenStyle(style: StyleList) {
        for (let obj of this.children) {
            let vbObj = <vbGraphicObject>obj;
            if (vbObj.applyStyle === undefined) continue;

            let item = style[vbObj.name];
            if (item !== undefined)
                vbObj.applyStyle(style[vbObj.name]);

            let container = <vbContainer>obj;
            if (container.desiredSize === undefined) continue;
            container.applyChildrenStyle(style);
        }
    }

    /**
     * Recursively set language to all localized objects.
     */
    localizeChildren(table: LocalizationTable) {
        for (let obj of this.children) {
            let locObj = <vbLocalizedObject>obj;
            if (locObj.localize !== undefined)
                locObj.localize(table, table.styles[locObj.name]);

            let container = <vbContainer>obj;
            if (container.desiredSize === undefined) continue;
            container.localizeChildren(table);
        }
    }

    applyStyle(item: StyleItem) {
        if (item.xy !== undefined) {
            this.x = item.xy[0];
            this.y = item.xy[1];
        }
        if (item.s !== undefined) {
            this.scale.set(item.s);
        }
        if (item.wh !== undefined) {
            this.desiredSize.x = item.wh[0];
            this.desiredSize.y = item.wh[1];
            this.setDesiredSize();
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
class vbBatchContainer extends vbGraphicObjectBase(PIXI.ParticleContainer) {
    
}