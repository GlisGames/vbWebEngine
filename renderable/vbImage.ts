import * as PIXI from 'pixi.js';
import { Sprite, AnimatedSprite } from 'pixi.js'
import { vbGraphicObjectBase, StyleItem } from '@vb/vbGraphicObject';
import { vbgame } from '@vb/vbGame';
import { c } from '@vb/vbMisc';


export interface ImageStyleItem extends StyleItem {
    /** texture name */
    tex?: string;
}
export class vbImage extends vbGraphicObjectBase(Sprite) {
    applyStyle(item: ImageStyleItem) {
        if (!super.applyStyle(item)) return false;
        if (item.tex !== undefined) {
            this.texture = vbgame.textures[item.tex];
        }
        return true;
    }

    static _debugLineStyle = (() => { let s = new PIXI.LineStyle();
        s.visible = true; s.color = c.Yellow; s.alpha = 1; s.width = 2; return s;
    })();
}


export class vbSequence extends vbGraphicObjectBase(AnimatedSprite) {
    /**
     * @param [textures] An array of PIXI.Texture or frame objects that make up the animation.
     */
    constructor(textures: PIXI.Texture[], FPS?: number) {
        super(textures, false);
        if (FPS !== undefined) this.FPS = FPS;
    }

    get FPS() {
        // 60 is the target FPS
        return this.animationSpeed * 60;
    }
    set FPS(fps: number) {
        this.animationSpeed = fps / 60;
    }

    update(deltaFrame: number) {
        AnimatedSprite.prototype.update.call(this, deltaFrame);
    }

    static _debugLineStyle = (() => { let s = new PIXI.LineStyle();
        s.visible = true; s.color = c.Orange; s.alpha = 1; s.width = 2; return s;
    })();
}
