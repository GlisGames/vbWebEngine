import * as PIXI from 'pixi.js';
import { c } from '@vb/misc/vbShared';
import { vbGraphicObjectBase } from '@vb/vbGraphicObject';


/** The shape data to be passed to vbPrimitive */
export abstract class vbShape {
    shape = {} as PIXI.IShape;
    _fillStyle = new PIXI.FillStyle();
    _lineStyle = new PIXI.LineStyle();
    matrix?: PIXI.Matrix;

    fill(color: number, alpha = 1) {
        this._fillStyle.color = color;
        this._fillStyle.alpha = alpha;
        this._fillStyle.visible = true;
        return this;
    }

    line(width: number, color: number, alpha = 1) {
        this._lineStyle.width = width;
        this._lineStyle.color = color;
        this._lineStyle.alpha = alpha;
        // this.lineStyle.cap = PIXI.LINE_CAP.ROUND;
        this._lineStyle.visible = true;
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

export class vbEllipse extends vbShape {
    shape: PIXI.Ellipse;
    constructor(halfWidth: number, halfHeight: number, x = 0, y = 0) {
        super();
        this.shape = new PIXI.Ellipse(x, y, halfWidth, halfHeight);
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
        if (shapeData instanceof vbShape) {
            this.geometry.drawShape(shapeData.shape, shapeData._fillStyle, shapeData._lineStyle, shapeData.matrix);
        }
        else if (Array.isArray(shapeData)) {
            for (let s of shapeData) {
                this.geometry.drawShape(s.shape, s._fillStyle, s._lineStyle, s.matrix);
            }
        }
    }

    static _debugLineStyle = (() => { let s = new PIXI.LineStyle();
        s.visible = true; s.color = c.Green; s.alpha = 1; s.width = 2; return s;
    })();
}