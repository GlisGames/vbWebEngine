import { StyleList } from '@vb/vbGraphicObject';
import * as PIXI from 'pixi.js';


export type AssetList = {
    img: string[],
    img_json: string[],
    anim_json: string[],
    style: string[]
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


/** Load all the assets we need using PIXI.Loader */
export function load_assets(loader: PIXI.Loader, assets: AssetList) {
    // temporarily hide annoying texture cache warning
    // https://www.html5gamedevs.com/topic/42438-warging-texture-added-to-the-cache-with-an-id-0-that-already-had-an-entry-when-using-spritesheetparse/
    let console_warn = console.warn;
    console.warn = () => {};
    
    return new Promise<void>((resolve) => {
        for (let filename of assets.img) {
            loader.add(filename);
        }
        for (let filename of assets.img_json) {
            loader.add(filename);
        }
        for (let filename of assets.anim_json) {
            loader.add(filename);
        }
        for (let filename of assets.style) {
            loader.add(filename);
        }

        loader.load(() => {
            // recover
            console.warn = console_warn;
            resolve();
        });
    });
}


export function get_textureMap(loader: PIXI.Loader, assets: AssetList) {
    let textureMap: { [key: string]: PIXI.Texture } = {};
    // get textures from each of the single image
    for (let filename of assets.img) {
        let filename_stripped = filename.split('/')[1];
        let tex = loader.resources[filename].texture;
        if (tex != undefined) {
            textureMap[filename_stripped] = tex;
        }
    }
    // get textures from texture atlas
    for (let filename of assets.img_json) {
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
};

/**
 * Pixi js doesn't support multi-pack spritesheet at the moement, so we have to manually rearrange
 */
export function get_multipack_sequenceMap(loader: PIXI.Loader, assets: AssetList) {
    /**
     * key: name of the sequence \
     * value: tuple, filename of a sequence frame and the corresponding texture \
     * keep the file name so they can be sorted
     */
    let sequenceMap_tmp: { [key: string]: [string, PIXI.Texture][] } = {};
    for (let filename of assets.anim_json) {
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

    let sequenceMap: { [key: string]: PIXI.Texture[] } = {};
    for (let [key, value] of Object.entries(sequenceMap_tmp)) {
        // sort based on filename
        value.sort((a, b) => { return a[0].localeCompare(b[0]); });
        // now get rid of filename, only keep textures
        sequenceMap[key] = value.map((value) => { return value[1]; });
    }
    return sequenceMap;
};


export function get_styleMap(loader: PIXI.Loader, assets: AssetList) {
    let styleMap: { [name: string]: StyleList } = {}
    for (let filename of assets.style) {
        // remove suffix
        let filename_stripped = filename.split('/')[1];
        filename_stripped = filename_stripped.split('.')[0];
        styleMap[filename_stripped] = loader.resources[filename].data;
    }
    return styleMap;
}