export type TextureFileType =
  | 'mvc2-stage-preview'
  | 'mvc2-character-portraits'
  | 'mvc2-character-win'
  | 'mvc2-selection-textures'
  | 'polygon-mapped'
  | 'mvc2-end-file';

export const CHARACTER_PORTRAITS = /^PL[0-9A-Z]{2}_FAC(.mn)?.BIN$/i;
export const MVC2_CHARACTER_WIN = /^PL[0-9A-Z]{2}_WIN(.mn)?.BIN$/i;
export const POLYGON_MAPPED_TEXTURE =
/^(((((STG(E)?|DM)[0-9A-Z]{2})|EFKY))|(DC[0-9A-Z]{2}(E)?))TEX(.mn)?.BIN$/
export const MVC2_STAGE_PREVIEWS = /^SELSTG(.mn)?.BIN$/i;
export const MVC2_SELECTION_TEXTURES = /^SELTEX(.mn)?.BIN$/i;
export const MVC2_END_ART = /^END(DC|NM)TEX(.mn)?.BIN$/i;

/** 
 * @TODO: provide more granularity for every type of texture
 * in terms of polygon-mapped variants, and infer polygon-mapped
 * mode from subgroup of variants
 */
const textureFileTypeMap: Record<TextureFileType, RegExp> = {
  'mvc2-character-portraits': CHARACTER_PORTRAITS,
  'mvc2-character-win': MVC2_CHARACTER_WIN,
  'mvc2-selection-textures': MVC2_SELECTION_TEXTURES,
  'mvc2-stage-preview': MVC2_STAGE_PREVIEWS,
  'mvc2-end-file': MVC2_END_ART,
  'polygon-mapped': POLYGON_MAPPED_TEXTURE
};

export default textureFileTypeMap;
