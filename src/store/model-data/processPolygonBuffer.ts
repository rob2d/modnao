import { NLTextureDef } from '@/types/NLAbstractions';
import scanForModelPointers from './process-model-polygon-file/scanForModelPointers';
import scanModel from './process-model-polygon-file/scanModel';
import scanTextureHeaderData from './process-model-polygon-file/scanTextureHeaderData';
import TransferrableBuffer from '@/types/TransferrableBuffer';

export default async function processPolygonBuffer(
  buffer: TransferrableBuffer
): Promise<{
  modelRamOffset: number;
  models: NLModel[];
  textureDefs: NLTextureDef[];
}> {
  const [modelPointers, modelRamOffset] = scanForModelPointers(buffer);

  // @TODO: run these on separate thread
  const textureDefs = scanTextureHeaderData(buffer, modelRamOffset);

  // @TODO: run these on separate thread
  const models = modelPointers.map(
    (address: number, index: number) =>
      scanModel({ buffer, address, index }) as NLModel
  );

  return Promise.resolve({
    modelRamOffset,
    models,
    textureDefs
  });
}
