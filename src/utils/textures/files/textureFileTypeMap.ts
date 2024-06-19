export type TextureFileType =
  | 'mvc2-stage-preview'
  | 'mvc2-character-portraits'
  | 'mvc2-character-win'
  | 'mvc2-selection-textures'
  | 'mvc2-end-file'
  // polygon-mapped variants
  | 'cvs2-console-menu'
  | 'mvc2-special-effects'
  | 'vs2-stage-file'
  | 'vs2-demo-model';

/*
 * @TODO: merge interface for mapping structure for bespoke
 * file sectioning to these defs so that things are more
 * centralized/declarative
 */
export type TextureFileTypeMeta = {
  polygonMapped: boolean;
  regexp: RegExp;
  oobReferencable: boolean;
};

const textureFileTypeMap: Record<TextureFileType, TextureFileTypeMeta> = {
  'mvc2-character-portraits': {
    polygonMapped: false,
    regexp: /^PL[0-9A-Z]{2}_FAC(.mn)?.BIN$/i,
    oobReferencable: true
  },

  'mvc2-character-win': {
    polygonMapped: false,
    regexp: /^PL[0-9A-Z]{2}_WIN(.mn)?.BIN$/i,
    oobReferencable: true
  },

  'mvc2-selection-textures': {
    polygonMapped: false,
    regexp: /^SELTEX(.mn)?.BIN$/i,
    oobReferencable: true
  },
  'mvc2-stage-preview': {
    polygonMapped: false,
    regexp: /^SELSTG(.mn)?.BIN$/i,
    oobReferencable: false
  },
  'mvc2-special-effects': {
    polygonMapped: true,
    regexp: /^EFKYTEX(.mn)?.BIN$/i,
    oobReferencable: false
  },
  'mvc2-end-file': {
    polygonMapped: false,
    regexp: /^END(DC|NM)TEX(.mn)?.BIN$/i,
    oobReferencable: false
  },
  'vs2-stage-file': {
    polygonMapped: true,
    regexp: /^((((ST(G)?(E)?)[0-9A-Z]{2})))TEX(.mn)?.BIN$/i,
    oobReferencable: false
  },
  'vs2-demo-model': {
    polygonMapped: true,
    regexp: /^((DM[0-9A-Z]{2}(E)?))TEX(.mn)?.BIN$/i,
    oobReferencable: true
  },
  'cvs2-console-menu': {
    polygonMapped: true,
    regexp: /^((DC[0-9A-Z]{2}(E)?))TEX(.mn)?.BIN$/i,
    oobReferencable: false
  }
};

export default textureFileTypeMap;
