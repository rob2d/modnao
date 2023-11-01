import { NLTextureDef } from '@/types/NLAbstractions';
import createTextureDef from '../createTextureDef';
import { TextureFileType } from './textureFileTypeMap';

const fontTextureArgs: Partial<NLTextureDef> = {
  width: 128,
  height: 128,
  colorFormat: 'ARGB4444',
  colorFormatValue: 2
};

const textureShapesMap: Record<TextureFileType, NLTextureDef[]> = {
  'mvc2-character-portraits': [],
  'mvc2-stage-preview': [
    ...[...Array(18).keys()].map((i) =>
      createTextureDef({
        width: 128,
        height: 128,
        colorFormat: 'RGB565',
        colorFormatValue: 1,
        baseLocation: i * 128 * 128 * 2
      })
    ),
    createTextureDef({
      width: 64,
      height: 64,
      colorFormat: 'ARGB4444',
      colorFormatValue: 2,
      baseLocation: 18 * 128 * 128 * 2
    })
  ],
  'mvc2-character-win': [
    createTextureDef({
      width: 256,
      height: 256,
      colorFormat: 'ARGB4444',
      colorFormatValue: 2
    })
  ],
  'mvc2-selection-textures': [
    ...[...Array(23).keys()].map((i) =>
      createTextureDef({ baseLocation: 256 * 256 * 2 * i })
    )
  ],
  'mvc2-end-file': [
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
  ],
  // will be populated with headers in polygon file
  'polygon-mapped': []
};

export default textureShapesMap;
