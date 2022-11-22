/** https://pixijs.io/pixi-text-style/# */
import * as PIXI from 'pixi.js';
import type { LocalizedDictionary, LocalizedTextureMap, TextStyleItem, vbLocalizedObject } from '@vb/core/vbLocalization';
import { PivotPoint, setPivotRule } from '@vb/core/vbTransform';
import { c } from '@vb/misc/vbPreset';
import type { vbGraphicObject } from '@vb/vbGraphicObject';
import { vbGraphicObjectBase } from '@vb/vbGraphicObject';


/**
 * Options while constructing vbText. \
 * If the font family is empty string '' or it's not specified,
 * will use the default font of current locale.
 */
export type vbTextInitOptions = {
    text?: string,
    /** text and key are mutually exclusive, should only pick one */
    key?: string,
    /** font family */
    font?: string | string[],
    /** font size */
    size?: number,
    /** If not specified, default color is white. */
    color?: number,
    /** font weight */
    weight?: PIXI.TextStyleFontWeight,
    /** font style */
    style?: PIXI.TextStyleFontStyle,
    /** If it's specified, also set `wordWrap` and `breakWords` to true */
    wordWrapWidth?: number,
    /** stroke (outline) color */
    stroke?: number,
    /** stroke (outline) thickness */
    strokeWidth?: number,
    /**
     * name of this vbText object \
     * Get the text style item directly from current table and apply it,
     * So you don't have to manually configure everything.
     */
    name?: string,
    /** other optional text style */
    more?: Partial<PIXI.ITextStyle>
}


/**
 * Text With localization support
 */
 export class vbText extends vbGraphicObjectBase(PIXI.Text) implements vbLocalizedObject {
    protected _key = '';
    protected _useDefaultFont: boolean;

    constructor(options: vbTextInitOptions) {
        let name = '';
        let item: TextStyleItem | undefined;
        if (options.name !== undefined) {
            name = options.name;
            item = globalThis.pgame.currLocale.styles[options.name];
        }

        let text = options.text;
        let style = vbText.initTextStyle(options, item);

        let useDefaultFont = false;
        if ((style.fontFamily === undefined) || (style.fontFamily === '')) {
            useDefaultFont = true;
            style.fontFamily = globalThis.pgame.currLocale.defaultFont;
        }

        super(text, style);
        this.name = name;
        this._useDefaultFont = useDefaultFont;
        if (options.key !== undefined)
            this.setKey(options.key);
    }

    static initTextStyle(options: vbTextInitOptions, item?: TextStyleItem) {
        let style = options.more ? options.more : {};
        if (item !== undefined) {
            style.fontFamily = item.font;
            style.fontSize = item.size;
            if (item.align !== undefined) style.align = item.align;
        }
        if (options.font !== undefined) style.fontFamily = options.font;
        if (options.size !== undefined) style.fontSize = options.size;
        if (options.weight !== undefined) style.fontWeight = options.weight;
        if (options.style !== undefined) style.fontStyle = options.style;
        if (options.stroke !== undefined) style.stroke = options.stroke;
        if (options.strokeWidth !== undefined) style.strokeThickness = options.strokeWidth;

        if (options.color !== undefined) style.fill = options.color;
        else if (style.fill === undefined) style.fill = c.White;

        if (options.wordWrapWidth !== undefined) {
            style.wordWrap = true;
            style.breakWords = true;
            style.wordWrapWidth = options.wordWrapWidth;
        }
        return style;
    }

    setKey(key: string) {
        this._key = key;
        let text = globalThis.pgame.currLocale.dict[key];
        if (text !== undefined)
            this.text = text;
    }

    /**
     * Format {0}, {1}, ... to arguments.
     */
    setKeyFormat(key: string, ...args: (string | number)[]) {
        this._key = key;
        let formatText = globalThis.pgame.currLocale.dict[key];
        if (formatText !== undefined) {
            let replaceMap: { [from: string]: string | number} = {};
            for (let i = 0; i < args.length; i++) {
                replaceMap[`{${i}}`] = args[i];
            }
            this.text = formatText.mapReplace(replaceMap);
        }
    }

    localize(dict: LocalizedDictionary, textures: LocalizedTextureMap, item?: TextStyleItem) {
        let text = dict[this._key];
        if (text !== undefined)
            this.text = text;

        if (item === undefined) return;
        if (item.font !== undefined)
            this.style.fontFamily = item.font;
        else if (this._useDefaultFont)
            this.style.fontFamily = globalThis.pgame.currLocale.defaultFont;

        if (item.size !== undefined)
            this.style.fontSize = item.size;
        if (item.align !== undefined) 
            this.style.align = item.align;
    }
}


/**
 * Label is based on an GraphicObject (preferably image or primitive?) with optional text, \
 * its localization support may change both the graphic object and the text. \
 * NOTE: The names of vbLabel object and its `txt` member variable should be the same
 * in order to properly get the localization.
 */
export class vbLabel<T extends vbGraphicObject> extends vbGraphicObjectBase(PIXI.Container) implements vbLocalizedObject {
    bg: T;
    txt?: vbText;

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
        if (this.txt !== undefined) this.txt.text = s;
    }

    setTextStyle(style: Partial<PIXI.ITextStyle>) {
        if (this.txt !== undefined) this.txt.style = style;
    }

    setTextKey(key: string) {
        this.txt?.setKey(key);
    }

    update(deltaFrame: number) {
        this.bg.update(deltaFrame);
        this.txt?.update(deltaFrame);
    }

    localize(dict: LocalizedDictionary, textures: LocalizedTextureMap, item?: TextStyleItem) {
        this.txt?.localize(dict, textures, item);
    }
}