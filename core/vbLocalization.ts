import type * as PIXI from 'pixi.js';
import type { vbGraphicObject } from '@vb/vbGraphicObject';


/** Each text style is assigned to a vbLocalizedObject */
export type TextStyleItem = {
    /** font family */
    font?: string | string[],
    /** font size */
    size?: number
    /** (maybe) right align for Arabic?  */
    align?: PIXI.TextStyleAlign,
    /** (maybe) break words for CJK language? */
    break?: boolean
}

/** Each name of vbLocalizedObject maps a text style item */
export type TextStyleList = {
    [name: string]: TextStyleItem
}

/**
 * Each key name maps a text string. \
 * Sometimes it may be a list or map depends on the need.
 * Note that method `vbText.setKey` assumes it is a string, rather than other types. \
 * For localized image, each key name maps a texture,
 * sometimes different styles (landscape, portrait etc) may also have different textures
 */
export type LocalizedDictionary = {
    [key: string]:
        string
        | string[]
        | { [subKey: string]: string }
}


export type LocalizationTable = {
    /** abbrev of locale (en, fr, etc.), specified in assets-list.json */
    code: string,
    /** full name of locale */
    name: string,
    /** default font family for this locale */
    defaultFont: string | string[],

    dict: LocalizedDictionary,
    styles: TextStyleList
}

export interface vbLocalizedObject extends vbGraphicObject {
    /**
     * Apply localization with a given item.
     * @note [Can be used for type check]
     * 
     * @param [dict] current localization dictionary
     * @param [item] Only vbText has this?
     */
    localize(dict: LocalizedDictionary, item?: TextStyleItem): void;
} 
