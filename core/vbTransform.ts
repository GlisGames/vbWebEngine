import type * as PIXI from 'pixi.js';


/**
 * Point. Refers to any object that contains `x` and `y` properties. \
 * Namely, `PIXI.ObserverablePoint`, or any object derived from `PIXI.DisplayObject`.
 * Examples can be any `vbGraphicObject`, or its properties like `position`, `scale`, etc.
 */
export type Pnt2 = { x: number, y: number };
/**
 * Refers to any object that contains `width` and `height` properties. \
 * Namely, `PIXI.Rectangle`, or any object derived from `PIXI.DisplayObject` like `vbGraphicObject`.
 */
export type Size2 = { width: number, height: number };

/** Hierarchical strcture to reference points */
export type RecursivePointStruct = { [k: string]: RecursivePointItem };
type RecursivePointItem = Pnt2 | RecursivePointStruct;


export enum PivotPoint {
    TopLeft,
    TopMiddle,
    TopRight,
    Center,
    MiddleLeft,
    MiddleRight,
    BottomLeft,
    BottomMiddle,
    BottomRight,
    Custom
}

/**
 * Calculate the x and y relative to `size` based on pivot rule, then assign them to `point`.
 * 
 * @param [point] The point to be assigned to, can be `vbGraphicObject.position`, `pivot`, `anchor`, etc.
 * @param [rule] Pivot rule
 * @param [size] An object that contains `width` and `height`
 */
export function assignPivotPoint(point: PIXI.ObservablePoint, rule: PivotPoint, size: Size2) {
    switch (rule) {
        case PivotPoint.TopLeft: {
            point.set(0); break;
        }
        case PivotPoint.TopMiddle: {
            point.set(size.width/2, 0); break;
        }
        case PivotPoint.TopRight: {
            point.set(size.width, 0); break;
        }
        case PivotPoint.Center: {
            point.set(size.width/2, size.height/2); break;
        }
        case PivotPoint.MiddleLeft: {
            point.set(0, size.height/2); break;
        }
        case PivotPoint.MiddleRight: {
            point.set(size.width, size.height/2); break;
        }
        case PivotPoint.BottomLeft: {
            point.set(0, size.height); break;
        }
        case PivotPoint.BottomMiddle: {
            point.set(size.width/2, size.height); break;
        }
        case PivotPoint.BottomRight: {
            point.set(size.width, size.height); break;
        }
    }
}

/**
 * Calculate the x and y ratio (range from 0 to 1) based on pivot rule,
 * then assign them to `point`.
 * 
 * @param [point] The point to be assigned to, can be `vbGraphicObject.position`, `pivot`, `anchor`, etc.
 * @param [rule] Pivot rule
 */
export function assignPivotPointRatio(point: PIXI.ObservablePoint, rule: PivotPoint) {
    switch (rule) {
        case PivotPoint.TopLeft: {
            point.set(0); break;
        }
        case PivotPoint.TopMiddle: {
            point.set(0.5, 0); break;
        }
        case PivotPoint.TopRight: {
            point.set(1, 0); break;
        }
        case PivotPoint.Center: {
            point.set(0.5); break;
        }
        case PivotPoint.MiddleLeft: {
            point.set(0, 0.5); break;
        }
        case PivotPoint.MiddleRight: {
            point.set(1, 0.5); break;
        }
        case PivotPoint.BottomLeft: {
            point.set(0, 1); break;
        }
        case PivotPoint.BottomMiddle: {
            point.set(0.5, 1); break;
        }
        case PivotPoint.BottomRight: {
            point.set(1, 1); break;
        }
    }
}
