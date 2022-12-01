import type * as PIXI from 'pixi.js';


export type Pos2 = { x: number, y: number };
export type Size2 = { width: number, height: number };

export enum PivotPoint {
    TopLeft,
    Center,
    TopMiddle,
    BottomMiddle,
    TopRight,
    Custom
}

export function setPivotRule(obj: PIXI.Container, rule: PivotPoint, width: number, height: number) {
    switch (rule) {
        case PivotPoint.TopLeft: {
            obj.pivot.set(0); break;
        }
        case PivotPoint.Center: {
            obj.pivot.set(width/2, height/2); break;
        }
        case PivotPoint.TopMiddle: {
            obj.pivot.set(width/2, 0); break;
        }
        case PivotPoint.BottomMiddle: {
            obj.pivot.set(width/2, height); break;
        }
        case PivotPoint.TopRight: {
            obj.pivot.set(width, 0); break;
        }
    }
}

export function setSpritePivotRule(obj: PIXI.Sprite, rule: PivotPoint) {
    switch (rule) {
        case PivotPoint.TopLeft: {
            obj.anchor.set(0); break;
        }
        case PivotPoint.Center: {
            obj.anchor.set(0.5); break;
        }
        case PivotPoint.TopMiddle: {
            obj.anchor.set(0.5, 0); break;
        }
        case PivotPoint.BottomMiddle: {
            obj.anchor.set(0.5, 1); break;
        }
        case PivotPoint.TopRight: {
            obj.anchor.set(1, 0); break;
        }
    }
}
