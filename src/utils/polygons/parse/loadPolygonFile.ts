import scanForModelPointers from '@/store/model-data/process-model-polygon-file/scanForModelPointers';
import scanModel from '@/store/model-data/process-model-polygon-file/scanModel';
import scanTextureHeaderData from '@/store/model-data/process-model-polygon-file/scanTextureHeaderData';
import { NLTextureDef } from '@/types/NLAbstractions';
import TransferrableBuffer from '@/types/TransferrableBuffer';

export default async function loadPolygonFile({
  buffer
}: {
  buffer: TransferrableBuffer;
}): Promise<{
  modelRamOffset: number;
  models: NLModel[];
  textureDefs: NLTextureDef[];
}> {
  const [modelPointers, modelRamOffset] = scanForModelPointers(buffer);
  const textureDefs = scanTextureHeaderData(buffer, modelRamOffset);
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
