import scanModel from './process-stage-polygon-file/scanModel';
import scanForModelPointers from './process-stage-polygon-file/scanForModelPointers';

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
  return Promise.resolve({ models });
}
