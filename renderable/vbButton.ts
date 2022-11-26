import type { vbGraphicObject } from '@vb/vbGraphicObject';
import { vbImage } from '@vb/renderable/vbImage';
import { vbImageLabel, vbLabel } from './vbLabel';
import { vbInteractiveObjectBase } from '@vb/core/vbInteractive';
import { vbPrimitive } from './vbPrimitive';


const _vbImageButton = vbInteractiveObjectBase(vbImage);
export class vbImageButton extends _vbImageButton {}

const _vbImageLabelButton = vbInteractiveObjectBase(vbImageLabel);
export class vbImageLabelButton extends _vbImageLabelButton {}

const _vbPrimitiveButton = vbInteractiveObjectBase(vbPrimitive);
export class vbPrimitiveButton extends _vbPrimitiveButton {}

/**
 * Basically it's an interactive vbLabel. 
 */
export class vbButton<T extends vbGraphicObject> extends vbInteractiveObjectBase(vbLabel)<T> {
    
}
