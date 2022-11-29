import * as PIXI from 'pixi.js';
import type { LocalizedDictionary, LocalizedTextureMap, TextStyleItem, vbLocalizedObject } from '@vb/core/vbLocalization';
import { PivotPoint, setPivotRule } from '@vb/core/vbTransform';
import type { vbGraphicObject } from '@vb/vbGraphicObject';
import { vbGraphicObjectBase } from '@vb/vbGraphicObject';
import { vbImage } from './vbImage';
import { vbPrimitive, vbShape } from './vbPrimitive';
import { vbText } from './vbText';
import type { vbTextInitOptions } from './vbText';


/**
 * Label is based on an GraphicObject (preferably image or primitive?) with text, \
 * its localization support may change both the graphic object and the text. \
 * NOTE: The names of vbLabel object and its `txt` member variable should be the same
 * in order to properly get the localization.
 */
 export class vbLabel<T extends vbGraphicObject> extends vbGraphicObjectBase(PIXI.Container) implements vbLocalizedObject {
    bg: T;
    txt = {} as vbText;

    constructor(bg: T) {
        super();
        this.sortableChildren = true;
        this.bg = bg;
        this.bg.layer = 0;
        // this.bg.pivotRule = PivotPoint.Center;
        this.addChild(bg);
    }

    get pivotRule() { return this._pivotRule; }
    set pivotRule(rule: PivotPoint) {
        this._pivotRule = rule;
        setPivotRule(this, rule, this.bg.width, this.bg.height);
    }

    /**
     * Add a default style text object at the center of graphic object `bg`. \
     * Set vbLabel object's name by text's name.
     */
    addDefaultText(options: vbTextInitOptions) {
        this.txt = new vbText(options);
        this.txt.layer = 1;
        this.txt.pivotRule = PivotPoint.Center;
        this.txt.position.set(this.bg.width/2, this.bg.height/2);
        this.addChild(this.txt);
        // sync name
        this.name = this.txt.name;
    }

    addTextObj(obj: vbText) {
        if (this.txt !== undefined) {
            this.removeChild(this.txt);
            this.txt.destroy();
        }
        this.txt = obj;
        this.addChild(this.txt);
        // sync name
        this.name = this.txt.name;
    }

    setText(s: string) {
        this.txt.text = s;
    }

    setTextStyle(style: Partial<PIXI.ITextStyle>) {
        this.txt.style = style;
    }

    setTextKey(key: string) {
        this.txt.setKey(key);
    }

    update(deltaFrame: number) {
        this.bg.update(deltaFrame);
        this.txt.update(deltaFrame);
    }

    localize(dict: LocalizedDictionary, textures: LocalizedTextureMap, item?: TextStyleItem) {
        this.txt.localize(dict, textures, item);
    }
}


export class vbImageLabel extends vbLabel<vbImage> {
    constructor(texture: PIXI.Texture) {
        super(new vbImage(texture));
    }
}


export class vbPrimiLabel extends vbLabel<vbPrimitive> {
    constructor(shapeData?: vbShape | vbShape[] | PIXI.GraphicsGeometry) {
        super(new vbPrimitive(shapeData));
    }
}