import scanModel from './process-stage-polygon-file/scanModel';
import scanForModelPointers from './process-stage-polygon-file/scanForModelPointers';
import scanTextureHeaderData from './process-stage-polygon-file/scanTextureHeaderData';

export default async function processStageFile(
  stagePolygonFile: File
): Promise<{
  models: NLModel[];
}> {
  const buffer = Buffer.from(await stagePolygonFile.arrayBuffer());
  const modelPointers = scanForModelPointers(buffer);

  // @TODO: run these on separate thread
  const models = modelPointers.map(
    (address: number, index: number) =>
      scanModel({ buffer, address, index }) as NLModel
  );

  // @TODO: run these on separate thread
  scanTextureHeaderData(buffer);

  return Promise.resolve({ models });
}
