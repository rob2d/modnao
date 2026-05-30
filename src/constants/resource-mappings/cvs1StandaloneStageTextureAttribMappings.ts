import type { NLUITextureDef, ResourceAttribs } from '@/types';
import createTextureDef from '@/utils/textures/createTextureDef';
import { VQ_TEXTURE_ENCODE_TYPE } from '@/utils/textures/VqFormatConstants';

const cvs1StandaloneStageTextureResourceAttribs = {
  game: 'CVS1Pro',
  name: 'Standalone Stage Textures',
  resourceType: 'cvs1-stage',
  polygonMapped: false,
  oobReferencable: false,
  hasLzssTextureFile: true
} satisfies Omit<ResourceAttribs, 'identifier' | 'filenamePattern'>;

const cvs1StandaloneStageTextureSources = [
  {
    identifier: 'ST00',
    fullTextureCount: 11,
    tail32TextureCount: 54,
    tail16TextureCount: 2
  },
  {
    identifier: 'ST01',
    fullTextureCount: 10,
    tail16TextureCount: 1
  },
  {
    identifier: 'ST02',
    fullTextureCount: 10,
    tail32TextureCount: 8
  },
  {
    identifier: 'ST03',
    fullTextureCount: 9,
    tail32TextureCount: 30
  },
  {
    identifier: 'ST04',
    fullTextureCount: 1,
    type: VQ_TEXTURE_ENCODE_TYPE
  },
  {
    identifier: 'ST05',
    fullTextureCount: 7,
    tail32TextureCount: 50
  },
  {
    identifier: 'ST06',
    fullTextureCount: 9,
    tail32TextureCount: 31
  },
  {
    identifier: 'ST07',
    fullTextureCount: 9,
    tail32TextureCount: 42
  },
  {
    identifier: 'ST08',
    fullTextureCount: 11,
    tail32TextureCount: 7
  },
  {
    identifier: 'ST09',
    fullTextureCount: 11,
    tail32TextureCount: 43
  },
  {
    identifier: 'ST0A',
    fullTextureCount: 10,
    tail32TextureCount: 28
  },
  {
    identifier: 'ST0B',
    fullTextureCount: 11,
    tail32TextureCount: 31
  },
  {
    identifier: 'ST0C',
    fullTextureCount: 10,
    tail32TextureCount: 45
  },
  {
    identifier: 'ST0D',
    fullTextureCount: 10,
    tail32TextureCount: 8
  },
  {
    identifier: 'ST0E',
    fullTextureCount: 8,
    tail32TextureCount: 49,
    tail16TextureCount: 2
  }
] as const;

const cvs1StandaloneStageTexturePattern = `^(${cvs1StandaloneStageTextureSources
  .map((source) => source.identifier)
  .join('|')})(.mn)?TEX.BIN$`;

const createCvs1StandaloneStageTextureDefs = (
  fullTextureCount: number,
  type = 0,
  tail32TextureCount = 0,
  tail16TextureCount = 0
): NLUITextureDef[] => {
  const fullTextureByteLength =
    type === VQ_TEXTURE_ENCODE_TYPE ? 0x800 + (256 * 256) / 4 : 256 * 256 * 2;
  const tail32BaseLocation = fullTextureCount * fullTextureByteLength;
  const tail16BaseLocation =
    tail32BaseLocation + tail32TextureCount * 32 * 32 * 2;

  const fullTextureDefs = [...Array(fullTextureCount).keys()].map(
    (textureIndex) =>
      createTextureDef({
        width: 256,
        height: 256,
        colorFormat: 'ARGB1555',
        colorFormatValue: 0,
        type,
        baseLocation: textureIndex * fullTextureByteLength
      })
  );

  const tail32TextureDefs = [...Array(tail32TextureCount).keys()].map(
    (textureIndex) =>
      createTextureDef({
        width: 32,
        height: 32,
        colorFormat: 'ARGB1555',
        colorFormatValue: 0,
        baseLocation: tail32BaseLocation + textureIndex * 32 * 32 * 2
      })
  );

  const tail16TextureDefs = [...Array(tail16TextureCount).keys()].map(
    (textureIndex) =>
      createTextureDef({
        width: 16,
        height: 16,
        colorFormat: 'ARGB1555',
        colorFormatValue: 0,
        baseLocation: tail16BaseLocation + textureIndex * 16 * 16 * 2
      })
  );

  return [...fullTextureDefs, ...tail32TextureDefs, ...tail16TextureDefs];
};

const cvs1StandaloneStageTextureAttribMappings = {
  ...Object.fromEntries(
    cvs1StandaloneStageTextureSources.map((source) => {
      const textureType = 'type' in source ? source.type : 0;
      const tail32TextureCount =
        'tail32TextureCount' in source ? source.tail32TextureCount : 0;
      const tail16TextureCount =
        'tail16TextureCount' in source ? source.tail16TextureCount : 0;

      return [
        `${source.identifier}TEX.BIN`,
        {
          ...cvs1StandaloneStageTextureResourceAttribs,
          name: `${source.identifier} Standalone Stage Textures`,
          identifier: source.identifier,
          filenamePattern: `^${source.identifier}(.mn)?TEX.BIN$`,
          textureFileType: 'cvs1-stage-textures',
          allowFileNameOnlyMatch: true,
          textureShapesMap: createCvs1StandaloneStageTextureDefs(
            source.fullTextureCount,
            textureType,
            tail32TextureCount,
            tail16TextureCount
          )
        }
      ] as const;
    })
  ),
  'cvs1-stage-textures': {
    ...cvs1StandaloneStageTextureResourceAttribs,
    identifier: 'STXX',
    filenamePattern: cvs1StandaloneStageTexturePattern,
    textureFileType: 'cvs1-stage-textures'
  }
} satisfies Record<string, ResourceAttribs>;

export default cvs1StandaloneStageTextureAttribMappings;
