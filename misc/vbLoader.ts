import * as PIXI from 'pixi.js';


export type AssetList = {
    img: string[],
    anim_json: string[],
    anim_textures: string[]
}


/**
 * Load a single json
 */
export const load_json = (filename: string) => {
    return fetch(filename)
        .then(response => response.json());
}

/**
 * Load multiple json files
 */
export const load_jsons = (filenames: string[]) => {
    return Promise.all(
        filenames.map((filename: string) => {
            return fetch(filename).then(response => response.json());
        })
    );
}


export const load_textures = (loader: PIXI.Loader, assets: AssetList) => {
    // temporarily hide annoying texture cache warning
    // https://www.html5gamedevs.com/topic/42438-warging-texture-added-to-the-cache-with-an-id-0-that-already-had-an-entry-when-using-spritesheetparse/
    let console_warn = console.warn;
    console.warn = () => {};
    // load all textures;
    return new Promise<void>((resolve) => {
        for (let filename of assets.img) {
            loader.add(filename);
        }
        for (let filename of assets.anim_json) {
            loader.add(filename);
        }

        loader.load(() => {
            // recover
            console.warn = console_warn;
            resolve();
        });
    });
}


export const get_textureMap = (loader: PIXI.Loader, assets: AssetList) => {
    let textureMap: { [key: string]: PIXI.Texture } = {};
    for (let filename of assets.img) {
        let filename_stripped = filename.split('/')[1];
        let tex = loader.resources[filename].texture;
        if (tex != undefined) {
            textureMap[filename_stripped] = tex;
        }
    }
    return textureMap;
};

/**
 * Pixi js doesn't support multi-pack spritesheet at the moement, so we have to manually rearrange
 */
export const get_multipack_sequenceMap = (loader: PIXI.Loader, assets: AssetList) => {
    /**
     * key: name of the sequence \
     * value: tuple, filename of a sequence frame and the corresponding texture \
     * keep the file name so they can be sorted
     */
    let sequenceMap_tmp: { [key: string]: [string, PIXI.Texture][] } = {};
    for (let filename of assets.anim_json) {
        let sheet = loader.resources[filename].spritesheet;
        if (sheet == undefined) continue;
        // IDK why, but the type of sheet.data is incorrect,
        // it's not ISpritesheetData, it's just an object.
        // the type of frames is not Dict<ISpritesheetFrameData>, it's just an array of object
        let frames = <any[]><unknown>sheet.data.frames;
        for (let i = 0; i < frames.length; i++) {
            let seq_filename_segs = frames[i]['filename'].split('/');
            // left side of slash
            let seq_name = seq_filename_segs[0];
            // right side of slash
            let seq_filename = seq_filename_segs[1];
            if (!(seq_name in sequenceMap_tmp)) {
                sequenceMap_tmp[seq_name] = [];
            }
            let tex = sheet?.textures[i];
            if (tex != undefined) {
                sequenceMap_tmp[seq_name].push([seq_filename, tex]);
            }
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