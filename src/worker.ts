import loadTextureFile from './utils/textures/parse/loadTextureFile';
import { NLTextureDef } from './types/NLAbstractions';
import HslValues from './utils/textures/HslValues';
import adjustTextureHsl from './utils/textures/adjustTextureHsl';
import { SourceTextureData } from './utils/textures/SourceTextureData';

export type WorkerEvent =
  | {
      type: 'loadTextureFile';
      payload: {
        buffer: Buffer;
        textureDefs: NLTextureDef[];
        fileName: string;
        sourceTextureData: SourceTextureData;
      };
    }
  | {
      type: 'adjustTextureHsl';
      payload: {
        textureIndex: number;
        hsl: HslValues;
        sourceTextureData: SourceTextureData;
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
        sourceTextureData: SourceTextureData[];
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
      const result = await loadTextureFile(payload);

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
