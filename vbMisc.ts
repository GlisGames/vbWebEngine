/**
 * Re-export all those insignificant, miscellaneous things, selectively,
 * so they can be wrapped in an additional namespace at `index.ts` for projects to use.
 */


export * from './misc/vbUtils';
export * from './misc/vbNumberFormat';

export { isGraphicObject, isStructuralObjects } from './vbGraphicObject';
export { isContainer } from './vbContainer';
export { isLocalizedObject } from './core/vbLocalization';

export type {
    StructuralObjects,
    StructuralObjectItem
} from './vbGraphicObject';

export {
    assignPivotPoint,
    assignPivotPointRatio,
} from './core/vbTransform';
export type { StructuralPoints } from './core/vbTransform';

export type {
    StyleItem,
    StyleList,
    StyleTable,
    ContainerStyleItem,
    ImageStyleItem
} from './core/vbStyle';
export type {
    TextStyleItem,
    TextStyleList,
    LocalizedDictionary,
    LocalizationTable
} from './core/vbLocalization';

export type { InteractionFn } from './core/vbInteraction';
export { shared } from './misc/vbShared';
export type { AssetList } from './misc/vbLoader';
export type { SpineData } from './renderable/vbSpineObject';

export * from './misc/WebUtils';
