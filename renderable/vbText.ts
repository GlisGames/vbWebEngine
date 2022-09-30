import * as PIXI from 'pixi.js';
import { PivotTransformRule, StyleItem, vbGraphicObject, vbGraphicObjectBase } from '@vb/vbGraphicObject';
import { vb } from '@vb/vbUtils';


export type LocalizedItem = {

}

export type LocalizedTable = {
    
}

export interface vbLocaleObject extends vbGraphicObject {
    setLocale(lang: string): void;
}

export function getLocaleObject(obj: vbGraphicObject) {
    let locObj = <vbLocaleObject>obj;
    if (locObj.setLocale !== undefined) {
        return locObj;
    }
    else return undefined;
}


export class vbText extends vbGraphicObjectBase(PIXI.Text) implements vbLocaleObject {
    constructor(fontFamily: string, fontSize: number, color?: number, text?: string) {
        let style = new PIXI.TextStyle();
        style.fontFamily = fontFamily;
        style.fontSize = fontSize;
        if (color !== undefined) style.fill = color;
        super(text, style);
    }

    applyStyle(item: StyleItem) {
        if (!super.applyStyle(item)) return false;
        
        return true;
    }

    setLocale(lang: string) {

    }
}


/**
 * Label is based on an GraphicObject with optional text.
 */
export class vbLabel<T extends vbGraphicObject> extends vbGraphicObjectBase(PIXI.Container) implements vbLocaleObject {
    bg: T;
    txt?: vbText;

    constructor(bg: T) {
        super();
        this.bg = bg;
        this.addChild(bg);
    }

    get pivotRule() { return this._pivotRule; }
    set pivotRule(rule: PivotTransformRule) {
        this._pivotRule = rule;
        if (rule == PivotTransformRule.TopLeft) {
            this.pivot.set(0);
        }
        else if (rule == PivotTransformRule.Center) {
            this.pivot.set(this.bg.width/2, this.bg.height/2);
        }
    }

    /**
     * Add a default style text object at the center of button.
     */
    addDefaultText(fontsize: number, s?: string, color = vb.White) {
        this.txt = new vbText('Arial', fontsize, color, s);
        this.txt.pivotRule = PivotTransformRule.Center;
        this.txt.position.set(this.bg.width/2, this.bg.height/2);
        this.addChild(this.txt);
    }

    addTextObj(obj: vbText) {
        this.txt = obj;
        this.addChild(this.txt);
    }

    setText(s: string) {
        if (this.txt !== undefined) this.txt.text = s;
    }

    update(deltaFrame: number) {
        this.bg.update(deltaFrame);
    }

    applyStyle(item: StyleItem) {
        if (!super.applyStyle(item)) return false;
        
        return true;
    }

    setLocale(lang: string) {

    }
}