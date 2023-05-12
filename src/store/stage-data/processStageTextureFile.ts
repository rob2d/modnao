export default async function processStageTextureFile(
  textureFile: File,
  models: NLModel[]
): Promise<{ models: NLModel[] }> {
  const buffer = Buffer.from(await textureFile.arrayBuffer());

  models.forEach((model) => {
    model.meshes.forEach((m) => {
      console.log('textureNumber ->', m.textureNumber);
      console.log('textureColorFormat ->', m.textureColorFormat);
      console.log('textureWrappingFlags ->', m.textureWrappingFlags);
      console.log('textureSizeValue ->', m.textureSizeValue);
      console.log('textureSize ->', m.textureSize);
    });
  });

  // @TODO cross reference teture file buffer stream containing
  // pixel data with pre-loaded models. Model contains texture data

  return Promise.resolve({ models });
}
