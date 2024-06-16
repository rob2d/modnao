export type TextureFileType =
  | 'mvc2-stage-preview'
  | 'mvc2-character-portraits'
  | 'mvc2-character-win'
  | 'mvc2-selection-textures'
  // polygon-mapped variants
  | 'polygon-mapped'
  | 'cvs2-console-menu-file'
  | 'mvc2-special-effects'
  | 'mvc2-end-file'
  | 'vs2-stage-file'
  | 'vs2-menu-file';

/*
 * @TODO: merge interface for mapping structure for bespoke
 * file sectioning to these defs so that things are more
 * centralized/declarative
 */
export type TextureFileMeta = {
  polygonMapped: boolean;
  regexp: RegExp;
};

export const CHARACTER_PORTRAITS = /^PL[0-9A-Z]{2}_FAC(.mn)?.BIN$/i;
export const MVC2_CHARACTER_WIN = /^PL[0-9A-Z]{2}_WIN(.mn)?.BIN$/i;
export const POLYGON_MAPPED_TEXTURE =
  /^(((((ST(G)?(E)?|DM(E?))[0-9A-Z]{2})|EFKY))|(DC[0-9A-Z]{2}(E)?))TEX(.mn)?.BIN$/;
export const VS2_MENU_FILE = /^((DM[0-9A-Z]{2}(E)?))TEX(.mn)?.BIN$/i;
export const CVS2_CONSOLE_MENU_FILE = /^((DC[0-9A-Z]{2}(E)?))TEX(.mn)?.BIN$/i;
export const VS2_STAGE_FILE = /^((((ST(G)?(E)?)[0-9A-Z]{2})))TEX(.mn)?.BIN$/i;
export const MVC2_STAGE_PREVIEWS = /^SELSTG(.mn)?.BIN$/i;
export const MVC2_SELECTION_TEXTURES = /^SELTEX(.mn)?.BIN$/i;
export const MVC2_END_ART = /^END(DC|NM)TEX(.mn)?.BIN$/i;
export const MVC2_SPECIAL_EFFECTS = /^EFKYTEX(.mn)?.BIN$/i;

/**
 * @TODO infer polygon-mapped
 * mode from subgroup of variants
 */
const textureFileTypeMap: Record<TextureFileType, RegExp> = {
  'mvc2-character-portraits': CHARACTER_PORTRAITS,
  'mvc2-character-win': MVC2_CHARACTER_WIN,
  'mvc2-selection-textures': MVC2_SELECTION_TEXTURES,
  'mvc2-stage-preview': MVC2_STAGE_PREVIEWS,
  'mvc2-special-effects': MVC2_SPECIAL_EFFECTS,
  'mvc2-end-file': MVC2_END_ART,
  'vs2-stage-file': VS2_STAGE_FILE,
  'vs2-menu-file': VS2_MENU_FILE,
  'cvs2-console-menu-file': CVS2_CONSOLE_MENU_FILE,
  'polygon-mapped': POLYGON_MAPPED_TEXTURE
};

export default textureFileTypeMap;
