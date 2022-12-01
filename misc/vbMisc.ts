/**
 * Re-export all those insignificant, miscellaneous things, selectively,
 * so they can be wrapped in an additional namespace at `index.ts` for projects to use.
 */


export * from './vbUtils';
export * from './vbNumberFormat';

export type { Pos2, Size2 } from '@vb/core/vbTransform';
export type { StyleItem, StyleList, StyleTable } from '@vb/core/vbStyle';
export type { AssetList } from './vbLoader';
export type { ImageStyleItem } from '@vb/renderable/vbImage';
export type { SpineData } from '@vb/renderable/vbSpineObject';
export type {
    TextStyleItem,
    LocalizedStyleList,
    StylesTextureMap,
    LocalizationTable
} from '@vb/core/vbLocalization';
export type { InteractionFn } from '@vb/core/vbInteractive';

export * from './WebUtils';
