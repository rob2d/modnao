export type TextureFileType =
  | 'mvc2-stage-preview'
  | 'mvc2-character-portraits'
  | 'mvc2-character-win'
  | 'polygon-mapped'
  | 'mvc2-end-file';

export const CHARACTER_PORTRAITS_REGEX_FILE = /^PL[0-9A-Z]{2}_FAC.BIN$/i;
export const MVC2_CHARACTER_WIN_REGEX_FILE = /^PL[0-9A-Z]{2}_WIN.BIN$/i;
export const POLYGON_MAPPED_TEXTURE_FILE_REGEX =
  /^(((STG|DM|DC)[0-9A-Z]{2})|EFKY)TEX(.modnao)?\.BIN$/i;
export const MVC2_STAGE_PREVIEWS_FILE_REGEX = /^SELSTG\.BIN$/i;
export const MVC2_END_FILE_REGEX = /^END(DC|NM)TEX\.BIN$/i;

const textureFileTypeMap: Record<TextureFileType, RegExp> = {
  'mvc2-character-portraits': CHARACTER_PORTRAITS_REGEX_FILE,
  'mvc2-character-win': MVC2_CHARACTER_WIN_REGEX_FILE,
  'mvc2-stage-preview': MVC2_STAGE_PREVIEWS_FILE_REGEX,
  'mvc2-end-file': MVC2_END_FILE_REGEX,
  'polygon-mapped': POLYGON_MAPPED_TEXTURE_FILE_REGEX
};

export default textureFileTypeMap;
