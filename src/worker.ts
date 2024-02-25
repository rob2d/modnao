import { NLTextureDef } from './types/NLAbstractions';
import HslValues from './utils/textures/HslValues';
import adjustTextureHsl from './utils/textures/adjustTextureHsl';
import { SourceTextureData } from './utils/textures/SourceTextureData';
import TransferrableBuffer from './types/TransferrableBuffer';
import loadPolygonFile from './utils/polygons/parse/loadPolygonFile';
import loadTextureFile from './utils/textures/parse/loadTextureFile';
import { TextureFileType } from './utils/textures/files/textureFileTypeMap';

export type WorkerEvent =
  | {
      type: 'loadPolygonFile';
      payload: {
        fileName: string;
        buffer: TransferrableBuffer;
      };
    }
  | {
      type: 'loadTextureFile';
      payload: {
        buffer: Buffer;
        textureFileType: TextureFileType;
        textureDefs: NLTextureDef[];
        fileName: string;
        sourceTextureData: SourceTextureData;
        hasCompressedTextures: boolean;
      };
    }
  | {
      type: 'adjustTextureHsl';
      payload: {
        textureIndex: number;
        sourceTextureData: SourceTextureData;
        width: number;
        height: number;
        hsl: HslValues;
      };
    };

addEventListener('message', async ({ data }: MessageEvent<WorkerEvent>) => {
  const { type, payload } = data;
  switch (type) {
    case 'loadPolygonFile': {
      const result = await loadPolygonFile(payload);

      postMessage({ type: 'loadPolygonFile', result });
      break;
    }
    case 'loadTextureFile': {
      const result = await loadTextureFile(payload);

      postMessage({ type: 'loadTextureFile', result });
      break;
    }
    case 'adjustTextureHsl': {
      const { sourceTextureData, textureIndex, hsl, width, height } = payload;

      const [translucent, opaque] = await Promise.all([
        adjustTextureHsl(sourceTextureData.translucent, width, height, hsl),
        adjustTextureHsl(sourceTextureData.opaque, width, height, hsl)
      ]);

      postMessage({
        type: 'adjustTextureHsl',
        result: {
          hsl,
          textureIndex,
          width,
          height,
          bufferUrls: {
            translucent: translucent.objectUrl,
            opaque: opaque.objectUrl
          },
          dataUrls: {
            translucent: translucent.dataUrl,
            opaque: opaque.dataUrl
          }
        }
      });
      break;
    }
    default: {
      break;
    }
  }
});
