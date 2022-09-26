import * as PIXI from 'pixi.js';
import { vbGraphicObject } from '@vb/vbGraphicObject';
import { vbContainer } from '@vb/vbContainer';
import { vbRectangle, vbPrimitive } from './vbPrimitive';


/**
 * A simple viewport by using mask.
 */
export class vbViewport extends vbContainer {
    obj: vbGraphicObject;
    area: vbGraphicObject;

    /**
     * @param area - The area of the viewport, usually it's a primitive shape.
     *               If it's not specified, create a rectangle with the size of `obj`.
     */
    constructor(obj: vbGraphicObject, area?: vbGraphicObject) {
        if (area !== undefined) {
            super(area.width, area.height);
            this.area = area;
        }
        else {
            super(obj.width, obj.height);
            let rect = new vbRectangle(obj.width, obj.height);
            this.area = new vbPrimitive(rect.fill(0, 0.5));
        }
        this.obj = obj;
        this.addObj(this.area, 1);
        this.addObj(obj, 0);
        this.mask = this.area;
    }

    /**
     * Move "viewport" by offset,
     * actually, what it does is to move the obj towards opposite direction
     */
    moveBy(x: number, y: number) {
        this.obj.x -= x;
        this.obj.y -= y;
    }

    moveTween(name: string, toX: number, toY: number, duration: number) {
        return this.tweens.addTween(name, this.obj, {x: -toX, y: -toY}, duration);
    }

    toggleMask() {
        if (!this.mask) {
            this.mask = this.area;
        }
        else {
            this.mask = null;
        }
    }
}