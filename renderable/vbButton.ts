import type { vbGraphicObject } from '@vb/vbGraphicObject';
import { vbImage } from '@vb/renderable/vbImage';
import { vbImageLabel, vbLabel, vbPrimiLabel } from './vbLabel';
import { vbInteractiveObjectBase } from '@vb/core/vbInteraction';
import { vbPrimitive } from './vbPrimitive';


export class vbImageButton extends vbInteractiveObjectBase(vbImage) {}

export class vbImageLabelButton extends vbInteractiveObjectBase(vbImageLabel) {}

export class vbPrimiButton extends vbInteractiveObjectBase(vbPrimitive) {}

export class vbPrimiLabelButton extends vbInteractiveObjectBase(vbPrimiLabel) {}


/**
 * Basically it's an interactive vbLabel. 
 */
export class vbButton<T extends vbGraphicObject> extends vbInteractiveObjectBase(vbLabel)<T> {
    
}
