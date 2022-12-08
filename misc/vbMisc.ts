/**
 * Re-export all those insignificant, miscellaneous things, selectively,
 * so they can be wrapped in an additional namespace at `index.ts` for projects to use.
 */


export * from './vbUtils';
export * from './vbNumberFormat';

export type { Pos2, Size2 } from '@vb/core/vbTransform';
export type { AssetList } from './vbLoader';
export type { SpineData } from '@vb/renderable/vbSpineObject';
export type {
    StyleItem,
    StyleList,
    StyleTable,
    ContainerStyleItem,
    ImageStyleItem
} from '@vb/core/vbStyle';
export type {
    TextStyleItem,
    StylesTextureMap,
    LocalizationTable
} from '@vb/core/vbLocalization';
export type { InteractionFn } from '@vb/core/vbInteraction';
export { shared } from './vbShared';

export * from './WebUtils';
