import { NLUITextureDef } from '@/types/NLAbstractions';
import { ResourceAttribs } from '@/types/ResourceAttribs';
import createTextureDef from '@/utils/textures/createTextureDef';
import { TextureFileType } from '@/utils/textures/files/textureFileTypeMap';

const cvs2MenuAssets = Object.fromEntries(
  [
    {
      identifier: '00',
      name: 'Player & Groove Select',
      textureDefsHash: 'c0ab42c3d395afd396e74c5c1a224d171faa8785'
    },
    {
      identifier: '01',
      name: 'Player & Groove Select',
      textureDefsHash: 'b74ed77a9074a54512e46346c723e3be8cef07a0'
    },
    {
      identifier: '02',
      name: 'Player & Ratio Select',
      textureDefsHash: '234a25a4fae5a53756fcfd180750b926c3d816ea'
    },
    {
      identifier: '03',
      name: 'Stage & Player Order',
      textureDefsHash: 'e96373e252988b7b01dd1542f7aac5be14740e7c'
    },
    {
      identifier: '04|40',
      name: 'HUD & New Challenger',
      textureDefsHash: '4073546357847642db623741429d0379e65b18db'
    },
    {
      identifier: '05',
      name: '???',
      textureDefsHash: 'cfa93b9d48d530fdd55b83aae884899682a469bb'
    },
    {
      identifier: '06',
      name: '???',
      textureDefsHash: 'cd8a97c922b4c3b70a2cdef77ac875308c2634c7'
    },
    {
      identifier: '07',
      name: '???',
      textureDefsHash: 'f2ad774a770d9af0e2f12563ca32f2696e487e9d',
      hasLzssTextureFile: false
    },
    {
      identifier: '08',
      name: '???',
      textureDefsHash: '5aa7a27512e74fda6bf3aed2e62df6d2ebdab363'
    },
    {
      identifier: '09',
      name: '???',
      textureDefsHash: 'b74caa7d3f89fcce022a3b500f7b9fe4d5fcdc70'
    },
    {
      identifier: '10',
      name: '???',
      textureDefsHash: '06a61b584c40ef35e4b8812db09f370a280d17ec'
    },
    {
      name: '???',
      identifier: '11',
      textureDefsHash: '8abaeac1aa3cf80db93b9eebc46939693233a97f'
    },
    {
      name: 'Intro Sequence',
      identifier: '12',
      textureDefsHash: '5d35f8ff19efd92bc84f626df0bac9d47f80cf33'
    },
    {
      name: 'Intro Sequence',
      identifier: '13',
      textureDefsHash: '500a0c7b934e3707a5029dc818b34aac5efe313a'
    },
    {
      name: 'Intro Sequence',
      identifier: '14',
      textureDefsHash: '832a477d37bb77bae31359aa1cf6dee5e4fc2fce'
    },
    {
      name: 'Intro Sequence',
      identifier: '15',
      textureDefsHash: '3c1b85b42be7bf0515a8282b4ccb2de421425025'
    },
    {
      name: 'Gui (???)',
      identifier: '16',
      textureDefsHash: '0bb72a73ff39c76b75903d4ee5f175685670e854'
    },
    {
      name: 'Akuma & Rugal Portraits',
      identifier: '17',
      textureDefsHash: '47c635daa15681704ef5b3c1dbd5dc26f4d4f72f'
    },
    {
      name: 'Here Comes a New Challenger!',
      identifier: '18',
      textureDefsHash: 'b708247c674deb20455bf5633358a3b7251c8631'
    },
    {
      name: 'Continue & Name Entry',
      identifier: '19',
      textureDefsHash: '9405666212f20c807702ed8c880ff0f4a0d0122b'
    },
    {
      name: 'Ending: Victory/Grand Champ',
      identifier: '20',
      textureDefsHash: 'e4302303640f441792243898416583f5da18e926'
    },
    {
      name: 'Rugal/Akuma Rooftop Scene',
      identifier: '21',
      textureDefsHash: '07d8478d22fe47d83b026845650608db89578159'
    },
    {
      name: 'Rugal/Akuma Rooftop Scene 2',
      identifier: '22',
      textureDefsHash: '92ddacea6cb51180eb267bd7e9114a3add405a2c'
    },
    {
      name: 'Rugal/Akuma Rooftop Scene 3',
      identifier: '23',
      textureDefsHash: 'ea86b36b43e1c62aae4641cf1cf496d9806157d4'
    },
    {
      name: 'Akuma defeats Rugal',
      identifier: '24',
      textureDefsHash: '14d7e45e4e201af28191914b6396a2e565fcd31e'
    },
    {
      name: 'Rugal defeats Akuma',
      identifier: '25',
      textureDefsHash: '166965a4ecbc29f6dbb52de09c5b988f36a9d643'
    },
    {
      name: 'Rugal fuses with Akuma',
      identifier: '26',
      textureDefsHash: '0c4f75bab538a7b940bfa7466cf56f541cfbedb5'
    },
    {
      name: 'Akuma lays down and vortex',
      identifier: '27',
      textureDefsHash: '217246f35d10dc0f6776e1e4c6c147d399c09899'
    },
    {
      name: 'Ending FF Children News Report',
      identifier: '28',
      textureDefsHash: '50da02b5bb92c029cc0e474ed02bcd3b3d9caec0'
    },
    {
      name: 'Ryu, Kyo, Capcom, Name Entry',
      identifier: '29',
      textureDefsHash: '3e953ae495b877557f2f434fd12f08940b9c9820'
    },
    {
      name: 'Final Stage Scene',
      identifier: '30',
      textureDefsHash: 'c7198b21be4ce7efc5f4ef32f07914df7f432ea1'
    }
  ].map((v) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { textureDefsHash, ...fields } = v;
    return [
      v.textureDefsHash,
      {
        hasLzssTextureFile: true,
        ...fields,
        game: 'CVS2',
        resourceType: 'cvs2-menu',
        filenamePattern: `^DM${v.identifier}(.mn)?POL.BIN$`,
        identifier: `0x${v.identifier}`
      }
    ];
  })
);

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
  ...cvs2MenuAssets,
  f6267bcb211d053d6b21b2e224acafd150854f6c: {
    game: 'MVC2',
    name: 'Carnival (Night)',
    identifier: '0x0C',
    resourceType: 'mvc2-stage',
    filenamePattern: '^STG0C(.mn)?POL.BIN$',
    hasLzssTextureFile: true
  },
  'mvc2-stage-preview': {
    game: 'MVC2',
    name: 'Stage Previews',
    identifier: 'SELSTG',
    resourceType: 'mvc2-menu',
    filenamePattern: '^SELSTG(.mn)?TEX.BIN',
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
    filenamePattern: 'PLXXFAC(.mn)?TEX.BIN',
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
    filenamePattern: 'SELTEX(.mn)?TEX.BIN',
    hasLzssTextureFile: false,
    textureShapesMap: [...Array(23).keys()].map((i) =>
      createTextureDef({ baseLocation: 256 * 256 * 2 * i })
    )
  },
  'mvc2-end-file': {
    game: 'MVC2',
    name: 'Ending Sequence Images',
    identifier: 'ENDTEX',
    resourceType: 'mvc2-menu',
    filenamePattern: 'END(DC|NM)TEX(.mn)?TEX.BIN',
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
    filenamePattern: 'PLXXWIN(.mn)?TEX.BIN',
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
