import { createSelector } from '@reduxjs/toolkit';
import { AppState } from './store';
import ContentViewMode from '../types/ContentViewMode';
import { NLUITextureDef } from '@/types/NLAbstractions';

export const selectModelIndex = (s: AppState) => s.objectViewer.modelIndex;
export const selectTextureIndex = (s: AppState) => s.objectViewer.textureIndex;
export const selectObjectKey = (s: AppState) => s.objectViewer.objectKey;
export const selectModels = (s: AppState) => s.modelData.models;
export const selectResourceAttribs = (s: AppState) =>
  s.modelData.resourceAttribs;

export const selectHasLoadedPolygonFile = (s: AppState) =>
  Boolean(s.modelData.polygonFileName);
export const selectHasLoadedTextureFile = (s: AppState) =>
  Boolean(s.modelData.textureFileName);
export const selectHasEditedTextures = (s: AppState) =>
  s.modelData.hasEditedTextures;
export const selectModelCount = createSelector(
  selectModels,
  (models) => models.length
);
export const selectMeshSelectionType = (s: AppState) =>
  s.objectViewer.meshSelectionType;
export const selectTextureDefs = (s: AppState) => s.modelData.textureDefs;
export const selectTextureBufferUrlHistory = (s: AppState) =>
  s.modelData.textureHistory;

/**
 * get a set of base texture urls to detect presence in O(1)
 */
export const selectUneditedTextureUrls = createSelector(
  selectTextureDefs,
  selectTextureBufferUrlHistory,
  (defs, history) => {
    const urlSet = new Set<string>();
    defs.forEach((d) => {
      if (d.bufferUrls.translucent) {
        urlSet.add(d.bufferUrls.translucent);
      }

      if (d.bufferUrls.opaque) {
        urlSet.add(d.bufferUrls.opaque);
      }
    });

    Object.keys(history).forEach((k) => {
      history[Number(k)].forEach(({ bufferUrls: { opaque, translucent } }) => {
        if (opaque) {
          urlSet.add(opaque);
        }
        if (translucent) {
          urlSet.add(translucent);
        }
      });
    });

    return urlSet;
  }
);

export const selectEditedTextures = (s: AppState) => s.modelData.editedTextures;

/**
 * combines texture defs with any edited data urls
 * to display on scene in real-time
 */
export const selectUpdatedTextureDefs = createSelector(
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
  selectModels,
  (modelIndex, models) => models?.[modelIndex]
);

export type DisplayedMesh = NLMesh & { textureHash: string };

const getDisplayedMeshes = (model: NLModel, textureDefs: NLUITextureDef[]) =>
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
  }, []);

export const selectDisplayedMeshes = createSelector(
  selectModel,
  selectUpdatedTextureDefs,
  (model: NLModel, textureDefs: NLUITextureDef[]) =>
    getDisplayedMeshes(model, textureDefs)
);

export const selectAllDisplayedMeshes = createSelector(
  selectModels,
  selectUpdatedTextureDefs,
  (models, textureDef) =>
    models.map((model) => getDisplayedMeshes(model, textureDef))
);

/** infers mesh selection from selected object key */
export const selectObjectMeshIndex = createSelector(
  selectObjectKey,
  (objectKey: string | undefined) =>
    !objectKey ? -1 : Number(objectKey.split('_')[0])
);

/** infers mesh selection from selected object key */
export const selectObjectPolygonIndex = createSelector(
  selectObjectKey,
  selectMeshSelectionType,
  (objectKey: string | undefined, type) => {
    if (type === 'mesh' || !objectKey) {
      return -1;
    }
    return Number(objectKey.split('_')[1]);
  }
);

export const selectMesh = createSelector(
  selectModel,
  selectObjectMeshIndex,
  (model, meshIndex) => model?.meshes[meshIndex] || undefined
);

export const selectReplacementImage = (s: AppState) =>
  s.replaceTexture.replacementImage;

export const selectReplacementTextureIndex = (s: AppState) =>
  s.replaceTexture.textureIndex;

export const selectIsAppInfoDialogShown = (s: AppState) =>
  s.dialogs.dialogShown === 'app-info';

export const selectIsFileSupportDialogShown = (s: AppState) =>
  s.dialogs.dialogShown === 'file-support-info';

export const selectCanExportTextures = createSelector(
  selectTextureFileName,
  (textureFileName) => Boolean(textureFileName)
);

export const selectTextureFileType = (s: AppState) =>
  s.modelData.textureFileType;

export const selectHasCompressedTextures = (s: AppState) =>
  s.modelData.isLzssCompressed;

export const selectContentViewMode = createSelector(
  selectHasLoadedTextureFile,
  selectHasLoadedPolygonFile,
  (hasLoadedTextures, hasLoadedPolygons): ContentViewMode => {
    if (hasLoadedTextures && !hasLoadedPolygons) {
      return 'textures';
    } else if (hasLoadedPolygons) {
      return 'polygons';
    } else {
      return 'welcome';
    }
  }
);

export const selectSelectedTexture = createSelector(
  selectContentViewMode,
  selectModel,
  selectObjectMeshIndex,
  selectTextureIndex,
  (contentViewMode, model, meshIndex, textureIndex) => {
    switch (contentViewMode) {
      case 'textures': {
        return textureIndex;
      }
      case 'polygons': {
        const textureIndex = model?.meshes?.[meshIndex]?.textureIndex;
        return typeof textureIndex === 'number' ? textureIndex : -1;
      }
      default:
      case 'welcome': {
        return -1;
      }
    }
  }
);

export const selectObjectIndex = createSelector(
  selectContentViewMode,
  selectModelIndex,
  selectTextureIndex,
  (viewMode, modelIndex, textureIndex) => {
    switch (viewMode) {
      case 'polygons':
        return modelIndex;
      case 'textures':
        return textureIndex;
      default:
        return -1;
    }
  }
);

export const selectObjectCount = createSelector(
  selectContentViewMode,
  selectModels,
  selectTextureDefs,
  (viewMode, models, textureDefs) => {
    switch (viewMode) {
      case 'polygons':
        return models.length;
      case 'textures':
        return textureDefs.length;
      default:
        return 0;
    }
  }
);
