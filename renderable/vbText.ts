/** https://pixijs.io/pixi-text-style/# */
import * as PIXI from 'pixi.js';
import type { LocalizedDictionary, LocalizedTextureMap, TextStyleItem, vbLocalizedObject } from '@vb/core/vbLocalization';
import { c } from '@vb/misc/vbPreset';
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
    /** word wrap width (it's not the concept of "bounding box") */
    width?: number,
    breakWords?: boolean,
    /** align only makes sense when there're multiple lines */
    align?: PIXI.TextStyleAlign,
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
            if (item.break !== undefined) style.breakWords = item.break;
        }
        
        if (options.font !== undefined) style.fontFamily = options.font;
        if (options.size !== undefined) style.fontSize = options.size;
        if (options.weight !== undefined) style.fontWeight = options.weight;
        if (options.style !== undefined) style.fontStyle = options.style;
        if (options.breakWords !== undefined) style.breakWords = options.breakWords;
        if (options.align !== undefined) style.align = options.align;
        if (options.stroke !== undefined) style.stroke = options.stroke;
        if (options.strokeWidth !== undefined) style.strokeThickness = options.strokeWidth;

        if (options.color !== undefined) style.fill = options.color;
        else if (style.fill === undefined) style.fill = c.White;

        if (options.width !== undefined) {
            style.wordWrap = true;
            style.wordWrapWidth = options.width;
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
        if (item.break !== undefined)
            this.style.breakWords = item.break;
    }
}
