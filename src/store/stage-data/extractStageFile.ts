import { NLStageModel } from '../stageDataSlice';
import scanModel from './extract-stage-data/scanModel';
import scanModelsTable from './extract-stage-data/scanModelsTable';

export default async function processStageFile(stageFile: File): Promise<{
  models: NLStageModel[];
}> {
  const buffer = Buffer.from(await stageFile?.arrayBuffer());

  const modelPointers = scanModelsTable(buffer);

  return Promise.resolve({
    models: modelPointers.map(
      (address) => scanModel({ buffer, address }) as NLStageModel
    )
  });
}
