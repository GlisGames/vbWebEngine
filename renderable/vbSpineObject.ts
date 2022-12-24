
import { vbGraphicObjectBase } from '@vb/vbGraphicObject';


export class vbSpineObject {
    /**
     * Shared debug renderer instance, \
     * All spine objects that use this instance share the same debug options.
     */
    //static debug = new SpineDebugRenderer();

    constructor() {

    }

    update(deltaFrame: number) {
        // Spine update function accepts seconds as parameter.

    }

    // get debug(): SpineDebugRenderer {
    //     return <any>super.debug;
    // }
    // set debug(value: SpineDebugRenderer) {
    //     super.debug = value;
    // }

    /**
     * Construct or destruct debug renderer. \
     * If you just want to enable/disable debug drawing, use `.debug.drawDebug = true/false`
     * 
     * @param [shared] Whether the use `vbSpineObject.debug` shared instance
     */
    constructDebugRenderer(shared = true, en = true)
     {
        // if (this.debug === undefined) {
        //     if (shared) {
        //         this.debug = vbSpineObject.debug;
        //     }
        //     else {
        //         this.debug = new SpineDebugRenderer();
        //     }
        //     return;
        //}

        if (!en) {
            // renderer already exists, turn it off.
            (<any>this).debug = undefined;
        }
    }
}
