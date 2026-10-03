import O from '@/constants/StructOffsets';
import { showError } from '@/modules/error-messages';
import { $modelData } from '@/modules/model-data/modelDataStore';
import { getState } from '@/store';
import globalBuffers from '@/utils/data/globalBuffers';
import loadRGBABuffersFromFile from '@/utils/images/loadRGBABuffersFromFile';
import { batch } from '@preact-signals/safe-react';
import { produce } from 'immer';
import JSZip from 'jszip';
import { createElement } from 'react';
import {
  applySelectedVertexColorFulfilled,
  replaceTextureImageInState
} from './modelDataStore';
import { writeVertexColorToBuffer } from './modelDataThunks';
import parseModelDataPatchManifest from './parseModelDataPatchManifest';
import validateModelDataPatchCompatibility, {
  getModelDataPatchPrefix,
  ModelDataPatchCompatibilityError
} from './validateModelDataPatchCompatibility';

const PATCH_MODEL_CHANGES_ERROR =
  'Some model changes in this patch could not be applied. Reopen the matching POL.BIN file or get a fresh copy of the patch and try again.';
const PATCH_TEXTURE_CHANGES_ERROR =
  'Some textures in this patch could not be applied. Reopen the matching files or get a fresh copy of the patch and try again.';
const PATCH_RESOURCE_CHANGED_ERROR =
  'The open model changed while the patch was loading. Open the model and import the patch again.';

