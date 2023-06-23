// This is a module worker, so we can use imports (in the browser too!)
import loadTextureFile from './store/model-data/loadTextureFile';
import { NLTextureDef } from './types/NLAbstractions';

export type WorkerEvent = {
  type: 'loadTextureFile';
  payload: {
    buffer: Buffer;
    models: NLModel[];
    textureDefs: NLTextureDef[];
    fileName: string;
    hasCompressedTextures: boolean;
  };
};

addEventListener(
  'message',
  ({ data: { type, payload } }: MessageEvent<WorkerEvent>) => {
    switch (type) {
      case 'loadTextureFile': {
        const { buffer, models, textureDefs, fileName } = payload;

        const result = loadTextureFile({
          buffer,
          fileName,
          models,
          textureDefs
        });
        postMessage(result);
        break;
      }
      default: {
        break;
      }
    }
  }
);
