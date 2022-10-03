import * as PIXI from 'pixi.js';
import {
    Spine,
    SpineDebugRenderer,
    ISkeletonData as SpineData,
    SpineParser as SpineLoaderPlugin
} from 'pixi-spine';
import { vbGraphicObjectBase } from '@vb/vbGraphicObject';
import { vbgame } from '@vb/vbGame';


export { SpineData, SpineLoaderPlugin };

export class vbSpineObject extends vbGraphicObjectBase(Spine) {
    /**
     * Shared debug renderer instance, \
     * All spine objects that use this instance share the same debug options.
     */
    static debug = new SpineDebugRenderer();

    constructor(data: SpineData) {
        super(data);
        this.autoUpdate = false;
    }

    update(deltaFrame: number) {
        // Spine update function accepts seconds as parameter.
        Spine.prototype.update.call(this, vbgame.DeltaMS * 0.001);
    }

    get debug(): SpineDebugRenderer {
        return <any>super.debug;
    }
    set debug(value: SpineDebugRenderer) {
        super.debug = value;
    }

    /**
     * Construct or destruct debug renderer. \
     * If you just want to enable/disable debug drawing, use `.debug.drawDebug = true/false`
     * 
     * @param [shared] Whether the use `vbSpineObject.debug` shared instance
     */
    constructDebugRenderer(shared = true, en = true) {
        if (this.debug === undefined) {
            if (shared) {
                this.debug = vbSpineObject.debug;
            }
            else {
                this.debug = new SpineDebugRenderer();
            }
            return;
        }

        if (!en) {
            // renderer already exists, turn it off.
            (<any>this).debug = undefined;
        }
    }
}
