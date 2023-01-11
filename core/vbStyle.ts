/** A single style element for a vbGraphicObject */
export type StyleItem = {
    /** position [x, y] */
    xy?: [number, number],
    /** scale */
    s?: number,
    /** (scaled/stretched) width and height [w, h] */
    wh?: [number, number],
    /** exit position [x, y], used solely for scene transition */
    exitXY?: [number, number],
    /** layer */
    z?: number
}

/** Each name of vbGraphicObject maps a style item  */
export type StyleList = {
    [name: string]: StyleItem
}

export type StyleTable = {
    /** specified by the filename of json */
    name: string,
    /** desired resolution */
    Resolution: [number, number],
    /** stye list of current scene */
    list: StyleList,
    scenes: {
        [sceneName: string]: StyleList
    }
}


export interface ContainerStyleItem extends StyleItem {
    /** desired size */
    dwh?: [number, number]
}

export interface ImageStyleItem extends StyleItem {
    /** texture name */
    tex?: string
}
