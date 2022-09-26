import * as PIXI from 'pixi.js';
import { PivotTransformRule, StyleElement, vbGraphicObject, vbGraphicObjectBase } from '@vb/vbGraphicObject';
import { vb } from '@vb/vbUtils';


export interface vbLanguageObject extends vbGraphicObject {
    setLanguage(lang: string): void;
}

export function getLanguageObject(obj: vbGraphicObject) {
    let langObj = <vbLanguageObject>obj;
    if (langObj.setLanguage !== undefined) {
        return langObj;
    }
    else return undefined;
}


export class vbText extends vbGraphicObjectBase(PIXI.Text) implements vbLanguageObject {
    constructor(fontFamily: string, fontSize: number, color?: number, text?: string) {
        let style = new PIXI.TextStyle();
        style.fontFamily = fontFamily;
        style.fontSize = fontSize;
        if (color !== undefined) style.fill = color;
        super(text, style);
    }

    applyStyle(styleJson: StyleElement) {
        if (!super.applyStyle(styleJson)) return false;
        
        return true;
    }

    setLanguage(lang: string) {

    }
}


/**
 * Label is based on an GraphicObject with optional text.
 */
export class vbLabel<T extends vbGraphicObject> extends vbGraphicObjectBase(PIXI.Container) implements vbLanguageObject {
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

    applyStyle(styleJson: StyleElement) {
        if (!super.applyStyle(styleJson)) return false;
        
        return true;
    }

    setLanguage(lang: string) {

    }
}