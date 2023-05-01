import { NLStageModel } from '../stageDataSlice';
import scanModelsTable from './extract-stage-data/scanModelsTable';

export default async function processStageFile(stageFile: File): Promise<{
  models: NLStageModel[];
}> {
  const buffer = Buffer.from(await stageFile?.arrayBuffer());

  // @TODO: process buffer into models using logic from node util
  // wait just to simulate something happening for now
  return new Promise((resolve) => {
    const modelPointers = scanModelsTable(buffer);
    console.log('modelPointers discovered ->', modelPointers);
    setTimeout(() => resolve({ models: [] }), 5000);
  });
}
