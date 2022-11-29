import type { vbGraphicObject } from '@vb/vbGraphicObject';
import { vbImage } from '@vb/renderable/vbImage';
import { vbImageLabel, vbLabel, vbPrimiLabel } from './vbLabel';
import { vbInteractiveObjectBase } from '@vb/core/vbInteractive';
import { vbPrimitive } from './vbPrimitive';


const _vbImageButton = vbInteractiveObjectBase(vbImage);
export class vbImageButton extends _vbImageButton {}

const _vbImageLabelButton = vbInteractiveObjectBase(vbImageLabel);
export class vbImageLabelButton extends _vbImageLabelButton {}

const _vbPrimiButton = vbInteractiveObjectBase(vbPrimitive);
export class vbPrimiButton extends _vbPrimiButton {}

const _vbPrimiLabelButton = vbInteractiveObjectBase(vbPrimiLabel);
export class vbPrimiLabelButton extends _vbPrimiLabelButton {}


/**
 * Basically it's an interactive vbLabel. 
 */
export class vbButton<T extends vbGraphicObject> extends vbInteractiveObjectBase(vbLabel)<T> {
    
}
