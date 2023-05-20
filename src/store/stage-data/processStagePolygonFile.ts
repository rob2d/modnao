import scanModel from './process-stage-polygon-file/scanModel';
import scanForModelPointers from './process-stage-polygon-file/scanForModelPointers';
import scanTextureHeaderData from './process-stage-polygon-file/scanTextureHeaderData';
import { NLTextureDef } from '@/types/NLAbstractions';

export default async function processStagePolygonFile(
  stagePolygonFile: File
): Promise<{
  models: NLModel[];
  textureDefs: NLTextureDef[];
}> {
  const buffer = Buffer.from(await stagePolygonFile.arrayBuffer());
  const modelPointers = scanForModelPointers(buffer);

  // @TODO: run these on separate thread
  const textureDefs = scanTextureHeaderData(buffer);

  // @TODO: run these on separate thread
  const models = modelPointers.map(
    (address: number, index: number) =>
      scanModel({ buffer, address, index, textureDefs }) as NLModel
  );

  return Promise.resolve({ models, textureDefs });
}
