import loadTextureFile from './store/model-data/loadTextureFile';
import { NLTextureDef } from './types/NLAbstractions';

export type WorkerEvent = {
  type: 'loadTextureFile';
  payload: {
    buffer: Buffer;
    textureDefs: NLTextureDef[];
    fileName: string;
    hasCompressedTextures: boolean;
    sourceTextureData: { translucent: ImageData; opaque: ImageData }[];
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

      postMessage({ type: 'loadTextureFile', payload: result });
      break;
    }
    default: {
      break;
    }
  }
});
