export default async function processStageTextureFile(
  textureFile: File,
  models: NLModel[]
): Promise<{ models: NLModel[] }> {
  const buffer = Buffer.from(await textureFile.arrayBuffer());

  // @TODO cross reference teture file buffer stream containing
  // pixel data with pre-loaded models. Model contains texture data

  return Promise.resolve({ models });
}
