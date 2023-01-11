/**
 * Re-export all those insignificant, miscellaneous things, selectively,
 * so they can be wrapped in an additional namespace at `index.ts` for projects to use.
 */


export * from './misc/vbUtils';
export * from './misc/vbNumberFormat';

export type {
    RecursiveObjectStructure,
    RecursiveObjectItem
} from './vbGraphicObject';

export {
    assignPivotPoint,
    assignPivotPointRatio,
} from '@vb/core/vbTransform';
export type { RecursivePointStruct } from '@vb/core/vbTransform';

export type {
    StyleItem,
    StyleList,
    StyleTable,
    ContainerStyleItem,
    ImageStyleItem
} from '@vb/core/vbStyle';
export type {
    TextStyleItem,
    TextStyleList,
    LocalizedDictionary,
    LocalizationTable
} from '@vb/core/vbLocalization';

export type { InteractionFn } from '@vb/core/vbInteraction';
export { shared } from './misc/vbShared';
export type { AssetList } from './misc/vbLoader';
export type { SpineData } from '@vb/renderable/vbSpineObject';

export * from './misc/WebUtils';
