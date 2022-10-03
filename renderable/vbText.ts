/** https://pixijs.io/pixi-text-style/# */
import * as PIXI from 'pixi.js';
import { PivotPoint, setPivotRule, StyleItem, vbGraphicObject, vbGraphicObjectBase } from '@vb/vbGraphicObject';
import { vbgame } from '@vb/vbGame';
import { c } from '@vb/vbMisc';


export type LocalizedItem = {
    /** text */
    s: string,
    /** font family */
    font?: string | string[],
    /** font size */
    size?: number
}

export type LocalizationList = {
    /** name of vbLocaleObject */
    [name: string]: LocalizedItem
}

export type LocalizationTable = {
    /** abbrev of locale (en, fr, etc.) */
    code: string,
    /** full name of locale */
    name: string,
    /** default font family for this locale */
    defaultFont: string | string[],
    list: LocalizationList
}

export interface vbLocalizedObject extends vbGraphicObject {
    /**
     * Apply localization with a given item.
     * 
     * @return if `item` is undefined, return false
     */
    localize(item?: LocalizedItem): boolean;
} 

export function getLocalizedObject(obj: vbGraphicObject) {
    let locObj = <vbLocalizedObject>obj;
    if (locObj.localize !== undefined) {
        return locObj;
    }
    else return undefined;
}


/**
 * Options while constructing vbText. \
 * If the font family is empty string '' or it's not specified,
 * will use the default font of current locale.
 */
export type vbTextInitOptions = {
    text?: string,
    /** font family */
    font?: string | string[],
    /** font size */
    size?: number,
    /** If not specified, default color is white. */
    color?: number,
    /** If it's specified, also set `wordWrap` and `breakWords` to true */
    wordWrapWidth?: number,
    /** stroke (outline) color */
    stroke?: number,
    /** stroke (outline) thickness */
    strokeWidth?: number,
    /**
     * If specified the key name from `LocalizationList`,
     * use it to set the text, style, and name of the object. \
     * Get the localized item directly from current table and apply it,
     * So you don't have to manually configure everything.
     */
    localize?: string,
    /** other optional text style */
    add?: Partial<PIXI.ITextStyle>
}

/**
 * Text With localization support
 */
 export class vbText extends vbGraphicObjectBase(PIXI.Text) implements vbLocalizedObject {
    protected _useDefaultFont: boolean;

    constructor(options: vbTextInitOptions) {
        let name = '';
        let item: LocalizedItem | undefined;
        if (options.localize !== undefined) {
            name = options.localize;
            item = vbgame.currentLocale.list[options.localize];
        }

        let text = '';
        if (item !== undefined) {
            text = item.s;
        }
        else if (options.text !== undefined) {
            text = options.text;
        }

        let style = vbText.initStyle(options, item);
        let useDefaultFont = false;
        if ((style.fontFamily === undefined) || (style.fontFamily === '')) {
            useDefaultFont = true;
            style.fontFamily = vbgame.currentLocale.defaultFont;
        }

        super(text, style);
        this.name = name;
        this._useDefaultFont = useDefaultFont;
    }

    applyStyle(item: StyleItem) {
        if (!super.applyStyle(item)) return false;
        
        return true;
    }

    static initStyle(options: vbTextInitOptions, item?: LocalizedItem) {
        let style = options.add ? options.add : {};
        if (item !== undefined) {
            style.fontFamily = item.font;
            style.fontSize = item.size;
        }
        if (options.font !== undefined) style.fontFamily = options.font;
        if (options.size !== undefined) style.fontSize = options.size;
        if (options.color !== undefined) style.fill = options.color;
        else if (style.fill === undefined) style.fill = c.White;
        if (options.wordWrapWidth !== undefined) {
            style.wordWrap = true;
            style.breakWords = true;
            style.wordWrapWidth = options.wordWrapWidth;
        }
        if (options.stroke !== undefined) style.stroke = options.stroke;
        if (options.strokeWidth !== undefined) style.strokeThickness = options.strokeWidth;
        return style;
    }

    localize(item?: LocalizedItem) {
        if (item === undefined) return false;
        this.text = item.s;
        if (item.font !== undefined) {
            this.style.fontFamily = item.font;
        }
        else if (this._useDefaultFont) {
            this.style.fontFamily = vbgame.currentLocale.defaultFont;
        }
        if (item.size !== undefined) {
            this.style.fontSize = item.size;
        }
        return true;
    }
}


/**
 * Label is based on an GraphicObject with optional text, \
 * its localization support may change both the graphic object and the text. \
 * NOTE: The names of vbLabel object and its `txt` member variable should be the same
 * in order to properly get the localization.
 */
export class vbLabel<T extends vbGraphicObject> extends vbGraphicObjectBase(PIXI.Container) implements vbLocalizedObject {
    bg: T;
    txt?: vbText;

    constructor(bg: T) {
        super();
        this.bg = bg;
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
        this.txt.pivotRule = PivotPoint.Center;
        this.txt.position.set(this.bg.width/2, this.bg.height/2);
        this.addChild(this.txt);
        this.name = this.txt.name;
    }

    addTextObj(obj: vbText) {
        if (this.txt !== undefined) {
            this.removeChild(this.txt);
            this.txt.destroy();
        }
        this.txt = obj;
        this.addChild(this.txt);
    }

    setText(s: string) {
        if (this.txt !== undefined) this.txt.text = s;
    }

    setTextStyle(style: Partial<PIXI.ITextStyle>) {
        if (this.txt !== undefined) this.txt.style = style;
    }

    update(deltaFrame: number) {
        this.bg.update(deltaFrame);
    }

    applyStyle(item: StyleItem) {
        if (!super.applyStyle(item)) return false;
        
        return true;
    }

    localize(item?: LocalizedItem) {
        if (this.txt === undefined) return false;
        return this.txt.localize(item);
    }
}