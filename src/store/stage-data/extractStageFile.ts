import { NLStageModel } from '../stageDataSlice';
import scanModel from './extract-stage-file/scanModel';
import scanModelsTable from './extract-stage-file/scanModelsTable';

export default async function processStageFile(stageFile: File): Promise<{
  models: NLStageModel[];
}> {
  const buffer = Buffer.from(await stageFile?.arrayBuffer());

  const modelPointers = scanModelsTable(buffer);

  // @TODO: run in another thread
  const models = modelPointers.map(
    (address, index) => scanModel({ buffer, address, index }) as NLStageModel
  );

  return Promise.resolve({ models });
}
