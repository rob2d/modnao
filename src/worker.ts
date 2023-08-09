import loadTextureFile from './utils/textures/parse/loadTextureFile';
import { NLTextureDef } from './types/NLAbstractions';
import HslValues from './utils/textures/HslValues';
import adjustTextureHsl from './utils/textures/adjustTextureHsl';
import { SourceTextureData } from './utils/textures/SourceTextureData';
import TransferrableBuffer from './types/TransferrableBuffer';
import loadPolygonFile from './utils/polygons/parse/loadPolygonFile';

export type WorkerEvent =
  | {
      type: 'loadPolygonFile';
      payload: {
        buffer: TransferrableBuffer;
      };
    }
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
        sourceTextureData: SourceTextureData;
        width: number;
        height: number;
        hsl: HslValues;
      };
    };

export type WorkerResponses =
  | {
      type: 'loadPolygonFile';
      result: {
        modelRamOffset: number;
        models: NLModel[];
        textureDefs: NLTextureDef[];
      };
    }
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
        bufferUrls: { translucent: string; opaque: string };
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
        adjustTextureHsl(sourceTextureData.translucent, hsl),
        adjustTextureHsl(sourceTextureData.opaque, hsl)
      ]);

      postMessage({
        type: 'adjustTextureHsl',
        result: {
          hsl,
          textureIndex,
          width,
          height,
          bufferUrls: { translucent, opaque }
        }
      });
      break;
    }
    default: {
      break;
    }
  }
});
