/** https://pixijs.io/pixi-text-style/# */
import * as PIXI from 'pixi.js';
import type { LocalizationTable, TextStyleItem, vbLocalizedObject } from '@vb/core/vbLocalization';
import { c } from '@vb/misc/vbShared';
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
            style.align = item.align;
            style.breakWords = item.break;
        }
        
        style.fontFamily = options.font;
        style.fontSize = options.size;
        style.fontWeight = options.weight;
        style.fontStyle = options.style;
        style.breakWords = options.breakWords;
        style.align = options.align;
        style.stroke = options.stroke;
        style.strokeThickness = options.strokeWidth;

        if (options.color !== undefined) style.fill = options.color;
        else if (style.fill === undefined) style.fill = c.White;

        if (options.width !== undefined) {
            style.wordWrap = true;
            style.wordWrapWidth = options.width;
        }
        Object.removeUndef(style);
        return style;
    }

    static getLocalizedStyle(txt: vbText, item: TextStyleItem) {
        let style: Partial<PIXI.ITextStyle> = {};

        if (item.font !== undefined)
            style.fontFamily = item.font;
        else if (txt._useDefaultFont)
            style.fontFamily = globalThis.pgame.currLocale.defaultFont;
        style.fontSize = item.size;
        style.align = item.align;
        style.breakWords = item.break;
        Object.removeUndef(style);
        return style;
    }

    /**
     * Set text using a key in localization table. (It assumes the item is a string, not an array or map)
     */
    setKey(key: string) {
        this._key = key;
        let text = <string>globalThis.pgame.currLocale.dict[key];
        if (text !== undefined)
            this.text = text;
    }

    /**
     * Set text using a key in localization table. (It assumes the item is a string, not an array or map) \
     * Format {0}, {1}, ... to arguments.
     */
    setKeyFormat(key: string, ...args: (string | number)[]) {
        this._key = key;
        let fmtText = <string>globalThis.pgame.currLocale.dict[key];
        if (fmtText !== undefined) {
            this.text = vbText.format(fmtText, ...args);
        }
    }

    static format(fmt: string, ...args: (string | number)[]) {
        let replaceMap: { [from: string]: string | number} = {};
        for (let i = 0; i < args.length; i++) {
            replaceMap[`{${i}}`] = args[i];
        }
        return fmt.mapReplace(replaceMap);
    }

    localize(table: LocalizationTable, item?: TextStyleItem) {
        let text = <string>table.dict[this._key];
        if (text !== undefined)
            this.text = text;

        if (item === undefined) return;
        Object.assign(this.style, vbText.getLocalizedStyle(this, item));
    }

    clear() {
        this.text = '';
    }
}
