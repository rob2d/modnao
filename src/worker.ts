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


addEventListener('message', async ({ data }: MessageEvent<WorkerEvent>) => {
  const { type, payload } = data;
  switch (type) {
    case 'loadTextureFile': {
      const { buffer, models, textureDefs, fileName } = payload;

      const result = await loadTextureFile({
        buffer,
        fileName,
        models,
        textureDefs
      });


      postMessage({ type: 'loadTextureFile', payload: result });
      break;
    }
    default: {
      break;
    }
  }
});