const loadModelDataPatch = async (file: File) => {
  try {
    const { polygonFileName, resourceAttribs } = getState().modelData;

    if (!polygonFileName || !resourceAttribs) {
      showError({
        title: 'Patch could not be imported',
        message:
          'Open the POL.BIN model you want to update before importing a patch.'
      });
      return;
    }

    try {
      getModelDataPatchPrefix(file.name);
      let zip: JSZip;

      try {
        zip = await JSZip.loadAsync(file);
      } catch {
        throw new Error(
          'This patch file could not be opened. It may be incomplete or damaged.'
        );
      }

      const manifestFiles = Object.values(zip.files).filter(
        ({ dir, name }) => !dir && /^[a-z0-9]+\.mnp\.json$/i.test(name)
      );

      if (manifestFiles.length !== 1) {
        throw new Error(
          'This patch file is incomplete or damaged. Create or download it again and retry.'
        );
      }

      const [manifestFile] = manifestFiles;
      const manifest = parseModelDataPatchManifest(
        await manifestFile.async('string')
      );
      const manifestResourcePrefix = manifestFile.name.slice(
        0,
        -'.mnp.json'.length
      );

      if (manifest.resourcePrefix !== manifestResourcePrefix) {
        throw new Error(
          'This patch file is incomplete or damaged. Create or download it again and retry.'
        );
      }

      const {
        models,
        polygonBufferKey,
        polygonFileName: currentPolygonFileName,
        resourceAttribs: currentResourceAttribs,
        textureDefs
      } = getState().modelData;

      if (
        !currentPolygonFileName ||
        !currentResourceAttribs ||
        !polygonBufferKey
      ) {
        throw new Error(PATCH_RESOURCE_CHANGED_ERROR);
      }

      validateModelDataPatchCompatibility(manifest, currentResourceAttribs);

      const polygonBuffer = globalBuffers.get(polygonBufferKey);
      const decodedTextureUpdates = await Promise.all(
        manifest.textures.map(
          async ({ textureIndex, imagePath, width, height }) => {
            const textureDef = textureDefs[textureIndex];
            const imageEntry = zip.file(imagePath);

            if (
              !textureDef ||
              !imageEntry ||
              textureDef.width !== width ||
              textureDef.height !== height
            ) {
              throw new Error(PATCH_TEXTURE_CHANGES_ERROR);
            }

            try {
              const imageBuffer = await imageEntry.async('arraybuffer');
              const [translucentBuffer, opaqueBuffer, imageWidth, imageHeight] =
                await loadRGBABuffersFromFile(imageBuffer);

              if (imageWidth !== width || imageHeight !== height) {
                throw new Error(PATCH_TEXTURE_CHANGES_ERROR);
              }

              return { textureIndex, translucentBuffer, opaqueBuffer };
            } catch {
              throw new Error(PATCH_TEXTURE_CHANGES_ERROR);
            }
          }
        )
      );

      const currentModelData = getState().modelData;

      if (
        currentModelData.polygonBufferKey !== polygonBufferKey ||
        currentModelData.textureDefs !== textureDefs
      ) {
        throw new Error(PATCH_RESOURCE_CHANGED_ERROR);
      }

      const vertexColorUpdatesByModel = new Map<
        number,
        Map<number, NLColorRGBA>
      >();

      manifest.entries.forEach(({ type, entry }) => {
        if (type !== 'v-color') {
          throw new Error(PATCH_MODEL_CHANGES_ERROR);
        }

        const [modelIndex, meshIndex, polygonIndex, vertexIndex, color] = entry;
        const mesh = models[modelIndex]?.meshes[meshIndex];
        const vertex = mesh?.polygons[polygonIndex]?.vertices[vertexIndex];

        if (!mesh?.hasColoredVertices || !vertex?.colors) {
          throw new Error(PATCH_MODEL_CHANGES_ERROR);
        }

        if (
          !Array.isArray(color) ||
          color.length !== 4 ||
          !color.every(
            (channel) =>
              Number.isFinite(channel) && channel >= 0 && channel <= 1
          )
        ) {
          throw new Error(PATCH_MODEL_CHANGES_ERROR);
        }

        const colorOffset = vertex.contentAddress + O.Vertex.COLORS;

        if (colorOffset < 0 || colorOffset + 3 >= polygonBuffer.length) {
          throw new Error(PATCH_MODEL_CHANGES_ERROR);
        }

        const modelUpdates =
          vertexColorUpdatesByModel.get(modelIndex) ??
          new Map<number, NLColorRGBA>();
        modelUpdates.set(vertex.contentAddress, color);
        vertexColorUpdatesByModel.set(modelIndex, modelUpdates);
      });

      vertexColorUpdatesByModel.forEach((modelUpdates) => {
        modelUpdates.forEach((color, contentAddress) => {
          writeVertexColorToBuffer(polygonBuffer, contentAddress, color);
        });
      });
      const textureUpdates = decodedTextureUpdates.map(
        ({ textureIndex, translucentBuffer, opaqueBuffer }) => ({
          textureIndex,
          bufferKeys: {
            translucent: globalBuffers.add(translucentBuffer),
            opaque: globalBuffers.add(opaqueBuffer)
          }
        })
      );

      const result = {
        vertexColorUpdates: Array.from(
          vertexColorUpdatesByModel.entries(),
          ([modelIndex, modelUpdates]) => ({
            modelIndex,
            vertexColorUpdates: Array.from(
              modelUpdates.entries(),
              ([contentAddress, color]) => ({ contentAddress, color })
            )
          })
        ),
        textureUpdates
      };
      batch(() => {
        $modelData.value = produce($modelData.value, (state) => {
          const payload = result;
          payload?.vertexColorUpdates.forEach((vertexColorUpdate) => {
            applySelectedVertexColorFulfilled(state, {
              payload: vertexColorUpdate
            });
          });
          payload?.textureUpdates.forEach((textureUpdate) => {
            replaceTextureImageInState(state, textureUpdate);
          });
        });
      });
      return result;
    } catch (error) {
      showError({
        title: 'Patch could not be imported',
        message:
          error instanceof ModelDataPatchCompatibilityError
            ? createElement(
                'span',
                null,
                'This patch is for ',
                createElement('b', null, error.patchResource),
                ', but ',
                createElement('b', null, error.loadedResource),
                ' is currently open. Open the matching model and retry.'
              )
            : error instanceof Error
              ? error.message
              : 'This patch could not be read. Create or download it again and retry.'
      });
    }
  } catch {
    return undefined;
  }
};

export default loadModelDataPatch;
