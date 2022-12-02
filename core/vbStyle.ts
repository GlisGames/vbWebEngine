/** A single style element for a vbGraphicObject */
export type StyleItem = {
    /** position [x, y] */
    xy?: [number, number],
    /** scale */
    s?: number,
    /** (scaled/stretched) width and height [w, h] */
    wh?: [number, number],
}

/** Each name of vbGraphicObject maps a style item  */
export type StyleList = {
    [name: string]: StyleItem
}

export type StyleTable = {
    /** specified by the filename of json */
    name: string,
    list: StyleList
}


export interface ContainerStyleItem extends StyleItem {
    /** desired size */
    dwh?: [number, number]
}

export interface ImageStyleItem extends StyleItem {
    /** texture name */
    tex?: string
}
