import * as PIXI from 'pixi.js';
import { vbGraphicObjectBase } from '@vb/vbGraphicObject';
import { vb } from '@vb/vbUtils';


/** The shape data to be passed to vbPrimitive */
export abstract class vbShape {
    shape = {} as PIXI.IShape;
    fillStyle = new PIXI.FillStyle();
    lineStyle = new PIXI.LineStyle();
    matrix?: PIXI.Matrix;

    fill(color: number, alpha = 1) {
        this.fillStyle.color = color;
        this.fillStyle.alpha = alpha;
        this.fillStyle.visible = true;
        return this;
    }

    line(width: number, color: number, alpha = 1) {
        this.lineStyle.width = width;
        this.lineStyle.color = color;
        this.lineStyle.alpha = alpha;
        // this.lineStyle.cap = PIXI.LINE_CAP.ROUND;
        this.lineStyle.visible = true;
        return this;
    }
}

export class vbRectangle extends vbShape {
    shape: PIXI.Rectangle;
    constructor(width: number, height: number, x = 0, y = 0) {
        super();
        this.shape = new PIXI.Rectangle(x, y, width, height);
    }
}

export class vbCircle extends vbShape {
    shape: PIXI.Circle;
    constructor(radius: number, x = 0, y = 0) {
        super();
        this.shape = new PIXI.Circle(x, y, radius);
    }
}

export class vbPolygon extends vbShape {
    shape: PIXI.Polygon;
    /**
     * @param [closeStroke] If set to false, it's polygonal chain instead of polygon
     * @param [points] Array of (x, y)
     */
    constructor(closeStroke: boolean, points: PIXI.Point[] | number[]) {
        super();
        this.shape = new PIXI.Polygon(points);
        this.shape.closeStroke = closeStroke;
    }
}

export class vbRoundedRectangle extends vbShape {
    shape: PIXI.RoundedRectangle;
    constructor(width: number, height: number, radius: number, x = 0, y = 0) {
        super();
        this.shape = new PIXI.RoundedRectangle(x, y, width, height, radius);
    }
}


/**
 * It works as a container of shapes.
 */
export class vbPrimitive extends vbGraphicObjectBase(PIXI.Graphics) {
    constructor(shapeData?: vbShape | vbShape[] | PIXI.GraphicsGeometry) {
        if (shapeData instanceof PIXI.GraphicsGeometry) {
            super(shapeData);
        }
        else {
            super();
            if (shapeData !== undefined) {
                this.appendDraw(shapeData);
            }
        }
    }

    /**
     * Append primitive shape on this object. \
     * If you want to reset, has to call clear() first.
     */
    appendDraw(shapeData: vbShape | vbShape[]) {
        this.clear();
        if (shapeData instanceof vbShape) {
            this.geometry.drawShape(shapeData.shape, shapeData.fillStyle, shapeData.lineStyle, shapeData.matrix);
        }
        else if (Array.isArray(shapeData)) {
            for (let s of shapeData) {
                this.geometry.drawShape(s.shape, s.fillStyle, s.lineStyle, s.matrix);
            }
        }
    }

    static _debugLineStyle = (() => { let s = new PIXI.LineStyle();
        s.visible = true; s.color = vb.Green; s.alpha = 1; s.width = 2; return s;
    })();
}