import * as PIXI from 'pixi.js';
import { Sprite, AnimatedSprite } from 'pixi.js'
import { vbGraphicObjectBase, StyleElement } from '../vbGraphicObject';
import { vbGame } from '../vbGame';


interface ImageStyleElement extends StyleElement {
    /** texture name */
    tex?: string;
}
export class vbImage extends vbGraphicObjectBase(Sprite) {
    applyStyle(styleJson: ImageStyleElement) {
        if (!super.applyStyle(styleJson)) return false;
        if (styleJson.tex !== undefined) {
            this.texture = vbGame.textureMap[styleJson.tex];
        }
        return true;
    }
}


export class vbSequence extends vbGraphicObjectBase(AnimatedSprite) {
    /** @param textures - An array of PIXI.Texture or frame objects that make up the animation. */
    constructor(textures: PIXI.Texture[]) {
        super(textures, false);
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
}
