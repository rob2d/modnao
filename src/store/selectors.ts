import { createSelector } from '@reduxjs/toolkit';
import { AppState } from './store';
import { SourceTextureData } from '@/utils/textures/SourceTextureData';
import { objectUrlToBuffer } from '@/utils/data';

export const selectModelIndex = (s: AppState) => s.modelViewer.modelIndex;

export const selectObjectKey = (s: AppState) => s.modelViewer.objectKey;

export const selectStageModels = (s: AppState) => s.modelData.models;

export const selectHasLoadedTextureFile = (s: AppState) =>
  s.modelData.textureFileName;

export const selectHasEditedTextures = (s: AppState) =>
  s.modelData.hasEditedTextures;

export const selectHasCompressedTextures = (s: AppState) =>
  s.modelData.hasCompressedTextures;

export const selectModelCount = createSelector(
  selectStageModels,
  (models) => models.length
);
export const selectObjectSelectionType = (s: AppState) =>
  s.modelViewer.objectSelectionType;

export const selectTextureDefs = (s: AppState) => s.modelData.textureDefs;
export const selectPrevBufferUrls = (s: AppState) => s.modelData.prevBufferUrls;
/**
 * get a set of base texture urls to detect presence in O(1)
 */
export const selectUneditedTextureUrls = createSelector(
  selectTextureDefs,
  selectPrevBufferUrls,
  (defs, bufferUrls) => {
    const urlSet = new Set<string>();
    defs.forEach((d) => {
      if (d.bufferUrls.translucent) {
        urlSet.add(d.bufferUrls.translucent);
      }

      if (d.bufferUrls.opaque) {
        urlSet.add(d.bufferUrls.opaque);
      }
    });

    Object.keys(bufferUrls).forEach((k) => {
      (bufferUrls[Number(k)] as SourceTextureData[]).forEach(
        (set: SourceTextureData) => {
          urlSet.add(set.opaque);
          urlSet.add(set.translucent);
        }
      );
    });

    return urlSet;
  }
);

export const selectEditedTextures = (s: AppState) => s.modelData.editedTextures;

/**
 * combines texture defs with any edited data urls
 * to display on scene in real-time
 */
export const selectSceneTextureDefs = createSelector(
  selectTextureDefs,
  selectEditedTextures,
  (textureDefs, bufferUrlEntries): typeof textureDefs => {
    const returnTextures = [...textureDefs];
    Object.entries(bufferUrlEntries).forEach(
      ([index, { bufferUrls, dataUrls }]) => {
        const i = Number.parseInt(index);
        const entry = { ...returnTextures[i] };
        entry.bufferUrls = {
          ...entry.bufferUrls,
          ...bufferUrls
        };

        entry.dataUrls = {
          ...entry.dataUrls,
          ...dataUrls
        };
        returnTextures[i] = entry;
      }
    );

    return returnTextures;
  }
);
export const selectPolygonFileName = (s: AppState) =>
  s.modelData.polygonFileName;

export const selectTextureFileName = (s: AppState) =>
  s.modelData.textureFileName;

export const selectModel = createSelector(
  selectModelIndex,
  selectStageModels,
  (modelIndex, models) => models?.[modelIndex]
);
export type DisplayedMesh = NLMesh & { textureHash: string };
export const selectDisplayedMeshes = createSelector(
  selectModel,
  selectSceneTextureDefs,
  (model, textureDefs) =>
    (model?.meshes || []).reduce<DisplayedMesh[]>((meshes, m) => {
      const tDef = textureDefs[m.textureIndex];
      if (!tDef) {
        meshes.push({ ...m, textureHash: '' });
        return meshes;
      }

      const url = tDef.bufferUrls[m.isOpaque ? 'opaque' : 'translucent'];
      const { hRepeat, vRepeat } = m.textureWrappingFlags;
      const textureHash = `${url}-${hRepeat ? 1 : 0}-${vRepeat ? 1 : 0}`;

      meshes.push({ ...m, textureHash });
      return meshes;
    }, [])
);

/** infers mesh selection from selected object key */
export const selectObjectMeshIndex = createSelector(
  selectObjectKey,
  (objectKey: string | undefined) =>
    !objectKey ? -1 : Number(objectKey.split('-')[0])
);

export const selectIsMeshOpaque = createSelector(
  selectModel,
  selectObjectMeshIndex,
  (model, meshIndex) => model?.meshes[meshIndex]?.isOpaque
);

export const selectPixelDataUrls = createSelector(
  selectTextureDefs,
  async (textureDefs) => {
    for await (const def of textureDefs) {
      for await (const [type, url] of Object.entries(def.bufferUrls)) {
        const pixels = new Uint8ClampedArray(await objectUrlToBuffer(url));
      }
    }
  }
);
