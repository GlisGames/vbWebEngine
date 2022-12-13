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

    reshape(..._args: unknown[]) { return this; }
    getGraphicsData() {
        // must be `cloned` so that a vbShape instance can be reused for different vbPrimitives 
        return new PIXI.GraphicsData(this.shape.clone(), this._fillStyle.clone(), this._lineStyle.clone(), this.matrix?.clone());
    }
}

export class vbRectangle extends vbShape {
    shape: PIXI.Rectangle;
    constructor(width: number, height: number, x = 0, y = 0) {
        super();
        this.shape = new PIXI.Rectangle(x, y, width, height);
    }
    reshape(width: number, height: number, x = 0, y = 0) {
        this.shape.width = width, this.shape.height = height;
        this.shape.x = x, this.shape.y = y; return this;
    }
}

export class vbCircle extends vbShape {
    shape: PIXI.Circle;
    constructor(radius: number, x = 0, y = 0) {
        super();
        this.shape = new PIXI.Circle(x, y, radius);
    }
    reshape(radius: number, x = 0, y = 0) {
        this.shape.radius = radius;
        this.shape.x = x, this.shape.y = y; return this;
    }
}

export class vbEllipse extends vbShape {
    shape: PIXI.Ellipse;
    constructor(halfWidth: number, halfHeight: number, x = 0, y = 0) {
        super();
        this.shape = new PIXI.Ellipse(x, y, halfWidth, halfHeight);
    }
    reshape(halfWidth: number, halfHeight: number, x = 0, y = 0) {
        this.shape.width = halfWidth, this.shape.height = halfHeight;
        this.shape.x = x, this.shape.y = y; return this;
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
    reshape(closeStroke: boolean, points: number[]) {
        this.shape.points = points;
        this.shape.closeStroke = closeStroke; return this;
    }
}

export class vbRoundedRectangle extends vbShape {
    shape: PIXI.RoundedRectangle;
    constructor(width: number, height: number, radius: number, x = 0, y = 0) {
        super();
        this.shape = new PIXI.RoundedRectangle(x, y, width, height, radius);
    }
    reshape(width: number, height: number, radius: number, x = 0, y = 0) {
        this.shape.width = width, this.shape.height = height;
        this.shape.radius = radius, this.shape.x = x, this.shape.y = y; return this;
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
     * If you want to reset, has to use `redraw` or call `clear` first.
     */
    appendDraw(shapeData: vbShape | vbShape[] | PIXI.GraphicsGeometry) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const geometry = <any>this.geometry;

        if (shapeData instanceof vbShape) {
            this.geometry.graphicsData.push(shapeData.getGraphicsData()); geometry.dirty++;
        }
        else if (Array.isArray(shapeData)) {
            for (const s of shapeData) {
                this.geometry.graphicsData.push(s.getGraphicsData()); geometry.dirty++;
            }
        }
        else {
            for (const data of shapeData.graphicsData) {
                this.geometry.graphicsData.push(data); geometry.dirty++;
            }
        }
    }

    redraw(shapeData: vbShape | vbShape[] | PIXI.GraphicsGeometry) {
        this.clear().appendDraw(shapeData);
    }

    static _debugLineStyle = (() => { let s = new PIXI.LineStyle();
        s.visible = true; s.color = c.Green; s.alpha = 1; s.width = 2; return s;
    })();
}