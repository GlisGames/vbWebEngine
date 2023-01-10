import * as PIXI from 'pixi.js';
import vbTweenGroup from './third-party/vbTweenGroup';
import type { ContainerStyleItem, StyleList } from './core/vbStyle';
import type { LocalizedDictionary, TextStyleList, vbLocalizedObject } from './core/vbLocalization';
import { PivotPoint, type Size2, assignPivotPoint } from './core/vbTransform';
import { c } from './misc/vbShared';
import type { vbGraphicObject } from './vbGraphicObject';
import { vbGraphicObjectBase } from './vbGraphicObject';


/**
 * Bare minimum empty container that only has `addObj` method,
 * used for simple objects that don't need to recursive apply style or localization to children.
 */
export class vbMinimalContainer extends vbGraphicObjectBase(PIXI.Container) {
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

    removeObj(vbObj: vbGraphicObject) {
        this.removeChild(vbObj);
    }

    /**
     * Since `width` and `height` can be different when there are changes on children,
     * and bare minimum container doesn't have a desired size, \
     * we need to refresh the pivot point with new size.
     */
    refreshPivotPoint() {
        this.pivotRule = this._pivotRule;
    }
}

/**
 * Recursively update children, apply style and localize.
 * 
 * As is discussed at @see vbGraphicObject.debugBox, `width` and `height` can be dynamically changed, \
 * So a `desiredSize` will better help with designing the layout, setting the pivot point etc.
 */
export class vbContainer extends vbMinimalContainer {
    /** "Send to Back" layer */
    static readonly minLayer = -9999;
    /** "Bring to Front" layer */
    static readonly maxLayer = 9999;

    tweens = new vbTweenGroup();
    /**
     * Desired size
     * @note [Can be used for type check]
     */
    desz: Size2 = { width:0, height:0 };

    constructor(desiredWidth?: number, desiredHeight?: number) {
        super();
        this.sortableChildren = true;
        if (desiredWidth !== undefined && desiredHeight !== undefined) {
            this.setDesiredSize(desiredWidth, desiredHeight);
        }
        this.isNestedStyle = false;
    }

    /**
     * If no arguments are specified, use width and height as the desiredSize.
     * Will redraw the debug box size as well.
     */
    setDesiredSize(width?: number, height?: number) {
        if (width === undefined || height === undefined) {
            this.desz.width = this.width;
            this.desz.height = this.height;
        }
        else {
            this.desz.width = width;
            this.desz.height = height;
        }
        assignPivotPoint(this.pivot, this._pivotRule, this.desz);
        // If there's a debugBox, redraw with new size
        if (this._debugBox !== undefined) {
            let rect = new PIXI.Rectangle(0, 0, this.desz.width, this.desz.height);
            let fillStyle = Object.getPrototypeOf(this).constructor._debugFillStyle;
            let lineStyle = Object.getPrototypeOf(this).constructor._debugLineStyle;
            this._debugBox.clear();
            this._debugBox.geometry.drawShape(rect, fillStyle, lineStyle);
        }
    }

    get pivotRule() { return this._pivotRule; }
    set pivotRule(rule: PivotPoint) {
        this._pivotRule = rule;
        assignPivotPoint(this.pivot, rule, this.desz);
    }

    /**
     * Try to recursively apply style and localization as well.
     * Usually it's only used when adding objects to root container. @see `vbSceneTransition`
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
            locObj.localize(table.dict, table.styles[locObj.name]);
        // try to apply recursively
        let container = <vbContainer>vbObj;
        if (container.desz !== undefined) {
            container.applyChildrenStyle(style);
            container.localizeChildren(table.dict, table.styles);
        }
        this.addChild(vbObj);
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
     * Recursively apply style to all the children.
     */
    // eslint-disable-next-line
    applyChildrenStyle(style: StyleList) { }

    /**
     * Recursively set language to all localized objects.
     */
    // eslint-disable-next-line
    localizeChildren(dict: LocalizedDictionary, styles: TextStyleList) { }

    /**
     * Style item of a container can also be nested style list
     */
    get isNestedStyle() {
        return this.applyChildrenStyle === this._applyNestedStyle;
    }
    set isNestedStyle(en: boolean) {
        if (en) {
            this.applyChildrenStyle = this._applyNestedStyle;
            this.localizeChildren = this._localizeChildren;
        }
        else {
            this.applyChildrenStyle = this._applyChildrenStyle;
            this.localizeChildren = this._localizeChildrenNested;
        }
    }

    protected _applyChildrenStyle(style: StyleList) {
        for (let obj of this.children) {
            let vbObj = <vbGraphicObject>obj;
            if (vbObj.applyStyle === undefined) continue;

            let item = style[vbObj.name];
            if (item !== undefined)
                vbObj.applyStyle(item);

            let container = <vbContainer>obj;
            if (container.desz === undefined) continue;
            container.applyChildrenStyle(style);
        }
    }
    protected _applyNestedStyle(style: StyleList) {
        const nestedList = <StyleList>style[this.name];
        if (nestedList === undefined) return;
        for (let obj of this.children) {
            let vbObj = <vbGraphicObject>obj;
            if (vbObj.applyStyle === undefined) continue;

            let item = nestedList[vbObj.name];
            if (item !== undefined)
                vbObj.applyStyle(item);

            let container = <vbContainer>obj;
            if (container.desz === undefined) continue;
            container.applyChildrenStyle(nestedList);
        }
    }

    protected _localizeChildren(dict: LocalizedDictionary, styles: TextStyleList) {
        for (let obj of this.children) {
            let locObj = <vbLocalizedObject>obj;
            if (locObj.localize !== undefined)
                locObj.localize(dict, styles[locObj.name]);

            let container = <vbContainer>obj;
            if (container.desz === undefined) continue;
            container.localizeChildren(dict, styles);
        }
    }
    protected _localizeChildrenNested(dict: LocalizedDictionary, styles: TextStyleList) {
        let nestedList = <TextStyleList>styles[this.name];
        if (nestedList === undefined) nestedList = {};
        for (let obj of this.children) {
            let locObj = <vbLocalizedObject>obj;
            if (locObj.localize !== undefined)
                locObj.localize(dict, nestedList[locObj.name]);

            let container = <vbContainer>obj;
            if (container.desz === undefined) continue;
            container.localizeChildren(dict, nestedList);
        }
    }

    applyStyle(item: ContainerStyleItem) {
        super.applyStyle(item);
        if (item.dwh !== undefined) {
            this.desz.width = item.dwh[0];
            this.desz.height = item.dwh[1];
            this.setDesiredSize();
        }
    }


    static _debugFillStyle = (() => { let s = new PIXI.FillStyle();
        s.visible = true; s.color = c.White; s.alpha = 0.08; return s;
    })();
    static _debugLineStyle = (() => { let s = new PIXI.LineStyle();
        s.visible = true; s.color = c.Red; s.alpha = 1; s.width = 2.5; return s;
    })();
    /**
     * Show a debug rectangle with desiredSize
     */
    get debugBox() {
        return (this._debugBox !== undefined) && (this._debugBox.visible);
    }
    set debugBox(enable: boolean) {
        this._showDebugBox(enable, this.desz);
    }
}


/** Further use ??? */
class _vbBatchContainer extends vbGraphicObjectBase(PIXI.ParticleContainer) {
    
}