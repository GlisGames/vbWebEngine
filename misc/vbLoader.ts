import * as PIXI from 'pixi.js';
import type { LocalizationTable } from '@vb/core/vbLocalization';
import type { SpineData } from '@vb/renderable/vbSpineObject';
import { SpineLoaderPlugin } from '@vb/renderable/vbSpineObject';
import type { StyleTable } from '@vb/core/vbStyle';
import { WebfontLoaderPlugin } from 'pixi-webfont-loader';


export type AssetList = {
    img: string[],
    img_atlas: string[],
    anim_atlas: string[],
    spine_json: string[],
    style: string[],
    sound: string[],
    font: [string, string][],
    lang: {
        [code: string]: string
    }
}


/**
 * Load a single json
 */
export function load_json(filename: string) {
    return fetch(filename)
        .then(response => response.json());
}

/**
 * Load multiple json files
 */
export function load_jsons(filenames: string[]) {
    return Promise.all(
        filenames.map((filename: string) => {
            return fetch(filename).then(response => response.json());
        })
    );
}


// eslint-disable-next-line unused-imports/no-unused-vars
var _custom_add_assets_fn = (loader: PIXI.Loader, assets: AssetList) => {};
/**
 * Here you can write a custom function to add additional assets that loader should load, \
 * probably for project specific use.
 */
export function customLoaderAddAssets(fn: (loader: PIXI.Loader, assets: AssetList) => void) {
    _custom_add_assets_fn = fn;
}

/** Load all the assets we need using PIXI.Loader */
export function load_assets(loader: PIXI.Loader, assets: AssetList) {
    // temporarily hide annoying texture cache warning
    // https://www.html5gamedevs.com/topic/42438-warging-texture-added-to-the-cache-with-an-id-0-that-already-had-an-entry-when-using-spritesheetparse/
    let console_warn = console.warn;
    console.warn = () => {};

    loader.add(assets.img);
    loader.add(assets.img_atlas);
    loader.add(assets.anim_atlas);
    loader.add(assets.spine_json);
    loader.add(assets.style);
    for (let filename of assets.sound) {
        let filename_stripped = filename.split('/')[1];
        loader.add(filename_stripped, filename);
    }
    for (let [fontFamily, filename] of assets.font) {
        // https://developer.mozilla.org/en-US/docs/Web/API/FontFaceSet
        // check if this font has been installed
        if (document.fonts.check('16px ' + fontFamily)) continue;
        loader.add(fontFamily, filename);
    }
    for (let [code, filename] of Object.entries(assets.lang)) {
        loader.add(filename);
    }
    _custom_add_assets_fn(loader, assets);

    // Output the percentage for every resource loaded.
    loader.onLoad.add((loader: PIXI.Loader, resource: PIXI.LoaderResource) => {
        let progressPercent = loader.progress.toFixed(2).padStart(6, ' ') + '%';
        console.debug('[LOADED]', progressPercent, resource.url);
    });

    return new Promise<void>((resolve) => {
        loader.load(() => {
            // recover
            console.warn = console_warn;
            resolve();
        })
    });
}


export function get_textureMap(loader: PIXI.Loader, assets: AssetList) {
    let textureMap: { [name: string]: PIXI.Texture } = {};
    // get textures from each of the single image
    for (let filename of assets.img) {
        let filename_stripped = filename.split('/')[1];
        let tex = loader.resources[filename].texture;
        if (tex != undefined) {
            textureMap[filename_stripped] = tex;
        }
    }
    // get textures from texture atlas
    for (let filename of assets.img_atlas) {
        let sheet = loader.resources[filename].spritesheet;
        if (sheet == undefined) continue;
        // IDK why, but the type of sheet.data is incorrect,
        // it's not ISpritesheetData, it's just an object.
        // the type of frames is not Dict<ISpritesheetFrameData>, it's just an array of object
        let frames = <any[]><unknown>sheet.data.frames;
        for (let i = 0; i < frames.length; i++) {
            let frame_filename = frames[i]['filename'];
            let tex = sheet.textures[i];
            textureMap[frame_filename] = tex;
        }
    }
    return textureMap;
}

/**
 * Pixi js doesn't support multi-pack spritesheet at the moement, so we have to manually rearrange
 */
export function get_multipack_sequenceMap(loader: PIXI.Loader, assets: AssetList) {
    /**
     * key: name of the sequence \
     * value: tuple, filename of a sequence frame and the corresponding texture \
     * keep the file name so they can be sorted
     */
    let sequenceMap_tmp: { [name: string]: [string, PIXI.Texture][] } = {};
    for (let filename of assets.anim_atlas) {
        let sheet = loader.resources[filename].spritesheet;
        if (sheet == undefined) continue;
        let frames = <any[]><unknown>sheet.data.frames;
        for (let i = 0; i < frames.length; i++) {
            // filename of a frame is like 'SequenceName/SequenceName_001.png'
            let seq_filename_segs = frames[i]['filename'].split('/');
            // left side of slash
            let seq_name = seq_filename_segs[0];
            // right side of slash
            let seq_filename = seq_filename_segs[1];
            if (!(seq_name in sequenceMap_tmp)) {
                sequenceMap_tmp[seq_name] = [];
            }
            let tex = sheet.textures[i];
            sequenceMap_tmp[seq_name].push([seq_filename, tex]);
        }
    }

    let sequenceMap: { [name: string]: PIXI.Texture[] } = {};
    for (let [key, value] of Object.entries(sequenceMap_tmp)) {
        // sort based on filename
        value.sort((a, b) => { return a[0].localeCompare(b[0]); });
        // now get rid of filename, only keep textures
        sequenceMap[key] = value.map((value) => { return value[1]; });
    }
    return sequenceMap;
}


export function get_SpineMap(loader: PIXI.Loader, assets: AssetList) {
    let spineMap: { [name: string]: SpineData } = {};
    for (let filename of assets.spine_json) {
        // use the name of the subdirectory as spine's name
        let spinename = filename.split('/')[1];
        let data = loader.resources[filename].spineData;
        if (data !== undefined) {
            spineMap[spinename] = data;
        }
    }
    return spineMap;
}


export function get_styleMap(loader: PIXI.Loader, assets: AssetList) {
    let styleMap: { [name: string]: StyleTable } = {};
    for (let filename of assets.style) {
        // remove suffix
        let filename_stripped = filename.split('/')[1];
        filename_stripped = filename_stripped.split('.')[0];
        styleMap[filename_stripped] = {
            name: filename_stripped,
            list: loader.resources[filename].data
        };
    }
    return styleMap;
}


export function get_localeMap(loader: PIXI.Loader, assets: AssetList) {
    let localeMap: { [code: string]: LocalizationTable } = {};
    // create localization table
    for (let [code, filename] of Object.entries(assets.lang)) {
        let table = <Omit<LocalizationTable, "code">>loader.resources[filename].data
        localeMap[code] = {
            code: code,
            ...table
        };
    }
    return localeMap;
}


// THIS STATEMENT SHOULD NOT BE INSIDE AN ASYNC FUNCTION!!! (IDK WHY)
PIXI.extensions.add({type: 'loader', ref: WebfontLoaderPlugin, name: 'webfont'});
PIXI.extensions.add({type: 'loader', ref: SpineLoaderPlugin, name: 'spine'});
