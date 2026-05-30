import type { ResourceAttribs } from '@/types';
import createTextureDef from '@/utils/textures/createTextureDef';

type Sfa3TextureShape = readonly [width: number, height: number];

interface Sfa3StagePacSource {
  identifier: string;
  textureShapes: readonly Sfa3TextureShape[];
}

const sfa3StageResourceAttribs = {
  game: 'SFA3',
  name: 'Stage PAC Textures',
  resourceType: 'sfa3-stage',
  polygonMapped: false,
  oobReferencable: false,
  hasLzssTextureFile: false
} satisfies Omit<ResourceAttribs, 'identifier' | 'filenamePattern'>;

const t256 = [256, 256] as const;

const sfa3StageSources = [
  {
    identifier: 'ST00',
    textureShapes: [t256, t256, t256, t256, t256, t256]
  },
  {
    identifier: 'ST01',
    textureShapes: [t256, t256, t256, t256, t256, t256, t256]
  },
  {
    identifier: 'ST02',
    textureShapes: [t256, t256, t256, t256]
  },
  {
    identifier: 'ST03',
    textureShapes: [t256, t256, t256, t256, t256, t256]
  },
  {
    identifier: 'ST04',
    textureShapes: [
      t256,
      t256,
      t256,
      t256,
      t256,
      t256,
      t256,
      t256,
      t256,
      t256,
      t256,
      t256,
      t256,
      t256
    ]
  },
  {
    identifier: 'ST05',
    textureShapes: [t256, t256, t256, t256, t256]
  },
  {
    identifier: 'ST06',
    textureShapes: [t256, t256, t256, t256, t256]
  },
  {
    identifier: 'ST07',
    textureShapes: [t256, t256, t256, t256, t256]
  },
  {
    identifier: 'ST08',
    textureShapes: [t256, t256, t256, t256, t256]
  },
  {
    identifier: 'ST09',
    textureShapes: [t256, t256, t256, t256, t256]
  },
  {
    identifier: 'ST0A',
    textureShapes: [t256, t256, t256, t256, t256, t256, t256, t256, t256]
  },
  {
    identifier: 'ST0B',
    textureShapes: [t256, t256, t256, t256]
  },
  {
    identifier: 'ST0C',
    textureShapes: [t256, t256, t256, t256, t256, t256]
  },
  {
    identifier: 'ST0D',
    textureShapes: [t256, t256, t256, t256, t256, t256]
  },
  {
    identifier: 'ST0E',
    textureShapes: [t256, t256, t256, t256]
  },
  {
    identifier: 'ST0F',
    textureShapes: [t256, t256, t256, t256, t256, t256, t256]
  },
  {
    identifier: 'ST10',
    textureShapes: [t256, t256, t256]
  },
  {
    identifier: 'ST11',
    textureShapes: [t256, t256, t256, t256, t256, t256]
  },
  {
    identifier: 'ST15',
    textureShapes: [t256, t256, t256, t256, t256, t256, t256]
  },
  {
    identifier: 'ST16',
    textureShapes: [t256, t256, t256, t256, t256, t256, t256, t256]
  },
  {
    identifier: 'ST17',
    textureShapes: [t256, t256, t256, t256]
  },
  {
    identifier: 'ST18',
    textureShapes: [t256, t256, t256]
  },
  {
    identifier: 'ST19',
    textureShapes: [t256, t256, t256, t256, t256, t256, t256, t256]
  },
  {
    identifier: 'ST1A',
    textureShapes: [t256, t256, t256, t256, t256, t256, t256, t256]
  },
  {
    identifier: 'ST1B',
    textureShapes: [t256, t256, t256, t256, t256, t256, t256]
  },
  {
    identifier: 'ST1C',
    textureShapes: [t256, t256, t256, t256, t256, t256]
  },
  {
    identifier: 'ST1D',
    textureShapes: [t256, t256, t256, t256]
  },
  {
    identifier: 'ST1E',
    textureShapes: [t256, t256, t256, t256, t256, t256, t256, t256, t256]
  },
  {
    identifier: 'ST20',
    textureShapes: [t256, t256, t256, t256]
  },
  {
    identifier: 'ST21',
    textureShapes: [t256, t256, t256, t256, t256, t256, t256]
  },
  {
    identifier: 'ST22',
    textureShapes: [t256, t256, t256, t256, t256]
  },
  {
    identifier: 'ST23',
    textureShapes: [t256, t256, t256, t256, t256, t256]
  },
  {
    identifier: 'ST24',
    textureShapes: [t256, t256, t256, t256]
  },
  {
    identifier: 'ST25',
    textureShapes: [t256, t256, t256, t256]
  },
  {
    identifier: 'ST26',
    textureShapes: [t256, t256, t256, t256]
  },
  {
    identifier: 'ST27',
    textureShapes: [t256, t256, t256, t256]
  },
  {
    identifier: 'ST28',
    textureShapes: [t256, t256, t256, t256]
  },
  {
    identifier: 'ST29',
    textureShapes: [t256, t256, t256, t256]
  }
] satisfies readonly Sfa3StagePacSource[];

const createSfa3StagePacTextureShapes = (
  textureShapes: readonly Sfa3TextureShape[]
) =>
  textureShapes.map(([width, height]) =>
    createTextureDef({
      width,
      height,
      colorFormat: 'ARGB1555',
      colorFormatValue: 0,
      flipX: true
    })
  );

const sfa3StageAttribMappings = {
  ...Object.fromEntries(
    sfa3StageSources.map((source) => [
      `${source.identifier}.PAC`,
      {
        ...sfa3StageResourceAttribs,
        name: `${source.identifier} Stage PAC Textures`,
        identifier: source.identifier,
        filenamePattern: `^${source.identifier}(\\.mn)?\\.PAC$`,
        textureFileType: 'sfa3-stage-pac',
        allowFileNameOnlyMatch: true,
        textureShapesMap: createSfa3StagePacTextureShapes(source.textureShapes)
      }
    ])
  ),
  'sfa3-stage-pac': {
    ...sfa3StageResourceAttribs,
    identifier: 'STXX',
    filenamePattern: '^ST[0-9A-Z]{2}(\\.mn)?\\.PAC$',
    textureFileType: 'sfa3-stage-pac'
  }
} satisfies Record<string, ResourceAttribs>;

export default sfa3StageAttribMappings;
