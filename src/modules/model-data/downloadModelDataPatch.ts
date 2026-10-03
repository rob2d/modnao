import {
  $models,
  $originalModels,
  $polygonFileName,
  $resourceAttribs,
  $textureDefs,
  $textureFileName
} from '@/modules/model-data/modelDataStore';
import { showError } from '@/modules/error-messages';
import globalBuffers from '@/utils/data/globalBuffers';
import { createB64ImgFromTextureDef } from '@/utils/textures';
import saveAs from 'file-saver';
import JSZip from 'jszip';
import type { ModelDataPatchEntry } from './modelDataTypes';
import { createModelDataPatchManifest } from './parseModelDataPatchManifest';
import {
  getModelDataPatchTarget,
  normalizeModelDataResourcePrefix
} from './validateModelDataPatchCompatibility';

const downloadModelDataPatch = async ({
  textureIndexes,
  onlyChangedVertexColors
}: {
  textureIndexes: number[];
  onlyChangedVertexColors: boolean;
}) => {
  try {
    const models = $models.value;
    const originalModels = $originalModels.value;
    const polygonFileName = $polygonFileName.value;
    const resourceAttribs = $resourceAttribs.value;
    const textureDefs = $textureDefs.value;
    const textureFileName = $textureFileName.value;
    const sourceFileName = polygonFileName ?? textureFileName;

    if (!resourceAttribs || !sourceFileName) {
      showError({
        title: 'Error exporting patch',
        message: 'No supported resource is loaded.'
      });
      return;
    }

    try {
      const resourcePrefix = normalizeModelDataResourcePrefix(sourceFileName);
      const textureImagePrefix =
        textureFileName?.replace(/\.([a-zA-Z0-9]+)$/, '') ?? resourcePrefix;
      const textureIndexSet = new Set(textureIndexes);
      const entries = models.flatMap((model, modelIndex) =>
        model.meshes.flatMap((mesh, meshIndex) =>
          !mesh.hasColoredVertices
            ? []
            : mesh.polygons.flatMap((polygon, polygonIndex) =>
                polygon.vertices.flatMap((vertex, vertexIndex) => {
                  const originalColor =
                    originalModels[modelIndex]?.meshes[meshIndex]?.polygons[
                      polygonIndex
                    ]?.vertices[vertexIndex]?.colors;
                  const isUnchanged =
                    originalColor &&
                    vertex.colors?.every(
                      (channel, channelIndex) =>
                        Math.round(channel * 255) ===
                        Math.round(originalColor[channelIndex] * 255)
                    );

                  return !vertex.colors ||
                    (onlyChangedVertexColors && isUnchanged)
                    ? []
                    : [
                        {
                          type: 'v-color',
                          entry: [
                            modelIndex,
                            meshIndex,
                            polygonIndex,
                            vertexIndex,
                            vertex.colors
                          ]
                        } satisfies ModelDataPatchEntry
                      ];
                })
              )
        )
      );
      const textures = textureDefs.flatMap(
        ({ bufferKeys, width, height }, textureIndex) => {
          const translucentBufferKey = bufferKeys?.translucent;

          if (
            !textureIndexSet.has(textureIndex) ||
            !translucentBufferKey ||
            globalBuffers.get(translucentBufferKey).length !==
              width * height * 4
          ) {
            return [];
          }

          return [
            {
              textureIndex,
              imagePath: `${textureImagePrefix}.mn.${textureIndex}.png`,
              width,
              height
            }
          ];
        }
      );
      const manifest = createModelDataPatchManifest({
        resourcePrefix,
        target: getModelDataPatchTarget(resourceAttribs),
        entries,
        textures
      });
      const zip = new JSZip();

      await Promise.all(
        textures.map(async ({ textureIndex, imagePath }) => {
          const image = await createB64ImgFromTextureDef({
            textureDef: textureDefs[textureIndex],
            asTranslucent: true
          });

          zip.file(
            imagePath,
            image.replace(/^data:image\/(png|jpeg);base64,/, ''),
            { base64: true }
          );
        })
      );

      zip.file(`${resourcePrefix}.mnp.json`, JSON.stringify(manifest));

      saveAs(
        await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' }),
        `${resourcePrefix}.mnp.zip`
      );
    } catch (error) {
      console.error(error);
      showError({
        title: 'Error exporting patch',
        message:
          error instanceof Error
            ? error.message
            : 'Unknown error occurred while exporting the patch.'
      });
    }
  } catch {
    return undefined;
  }
};

export default downloadModelDataPatch;
