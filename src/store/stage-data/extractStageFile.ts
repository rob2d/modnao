import scanModel from './extract-stage-file/scanModel';
import scanForModelPointers from './extract-stage-file/scanForModelPointers';

export default async function processStageFile(stageFile: File): Promise<{
  models: NLStageModel[];
}> {
  const buffer = Buffer.from(await stageFile?.arrayBuffer());

  const modelPointers = scanForModelPointers(buffer);

  // @TODO: run these on separate thread
  const models = modelPointers.map(
    (address, index) => scanModel({ buffer, address, index }) as NLStageModel
  );

  return Promise.resolve({ models });
}
