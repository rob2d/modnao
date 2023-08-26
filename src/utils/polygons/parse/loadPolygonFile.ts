import scanForModelPointers from '@/utils/polygons/serialize/scanForModelPointers';
import scanModel from '@/utils/polygons/serialize/scanModel';
import scanTextureHeaderData from '@/utils/polygons/serialize/scanTextureHeaderData';
import { NLTextureDef } from '@/types/NLAbstractions';
import TransferrableBuffer from '@/types/TransferrableBuffer';
import { bufferToObjectUrl } from '@/utils/data';

export default async function loadPolygonFile({
  buffer,
  fileName
}: {
  buffer: TransferrableBuffer;
  fileName: string;
}): Promise<{
  modelRamOffset: number;
  models: NLModel[];
  textureDefs: NLTextureDef[];
  polygonBufferUrl: string;
  fileName: string;
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
    textureDefs,
    polygonBufferUrl: await bufferToObjectUrl(buffer),
    fileName
  });
}
