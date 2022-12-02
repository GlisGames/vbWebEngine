import * as PIXI from 'pixi.js';
import { AnimatedSprite, Sprite } from 'pixi.js'
import type { ImageStyleItem } from '@vb/core/vbStyle';
import { c } from '@vb/misc/vbShared';
import { vbGraphicObjectBase } from '@vb/vbGraphicObject';


export class vbImage extends vbGraphicObjectBase(Sprite) {
    /**
     * @param [texName] Name of texture in texture map.
     */
    constructor(texName?: string) {
        if (texName !== undefined)
            super(globalThis.pgame.textures[texName]);
        else
            super();
    }

    setTex(texName: string) {
        this.texture = globalThis.pgame.textures[texName];
    }

    applyStyle(item: ImageStyleItem) {
        super.applyStyle(item);
        if (item.tex !== undefined)
            this.setTex(item.tex);
    }

    static _debugLineStyle = (() => { let s = new PIXI.LineStyle();
        s.visible = true; s.color = c.Yellow; s.alpha = 1; s.width = 2; return s;
    })();
}


export class vbSequence extends vbGraphicObjectBase(AnimatedSprite) {
    /**
     * @param [seqName] Name of sequence in sequence map.
     */
    constructor(seqName: string, FPS?: number) {
        super(globalThis.pgame.sequences[seqName], false);
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
