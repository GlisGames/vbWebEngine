import * as PIXI from 'pixi.js';
import vbTweenGroup from './third-party/vbTweenGroup';
import type { ContainerStyleItem, StyleList } from './core/vbStyle';
import { type LocalizedDictionary, type TextStyleList, isLocalizedObject, type vbLocalizedObject } from './core/vbLocalization';
import { PivotPoint, type Size2, assignPivotPoint } from './core/vbTransform';
import { c } from './misc/vbShared';
import { isGraphicObject, type vbGraphicObject } from './vbGraphicObject';
import { vbGraphicObjectBase } from './vbGraphicObject';


/**
 * Bare minimum empty container that only has `addObj` method. \
 * Used for simple objects that don't need to recursively update children, tweening, apply style and localizion.
 * e.g. `vbLabel` is a bare minimum container.
 */
export class vbMinimalContainer extends vbGraphicObjectBase(PIXI.Container) {
    /**
     * @param [layer] Default is NaN (If you don't wish to change)
     * @param [name] Default is '' (If you don't wish to change)
     */
    addObj(obj: vbGraphicObject, layer=NaN, name='') {
        if (!isNaN(layer))
            obj.layer = layer;
        if (name != '')
            obj.name = name;
        this.addChild(obj);
        return this;
    }

    removeObj(obj: vbGraphicObject) {
        this.removeChild(obj);
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
 * Fully functional container that supports
 * recursively updating children, tweening, applying style and localization.
 * 
 * As is discussed at `vbGraphicObject.debugBox`, `width` and `height` can be dynamically changed, \
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
    protected _reservedChilds?: vbGraphicObject[];

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
            const rect = new PIXI.Rectangle(0, 0, this.desz.width, this.desz.height);
            const fillStyle = Object.getPrototypeOf(this).constructor._debugFillStyle;
            const lineStyle = Object.getPrototypeOf(this).constructor._debugLineStyle;
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
     * @param [layer] Default is NaN (If you don't wish to change)
     * @param [name] Default is '' (If you don't wish to change)
     * @param [reserved] Doesn't actually add into the container for display, add it into a reserve array for later use.
     *                   It's usually waited to be added by scene transition.
     */
    addObj(obj: vbGraphicObject, layer=NaN, name='', reserved=false) {
        if (!isNaN(layer))
            obj.layer = layer;
        if (name != '')
            obj.name = name;
        if (!reserved)
            this.addChild(obj);
        else {
            if (this._reservedChilds === undefined) this._reservedChilds = [];
            this._reservedChilds.push(obj);
        }
        return this;
    }

    /**
     * Try to recursively apply style and localization as well.
     * Usually it's only used during scene transition.
     */
    addObjWithConfig(obj: vbGraphicObject, styles: StyleList, textStyles?: TextStyleList) {
        const dict = globalThis.pgame.currLocale.dict;
        // try to apply style
        const item = styles[obj.name];
            if (item !== undefined)
                obj.applyStyle(styles[obj.name]);
        // try to localize
        if (isLocalizedObject(obj))
            obj.localize(dict, textStyles !== undefined ? textStyles[obj.name] : undefined);
        // try to apply recursively
        if (isContainer(obj)) {
            obj.applyChildrenStyle(styles);
            obj.localizeChildren(dict, textStyles);    
        }
        this.addChild(obj);
    }

    getReservedChildByName(name: string) {
        if (this._reservedChilds === undefined) return null;
        for (const child of this._reservedChilds) {
            if (child.name == name) return child;
        }
        return null;
    }

    sendObjToBack(obj: vbGraphicObject) {
        // check if there's an object at the back
        const backObj = <vbGraphicObject>this.children.front();
        if (backObj === obj) return;
        if (backObj.layer == vbContainer.minLayer) {
            // move forward the current back object
            backObj.layer++;
        }
        obj.layer = vbContainer.minLayer;
    }

    bringObjToFront(obj: vbGraphicObject) {
        // check if there's an object at the front
        const frontObj = <vbGraphicObject>this.children.back();
        if (frontObj === obj) return;
        if (frontObj.layer == vbContainer.maxLayer) {
            // move backward the current front object
            frontObj.layer--;
        }
        obj.layer = vbContainer.maxLayer;
    }

    update(deltaFrame: number) {
        this.tweens.update(globalThis.pgame.TotalMS);
        for (const child of this.children) {
            const vbObj = <vbGraphicObject>child;
            if (!vbObj.enable) continue;
            vbObj.update(deltaFrame);
        }
    }

    /**
     * Check if an interaction event happens inside this container.
     * Use `localBounds` to match the point.
     */
    containsInteraction(e: PIXI.InteractionEvent) {
        const p = e.data.getLocalPosition(this);
        const rect = this.getLocalBounds(undefined, true);
        return rect.contains(p.x, p.y);
    }

    /**
     * Recursively apply style to all the children.
     */
    // eslint-disable-next-line
    applyChildrenStyle(styles: StyleList) { }

    /**
     * Recursively set language to all localized objects.
     */
    // eslint-disable-next-line
    localizeChildren(dict: LocalizedDictionary, styles?: TextStyleList) { }

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

    protected _applyChildrenStyle(styles: StyleList) {
        for (const child of this.children) {
            if (!isGraphicObject(child)) continue;
            const item = styles[child.name];
            if (item !== undefined)
                child.applyStyle(item);

            if (!isContainer(child)) continue;
            child.applyChildrenStyle(styles);
        }
    }
    protected _applyNestedStyle(styles: StyleList) {
        const nestedList = styles[this.name] as StyleList;
        if (nestedList === undefined) return;
        for (const child of this.children) {
            if (!isGraphicObject(child)) continue;
            const item = nestedList[child.name];
            if (item !== undefined)
                child.applyStyle(item);

            if (!isContainer(child)) continue;
            child.applyChildrenStyle(nestedList);
        }
    }

    protected _localizeChildren(dict: LocalizedDictionary, textStyles?: TextStyleList) {
        let localize: (obj: vbLocalizedObject) => void;
        if (textStyles !== undefined)
            localize = (obj) => obj.localize(dict, textStyles[obj.name]);
        else
            localize = (obj) => obj.localize(dict);
        
        for (const child of this.children) {
            if (isLocalizedObject(child))
                localize(child);

            if (!isContainer(child)) continue;
            child.localizeChildren(dict, textStyles);
        }
    }
    protected _localizeChildrenNested(dict: LocalizedDictionary, textStyles?: TextStyleList) {
        let localize: (obj: vbLocalizedObject) => void;
        let nestedList: TextStyleList | undefined;
        if (textStyles !== undefined && textStyles[this.name] !== undefined) {
            nestedList = textStyles[this.name] as TextStyleList;
            localize = (obj) => obj.localize(dict, (<TextStyleList>nestedList)[obj.name]);
        }
        else
            localize = (obj) => obj.localize(dict);
        
        for (const child of this.children) {
            if (isLocalizedObject(child))
                localize(child);

            if (!isContainer(child)) continue;
            child.localizeChildren(dict, nestedList);
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


    static _debugFillStyle = (() => { const s = new PIXI.FillStyle();
        s.visible = true; s.color = c.White; s.alpha = 0.08; return s;
    })();
    static _debugLineStyle = (() => { const s = new PIXI.LineStyle();
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

export function isContainer(obj: PIXI.DisplayObject): obj is vbContainer {
    return (<vbContainer>obj).desz !== undefined;
}


/** Further use ??? */
class _vbBatchContainer extends vbGraphicObjectBase(PIXI.ParticleContainer) {
    
}