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
export type LocalizedStyleList = {
    [name: string]: TextStyleItem
}

/** Each key name maps a text string */
type LocalizedDictionary = {
    [key: string]: string
}

/** Sometimes it may need a list? */
type LocalizedDictList = {
    [key: string]: string[]
}

/** Sometimes it may even need a map?? */
type LocalizedDictMap = {
    [key: string]: {
        [key: string]: string
    }
}

/**
 * For localized image, each key name maps a texture,
 * but sometimes different styles (landscape, portrait etc) may also have different 
 */
export type StylesTextureMap = {
    [styleName: string]: string
}

/** Each key name maps a (or more) texture name */
type LocalizedTextureMap = {
    [key: string]: string | StylesTextureMap
}

export type LocalizationTable = {
    /** abbrev of locale (en, fr, etc.), specified in assets-list.json */
    code: string,
    /** full name of locale */
    name: string,
    /** default font family for this locale */
    defaultFont: string | string[],

    dict: LocalizedDictionary,
    dictList: LocalizedDictList,
    dictMap: LocalizedDictMap,
    textures: LocalizedTextureMap,
    styles: LocalizedStyleList
}

export interface vbLocalizedObject extends vbGraphicObject {
    /**
     * Apply localization with a given item.
     * @note [Can be used for type check]
     * 
     * @param [table] current localization table
     * @param [item] Only vbText has this?
     */
    localize(table: LocalizationTable, item?: TextStyleItem): void;
} 
