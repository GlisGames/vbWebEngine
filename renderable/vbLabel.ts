import * as PIXI from 'pixi.js';
import type { LocalizedDictionary, TextStyleItem, vbLocalizedObject } from '@vb/core/vbLocalization';
import { PivotPoint, assignPivotPoint } from '@vb/core/vbTransform';
import { c } from '@vb/misc/vbShared';
import type { vbGraphicObject } from '@vb/vbGraphicObject';
import { vbImage } from './vbImage';
import { vbMinimalContainer } from '@vb/vbContainer';
import { vbPrimitive, vbShape } from './vbPrimitive';
import { vbText } from './vbText';
import type { vbTextInitOptions } from './vbText';


/**
 * Label is based on an GraphicObject (preferably image or primitive?) with text, \
 * its localization support may change both the text and the graphic object(?). \
 * NOTE: The names of vbLabel object and its `txt` member variable should be the same
 * in order to properly get the localization.
 */
export class vbLabel<T extends vbGraphicObject> extends vbMinimalContainer implements vbLocalizedObject {
    bg: T;
    txt = {} as vbText;

    constructor(bg: T) {
        super();
        this.bg = bg;
        this.addObj(bg, 0);
    }

    get pivotRule() { return this._pivotRule; }
    set pivotRule(rule: PivotPoint) {
        this._pivotRule = rule;
        assignPivotPoint(this.pivot, rule, this.getUnscaledSize());
    }

    /**
     * Add a text object at the center of graphic object `bg`. \
     * Set vbLabel object's name by text's name.
     */
    addCenteredTxt(options: vbTextInitOptions, offsetX=0, offsetY=0) {
        this.txt = new vbText(options);
        this.centerTxt(offsetX, offsetY);
        this.addObj(this.txt, 1);
        // sync name
        this.name = this.txt.name;
    }

    centerTxt(offsetX=0, offsetY=0) {
        this.txt.pivotRule = PivotPoint.Center;
        this.txt.position.set(this.bg.width/2 + offsetX, this.bg.height/2 + offsetY);
    }

    addTxtObj(options: vbTextInitOptions) {
        if (this.txt.applyStyle !== undefined) {
            this.removeChild(this.txt);
            this.txt.destroy();
        }
        this.txt = new vbText(options);
        this.addObj(this.txt, 1);
        // sync name
        this.name = this.txt.name;
    }

    setTxt(s: string | number) {
        this.txt.text = s;
    }

    /**
     * Set the text fit box to width and height of `bg`, multiplied by ratio.
     * (Default are all infinity)
     * @param [reversed] Set `bg.height` to fit box `width`, vice versa.
     */
    setTxtFitBox(widthRatio=Infinity, heightRatio=Infinity, reversed=false) {
        if (!reversed)
            this.txt.setFitBox(this.bg.width * widthRatio, this.bg.height * heightRatio);
        else
            this.txt.setFitBox(this.bg.height * heightRatio, this.bg.width * widthRatio);
    }

    setTxtStyle(style: Partial<PIXI.ITextStyle>) {
        Object.assign(this.txt.style, style);
    }

    setTxtKey(key: string) {
        this.txt.setKey(key);
    }

    setTxtKeyFormat(key: string, ...args: (string | number)[]) {
        this.txt.setKeyFormat(key, ...args);
    }

    update(deltaFrame: number) {
        this.bg.update(deltaFrame);
        this.txt.update(deltaFrame);
    }

    localize(dict: LocalizedDictionary, item?: TextStyleItem) {
        this.txt.localize(dict, item);
    }

    protected static _debugLineStyle = (() => { let s = new PIXI.LineStyle();
        s.visible = true; s.color = c.Magneta; s.alpha = 1; s.width = 2; return s;
    })();
}


export class vbImageLabel extends vbLabel<vbImage> {
    constructor(texName: string) {
        super(new vbImage(texName));
    }
}


export class vbPrimiLabel extends vbLabel<vbPrimitive> {
    constructor(shapeData?: vbShape | vbShape[] | PIXI.GraphicsGeometry) {
        super(new vbPrimitive(shapeData));
    }
}