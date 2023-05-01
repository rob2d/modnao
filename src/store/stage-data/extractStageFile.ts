import { NLStageModel } from '../stageDataSlice';

export default async function processStageFile(stageFile: File): Promise<{
  models: NLStageModel[];
}> {
  const buffer = Buffer.from(await stageFile?.arrayBuffer());

  // @TODO: process buffer into models using logic from node util
  // wait just to simulate something happening for now
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve({ models: [] }), 5000);
  });
}
