import type { NLUITextureDef, ResourceAttribs, TextureFileType } from '@/types';
import createTextureDef from '@/utils/textures/createTextureDef';
import cvs2MenuAttribMappings from './resource-mappings/cvs2MenuAttribMappings';

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

const cvs1StageResourceAttribs = {
  game: 'CVS1Pro',
  name: 'Stage File (unspecified)',
  resourceType: 'cvs1-stage',
  polygonMapped: true,
  oobReferencable: false,
  hasLzssTextureFile: true
} satisfies Omit<ResourceAttribs, 'identifier' | 'filenamePattern'>;

const cvs1DemoResourceAttribs = {
  game: 'CVS1Pro',
  name: 'Demo Model File (unspecified)',
  resourceType: 'cvs1-demo',
  polygonMapped: true,
  oobReferencable: false,
  hasLzssTextureFile: true
} satisfies Omit<ResourceAttribs, 'identifier' | 'filenamePattern'>;

type ResourceHashKey = TextureFileType | string;
const resourceAttribMappings: Record<ResourceHashKey, ResourceAttribs> = {
  ...cvs2MenuAttribMappings,
  '6971c7f91ff9f0f83b771609451e49d7814b5388': {
    ...cvs1StageResourceAttribs,
    name: 'Stage 00/0B',
    identifier: 'STG00/STG0B',
    filenamePattern: '^STG(00|0B)(.mn)?POL.BIN$'
  },
  c914cac667b9d564479b256f378eb7bf95997ec3: {
    ...cvs1StageResourceAttribs,
    name: 'Stage 02',
    identifier: 'STG02',
    filenamePattern: '^STG02(.mn)?POL.BIN$'
  },
  '7a3438fef9b108f5e5c904c51e4b2b29d0be0bff': {
    ...cvs1StageResourceAttribs,
    name: 'Stage 04',
    identifier: 'STG04',
    filenamePattern: '^STG04(.mn)?POL.BIN$'
  },
  a3b52397da2e4011c12939fd4ff59432600434ed: {
    ...cvs1StageResourceAttribs,
    name: 'Stage 05',
    identifier: 'STG05',
    filenamePattern: '^STG05(.mn)?POL.BIN$'
  },
  '076811481292fdea66848bc344bdc9201df7df59': {
    ...cvs1StageResourceAttribs,
    name: 'Stage 07',
    identifier: 'STG07',
    filenamePattern: '^STG07(.mn)?POL.BIN$'
  },
  fd5ff139f281e7a016bb8ece18b70816d3928934: {
    ...cvs1StageResourceAttribs,
    name: 'Stage 0C',
    identifier: 'STG0C',
    filenamePattern: '^STG0C(.mn)?POL.BIN$'
  },
  '37d9fb1acd9cac80d6f786850fa6c3b4c4ca044e': {
    ...cvs1DemoResourceAttribs,
    name: 'Demo Model 00',
    identifier: 'DM00',
    filenamePattern: '^DM00(.mn)?POL.BIN$'
  },
  e26c44c2c1d64b50f82f26a318bb9ff11be15a3f: {
    ...cvs1DemoResourceAttribs,
    name: 'Demo Model 01',
    identifier: 'DM01',
    filenamePattern: '^DM01(.mn)?POL.BIN$'
  },
  b8af7110a4b3f52895dc0c9828431d77d0cffb93: {
    ...cvs1DemoResourceAttribs,
    name: 'Demo Model 02',
    identifier: 'DM02',
    filenamePattern: '^DM02(.mn)?POL.BIN$'
  },
  '2ee10db010879f59ca5aa3455e95fc889d3706a4': {
    ...cvs1DemoResourceAttribs,
    name: 'Demo Model 03',
    identifier: 'DM03',
    filenamePattern: '^DM03(.mn)?POL.BIN$',
    hasLzssTextureFile: false
  },
  cfa1ad9b7a049d658c09fc747af6830c36b476e3: {
    ...cvs1DemoResourceAttribs,
    name: 'Demo Model 04',
    identifier: 'DM04',
    filenamePattern: '^DM04(.mn)?POL.BIN$'
  },
  aab4fad2fbf430fb3fd5509cbb7bf066381a01e7: {
    ...cvs1DemoResourceAttribs,
    name: 'Demo Model 05',
    identifier: 'DM05',
    filenamePattern: '^DM05(.mn)?POL.BIN$'
  },
  '332b71c86b1e016b67276968c4191eaadebadcd2': {
    ...cvs1DemoResourceAttribs,
    name: 'Demo Model 06',
    identifier: 'DM06',
    filenamePattern: '^DM06(.mn)?POL.BIN$'
  },
  a9733269f854135cb450acefcaa67670a4601226: {
    ...cvs1DemoResourceAttribs,
    name: 'Demo Model 07',
    identifier: 'DM07',
    filenamePattern: '^DM07(.mn)?POL.BIN$'
  },
  '5327708e5ecb2c549a8d1675e58d1576a3aea919': {
    ...cvs1DemoResourceAttribs,
    name: 'Demo Model 08',
    identifier: 'DM08',
    filenamePattern: '^DM08(.mn)?POL.BIN$'
  },
  '12e8feca65c8089018ea0a4949e331278eeb7690': {
    ...cvs1DemoResourceAttribs,
    name: 'Demo Model 09',
    identifier: 'DM09',
    filenamePattern: '^DM09(.mn)?POL.BIN$'
  },
  '3c66669c57920d07032420b6e11ed26511357756': {
    ...cvs1DemoResourceAttribs,
    name: 'Demo Models 10-75/88-91',
    identifier: 'DM10-DM75/DM88-DM91',
    filenamePattern:
      '^DM(1[0-9]|2[1235-9]|[3-6][0-9]|7[0-5]|8[89]|9[01])(.mn)?POL.BIN$'
  },
  '2e57122211578849a0e64f316fdc82a222085469': {
    ...cvs1DemoResourceAttribs,
    name: 'Demo Models 20/24/92',
    identifier: 'DM20/DM24/DM92',
    filenamePattern: '^DM(20|24|92)(.mn)?POL.BIN$'
  },
  fa1610afca1439745d929b128065ce0b55f2714f: {
    ...cvs1DemoResourceAttribs,
    name: 'Demo Model 76',
    identifier: 'DM76',
    filenamePattern: '^DM76(.mn)?POL.BIN$'
  },
  bbdab340fbb21d360ef80a620eacd7c55e6810bc: {
    ...cvs1DemoResourceAttribs,
    name: 'Demo Model 77',
    identifier: 'DM77',
    filenamePattern: '^DM77(.mn)?POL.BIN$'
  },
  '8a2eebe2404e73936fea34587acdbeadbaa498c6': {
    ...cvs1DemoResourceAttribs,
    name: 'Demo Model 78',
    identifier: 'DM78',
    filenamePattern: '^DM78(.mn)?POL.BIN$'
  },
  dda53329c0def9a81de4df2cb2decbcd22e3859f: {
    ...cvs1DemoResourceAttribs,
    name: 'Demo Model 79',
    identifier: 'DM79',
    filenamePattern: '^DM79(.mn)?POL.BIN$'
  },
  '4922ab47fc64eef5ee2a30621733e3e6cfae4308': {
    ...cvs1DemoResourceAttribs,
    name: 'Demo Model 80',
    identifier: 'DM80',
    filenamePattern: '^DM80(.mn)?POL.BIN$'
  },
  d8fe02eae09901a05cd38c659748b17aa3f8477c: {
    ...cvs1DemoResourceAttribs,
    name: 'Demo Models 81-86',
    identifier: 'DM81-DM86',
    filenamePattern: '^DM8[1-6](.mn)?POL.BIN$'
  },
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
  f6267bcb211d053d6b21b2e224acafd150854f6c: {
    game: 'MVC2',
    name: 'Carnival (Night)',
    identifier: '0x0C',
    resourceType: 'mvc2-stage',
    filenamePattern: '^STG0C(.mn)?POL.BIN$',
    polygonMapped: true,
    oobReferencable: false,
    hasLzssTextureFile: false
  },
  c8fd59b26aed2e4a87af2ed05c851d9b0510b219: {
    game: 'MVC2',
    name: 'Special Effects',
    identifier: 'EFKY',
    resourceType: 'mvc2-menu',
    filenamePattern: '^EFKY(.mn)?POL.BIN$',
    polygonMapped: true,
    oobReferencable: false,
    textureFileType: 'mvc2-special-effects',
    hasLzssTextureFile: false
  },
  'mvc2-special-effects': {
    game: 'MVC2',
    name: 'Special Effects',
    identifier: 'EFKY',
    resourceType: 'mvc2-menu',
    filenamePattern: '^EFKY(.mn)?TEX.BIN$',
    polygonMapped: true,
    oobReferencable: false,
    textureFileType: 'mvc2-special-effects',
    hasLzssTextureFile: false
  },
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
  'vs2-stage-file': {
    game: 'VS2',
    name: 'Stage Texture File (unspecified)',
    identifier: 'STXX',
    resourceType: 'vs2-stage',
    filenamePattern: '^ST(G)?(E)?[0-9A-Z]{2}TEX(.mn)?.BIN$',
    polygonMapped: true,
    oobReferencable: false,
    textureFileType: 'vs2-stage-file',
    hasLzssTextureFile: false
  },
  'vs2-stage-polygon-file': {
    game: 'VS2',
    name: 'Stage Polygon File (unspecified)',
    identifier: 'STXX',
    resourceType: 'vs2-stage',
    filenamePattern: '^ST(G)?(E)?[0-9A-Z]{2}(.mn)?POL.BIN$',
    polygonMapped: true,
    oobReferencable: false,
    hasLzssTextureFile: false,
    allowFileNameOnlyMatch: true
  },
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
    hasLzssTextureFile: false,
    allowFileNameOnlyMatch: true
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
