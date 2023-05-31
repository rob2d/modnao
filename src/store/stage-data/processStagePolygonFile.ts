import scanModel from './process-stage-polygon-file/scanModel';
import scanForModelPointers from './process-stage-polygon-file/scanForModelPointers';
import scanTextureHeaderData from './process-stage-polygon-file/scanTextureHeaderData';
import { NLTextureDef } from '@/types/NLAbstractions';
import nonSerializables from '../nonSerializables';

export default async function processStagePolygonFile(
  stagePolygonFile: File
): Promise<{
  modelRamOffset: number;
  models: NLModel[];
  textureDefs: NLTextureDef[];
  fileName: string;
}> {
  const buffer = Buffer.from(await stagePolygonFile.arrayBuffer());
  const [modelPointers, modelRamOffset] = scanForModelPointers(buffer);

  // @TODO: run these on separate thread
  const textureDefs = scanTextureHeaderData(buffer, modelRamOffset);

  // @TODO: run these on separate thread
  const models = modelPointers.map(
    (address: number, index: number) =>
      scanModel({ buffer, address, index }) as NLModel
  );

  nonSerializables.stagePolygonFile = stagePolygonFile;
  return Promise.resolve({
    modelRamOffset,
    models,
    textureDefs,
    fileName: stagePolygonFile.name
  });
}
