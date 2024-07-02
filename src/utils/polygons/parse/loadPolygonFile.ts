import scanForModelPointers from '@/utils/polygons/serialize/scanForModelPointers';
import scanModel from '@/utils/polygons/serialize/scanModel';
import scanTextureHeaderData from '@/utils/polygons/serialize/scanTextureHeaderData';
import { NLUITextureDef } from '@/types/NLAbstractions';
import TransferrableBuffer from '@/types/TransferrableBuffer';
import { bufferToObjectUrl } from '@/utils/data';
import { ResourceAttribs } from '@/types/ResourceAttribs';
import getTextureDefsHash from '@/utils/resource-attribs/getTextureDefsHash';
import getResourceAttribs from '@/utils/resource-attribs/getResourceAttribs';

export default async function loadPolygonFile({
  buffer,
  fileName
}: {
  buffer: TransferrableBuffer;
  fileName: string;
}): Promise<{
  modelRamOffset: number;
  models: NLModel[];
  textureDefs: NLUITextureDef[];
  polygonBufferUrl: string;
  fileName: string;
  resourceAttribs?: ResourceAttribs;
}> {
  const [modelPointers, modelRamOffset] = scanForModelPointers(buffer);
  const textureDefs = scanTextureHeaderData(buffer, modelRamOffset);
  const textureDefsHash = getTextureDefsHash(textureDefs);
  const resourceAttribs = getResourceAttribs(textureDefsHash, fileName);

  const models = modelPointers.map(
    (address: number, index: number) =>
      scanModel({ buffer, address, index }) as NLModel
  );

  return Promise.resolve({
    modelRamOffset,
    models,
    textureDefs,
    polygonBufferUrl: await bufferToObjectUrl(buffer),
    fileName,
    resourceAttribs
  });
}
