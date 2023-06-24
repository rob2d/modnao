import loadTextureFile from './utils/textures/parse/loadTextureFile';
import { NLTextureDef } from './types/NLAbstractions';
import HslValues from './utils/textures/HslValues';
import adjustTextureHsl from './utils/textures/adjustTextureHsl';

export type WorkerEvent =
  | {
      type: 'loadTextureFile';
      payload: {
        buffer: Buffer;
        textureDefs: NLTextureDef[];
        fileName: string;
        sourceTextureData: { translucent: ImageData; opaque: ImageData };
      };
    }
  | {
      type: 'adjustTextureHsl';
      payload: {
        textureIndex: number;
        hsl: HslValues;
        sourceTextureData: {
          translucent: ImageData;
          opaque: ImageData;
        };
      };
    };

export type WorkerResponses =
  | {
      type: 'loadTextureFile';
      result: {
        buffer: Buffer;
        textureDefs: NLTextureDef[];
        fileName: string;
        hasCompressedTextures: boolean;
        sourceTextureData: { translucent: ImageData; opaque: ImageData }[];
      };
    }
  | {
      type: 'adjustTextureHsl';
      result: {
        textureIndex: number;
        hsl: HslValues;
        textureDataUrls: { translucent: string; opaque: string };
      };
    };

addEventListener('message', async ({ data }: MessageEvent<WorkerEvent>) => {
  const { type, payload } = data;
  switch (type) {
    case 'loadTextureFile': {
      const { buffer, textureDefs, fileName } = payload;

      const result = await loadTextureFile({
        buffer,
        fileName,
        textureDefs
      });

      postMessage({ type: 'loadTextureFile', result });
      break;
    }
    case 'adjustTextureHsl': {
      const { sourceTextureData, textureIndex, hsl } = payload;

      const [translucent, opaque] = await Promise.all([
        adjustTextureHsl(sourceTextureData.translucent, hsl),
        adjustTextureHsl(sourceTextureData.opaque, hsl)
      ]);

      postMessage({
        type: 'adjustTextureHsl',
        result: {
          hsl,
          textureIndex,
          textureDataUrls: { translucent, opaque }
        }
      });
      break;
    }
    default: {
      break;
    }
  }
});
