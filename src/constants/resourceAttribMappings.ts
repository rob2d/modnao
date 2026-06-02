import type { NLUITextureDef, ResourceAttribs, TextureFileType } from '@/types';
import createTextureDef from '@/utils/textures/createTextureDef';
import cvs1MenuAttribMappings from './resource-mappings/cvs1MenuAttribMappings';
import cvs1StageAttribMappings from './resource-mappings/cvs1StageAttribMappings';
import cvs2MenuAttribMappings from './resource-mappings/cvs2MenuAttribMappings';
import mvc2EffectsAttribMappings from './resource-mappings/mvc2EffectsAttribMappings';
import mvc2StageAttribMappings from './resource-mappings/mvc2StageAttribMappings';
import cvs2StageAttribMappings from './resource-mappings/cvs2StageAttribMappings';

const mvc2PlFacStructure: Partial<NLUITextureDef>[] = [
  { width: 64, height: 64 },
  { width: 256, height: 256 },
  { width: 128, height: 128 },
  // may be omitted based on if last pointer exists
  { width: 64, height: 64 }
];

const fontTextureArgs: Partial<NLUITextureDef> = {
  width: 128,
  height: 128,
  colorFormat: 'ARGB4444',
  colorFormatValue: 2
};

type ResourceHashKey = TextureFileType | string;
const resourceAttribMappings: Record<ResourceHashKey, ResourceAttribs> = {
  ...cvs2MenuAttribMappings,
  ...cvs1MenuAttribMappings,
  ...cvs1StageAttribMappings,
  'mvc2-demo-dm0a': {
    game: 'MVC2',
    name: 'Demo Model 0A',
    identifier: '0x0A',
    resourceType: 'mvc2-menu',
    textureDefsHash: '36f24126412f66e736346801634d4ba97313bea3',
    filenamePattern: '^DM0A(.mn)?POL.BIN$',
    polygonMapped: true,
    oobReferencable: true,
    hasLzssTextureFile: true
  },
  'mvc2-demo-dm0e': {
    game: 'MVC2',
    name: 'Demo Model 0E',
    identifier: '0x0E',
    resourceType: 'mvc2-menu',
    filenamePattern: '^DM0E(.mn)?POL.BIN$',
    textureDefsHash: '36f24126412f66e736346801634d4ba97313bea3',
    polygonMapped: true,
    oobReferencable: true,
    hasLzssTextureFile: true,
    textureShapesMap: [
      createTextureDef({
        ...fontTextureArgs,
        baseLocation: 0
      })
    ]
  },
  ...mvc2EffectsAttribMappings,
  'cvs2-console-menu': {
    game: 'CVS2',
    name: 'Console Menu',
    identifier: 'DCXX',
    resourceType: 'cvs2-menu',
    filenamePattern: '^DC[0-9A-Z]{2}(E)?(.mn)?TEX.BIN$',
    polygonMapped: true,
    oobReferencable: false,
    textureFileType: 'cvs2-console-menu',
    hasLzssTextureFile: true
  },
  'vs2-stage-polygon-file': {
    game: 'VS2',
    name: 'Stage Polygon File',
    identifier: 'STXX',
    resourceType: 'vs2-stage',
    filenamePattern: '^ST(G)?(E)?[0-9A-Z]{2}(.mn)?POL.BIN$',
    polygonMapped: true,
    oobReferencable: false,
    hasLzssTextureFile: false
  },
  'vs2-stage-file': {
    game: 'VS2',
    name: 'Stage Texture File',
    identifier: 'STXX',
    resourceType: 'vs2-stage',
    filenamePattern: '^ST(G)?(E)?[0-9A-Z]{2}TEX(.mn)?.BIN$',
    polygonMapped: true,
    oobReferencable: false,
    textureFileType: 'vs2-stage-file',
    hasLzssTextureFile: false
  },
  ...mvc2StageAttribMappings,
  ...cvs2StageAttribMappings,
  'vs2-demo-model': {
    game: 'VS2',
    name: 'Demo Model Texture File (unspecified)',
    identifier: 'DMXX',
    resourceType: 'vs2-demo',
    filenamePattern: '^DM[0-9A-Z]{2}(E)?TEX(.mn)?.BIN$',
    polygonMapped: true,
    oobReferencable: true,
    textureFileType: 'vs2-demo-model',
    hasLzssTextureFile: false
  },
  'vs2-demo-polygon-file': {
    game: 'VS2',
    name: 'Demo Model Polygon File (unspecified)',
    identifier: 'DMXX',
    resourceType: 'vs2-demo',
    filenamePattern: '^DM[0-9A-Z]{2}(E)?(.mn)?POL.BIN$',
    polygonMapped: true,
    oobReferencable: true,
    hasLzssTextureFile: false
  },
  'mvc2-stage-preview': {
    game: 'MVC2',
    name: 'Stage Previews',
    identifier: 'SELSTG',
    resourceType: 'mvc2-menu',
    filenamePattern: '^SELSTG(.mn)?.BIN$',
    polygonMapped: false,
    oobReferencable: false,
    textureFileType: 'mvc2-stage-preview',
    hasLzssTextureFile: true,
    textureShapesMap: [
      ...[...Array(18).keys()].map((i) =>
        createTextureDef({
          width: 128,
          height: 128,
          colorFormat: 'RGB565',
          colorFormatValue: 1,
          baseLocation: i * 128 * 128 * 2,
          displayedAspectRatio: 1.33
        })
      ),
      createTextureDef({
        width: 64,
        height: 64,
        colorFormat: 'ARGB4444',
        colorFormatValue: 2,
        baseLocation: 18 * 128 * 128 * 2,
        displayedAspectRatio: 1.33
      })
    ]
  },
  'mvc2-character-portraits': {
    game: 'MVC2',
    name: 'Character Portraits',
    identifier: 'PLXXFAC',
    resourceType: 'mvc2-menu',
    filenamePattern: '^PL[0-9A-Z]{2}_FAC(.mn)?.BIN$',
    polygonMapped: false,
    oobReferencable: true,
    textureFileType: 'mvc2-character-portraits',
    hasLzssTextureFile: false,
    textureShapesMap: mvc2PlFacStructure.map((t, i) =>
      createTextureDef({
        ...t,
        colorFormat: 'RGB565',
        colorFormatValue: 1,
        baseLocation: 0,
        displayedAspectRatio: {
          0: undefined,
          1: 0.6,
          2: undefined,
          3: undefined
        }[i]
      })
    )
  },
  'mvc2-selection-textures': {
    game: 'MVC2',
    name: 'Selection Textures',
    identifier: 'SELTEX',
    resourceType: 'mvc2-menu',
    filenamePattern: '^SELTEX(.mn)?.BIN$',
    polygonMapped: false,
    oobReferencable: true,
    textureFileType: 'mvc2-selection-textures',
    hasLzssTextureFile: false,
    textureShapesMap: [...Array(23).keys()].map((i) =>
      createTextureDef({ baseLocation: 256 * 256 * 2 * i })
    )
  },
  'mvc2-selection-vmu-jp': {
    game: 'MVC2',
    name: 'VMU Japanese Selection Texture',
    identifier: 'SELVMJ',
    resourceType: 'mvc2-menu',
    filenamePattern: '^SELVMJ(.mn)?.BIN',
    polygonMapped: false,
    oobReferencable: false,
    textureFileType: 'mvc2-selection-vmu-jp',
    hasLzssTextureFile: false,
    textureShapesMap: [
      createTextureDef({
        colorFormat: 'ARGB1555',
        colorFormatValue: 0
      })
    ]
  },
  'mvc2-selection-vmu-us': {
    game: 'MVC2',
    name: 'VMU US Selection Texture',
    identifier: 'SELVMU',
    resourceType: 'mvc2-menu',
    filenamePattern: '^SELVMU(.mn)?.BIN',
    polygonMapped: false,
    oobReferencable: false,
    textureFileType: 'mvc2-selection-vmu-us',
    hasLzssTextureFile: false,
    textureShapesMap: [
      createTextureDef({
        colorFormat: 'ARGB1555',
        colorFormatValue: 0
      })
    ]
  },
  'mvc2-font-file': {
    game: 'MVC2',
    name: 'Font Textures',
    identifier: 'FONT',
    resourceType: 'mvc2-menu',
    filenamePattern: '^FONT(.mn)?.BIN',
    polygonMapped: false,
    oobReferencable: false,
    textureFileType: 'mvc2-font-file',
    hasLzssTextureFile: false,
    textureShapesMap: [
      createTextureDef({
        width: 256,
        height: 128,
        colorFormat: 'ARGB1555',
        colorFormatValue: 0,
        type: 13,
        baseLocation: 0x40
      }),
      createTextureDef({
        width: 64,
        height: 64,
        colorFormat: 'ARGB4444',
        colorFormatValue: 2,
        type: 1,
        baseLocation: 0x10040
      })
    ]
  },
  'mvc2-end-file': {
    game: 'MVC2',
    name: 'Ending Sequence Images',
    identifier: 'ENDTEX',
    resourceType: 'mvc2-menu',
    filenamePattern: '^END(DC|NM)TEX(.mn)?.BIN$',
    polygonMapped: false,
    oobReferencable: false,
    textureFileType: 'mvc2-end-file',
    hasLzssTextureFile: true,
    textureShapesMap: [
      ...[...Array(16).keys()].map((i) =>
        createTextureDef({
          width: 256,
          height: 256,
          colorFormat: 'RGB565',
          colorFormatValue: 1,
          baseLocation: i * 256 * 256 * 2
        })
      ),
      createTextureDef({
        ...fontTextureArgs,
        baseLocation: 256 * 256 * 16 * 2
      }),
      createTextureDef({
        ...fontTextureArgs,
        baseLocation: 256 * 256 * 16 * 2 + 128 * 128 * 2
      })
    ]
  },
  'mvc2-character-win': {
    game: 'MVC2',
    name: 'Character Win Portraits',
    identifier: 'PLXXWIN',
    resourceType: 'mvc2-menu',
    filenamePattern: '^PL[0-9A-Z]{2}_WIN(.mn)?.BIN$',
    polygonMapped: false,
    oobReferencable: true,
    textureFileType: 'mvc2-character-win',
    hasLzssTextureFile: true,
    textureShapesMap: [
      createTextureDef({
        width: 256,
        height: 256,
        colorFormat: 'ARGB4444',
        colorFormatValue: 2,
        displayedAspectRatio: 1.33
      })
    ]
  }
} as const;

export default resourceAttribMappings;
