import type {
  AsyncState,
  NLUITextureDef,
  ResourceAttribs,
  TextureFileType
} from '@/types';
import { TextureImageBufferKeys } from '@/utils/textures/TextureImageBufferKeys';
import { batch, signal } from '@preact-signals/safe-react';
import { produce } from 'immer';
import {
  ApplySelectedVertexColorResult,
  ModelDataPatchTextureUpdate,
  ModelDataState,
  TextureHslSession
} from './modelDataTypes';

export const $models = signal<NLModel[]>([]);
export const $originalModels = signal<NLModel[]>([]);
export const $textureDefs = signal<NLUITextureDef[]>([]);
export const $resourceAttribs = signal<ResourceAttribs | undefined>(undefined);

export const $textureHistory = signal<ModelDataState['textureHistory']>({});
export const $editedTextures = signal<ModelDataState['editedTextures']>({});
export const $textureHslSessions = signal<ModelDataState['textureHslSessions']>(
  {}
);

export const $polygonFileName = signal<string | undefined>(undefined);
export const $textureFileName = signal<string | undefined>(undefined);
export const $textureFileType = signal<TextureFileType | undefined>(undefined);

export const $hasEditedTextures = signal(false);
export const $isLzssCompressed = signal(false);

export const $textureBufferKey = signal<string | undefined>(undefined);
export const $polygonBufferKey = signal<string | undefined>(undefined);

export const $loadTexturesState = signal<AsyncState>('idle');
export const $exportTextureFileState = signal<AsyncState>('idle');

export function resetModelData(
  preloadedState: ModelDataState = {
    models: [],
    originalModels: [],
    textureDefs: [],
    resourceAttribs: undefined,
    textureHistory: {},
    editedTextures: {},
    textureHslSessions: {},
    polygonFileName: undefined,
    textureFileName: undefined,
    textureFileType: undefined,
    hasEditedTextures: false,
    isLzssCompressed: false,
    textureBufferKey: undefined,
    polygonBufferKey: undefined,
    loadTexturesState: 'idle',
    exportTextureFileState: 'idle'
  }
) {
  batch(() => {
    $models.value = preloadedState.models;
    $originalModels.value = preloadedState.originalModels;
    $textureDefs.value = preloadedState.textureDefs;
    $resourceAttribs.value = preloadedState.resourceAttribs;
    $textureHistory.value = preloadedState.textureHistory;
    $editedTextures.value = preloadedState.editedTextures;
    $textureHslSessions.value = preloadedState.textureHslSessions;
    $polygonFileName.value = preloadedState.polygonFileName;
    $textureFileName.value = preloadedState.textureFileName;
    $textureFileType.value = preloadedState.textureFileType;
    $hasEditedTextures.value = preloadedState.hasEditedTextures;
    $isLzssCompressed.value = preloadedState.isLzssCompressed;
    $textureBufferKey.value = preloadedState.textureBufferKey;
    $polygonBufferKey.value = preloadedState.polygonBufferKey;
    $loadTexturesState.value = preloadedState.loadTexturesState;
    $exportTextureFileState.value = preloadedState.exportTextureFileState;
  });
}

export const applySelectedVertexColorFulfilled = (
  models: NLModel[],
  {
    payload: { modelIndex, vertexColorUpdates }
  }: { payload: ApplySelectedVertexColorResult }
) => {
  const model = models[modelIndex];

  if (!model || vertexColorUpdates.length === 0) {
    return;
  }

  const vertexColorUpdatesByAddress = new Map(
    vertexColorUpdates.map(({ contentAddress, color }) => [
      contentAddress,
      color
    ])
  );

  model.meshes.forEach((mesh) => {
    if (!mesh.hasColoredVertices) {
      return;
    }

    mesh.polygons.forEach((polygon) => {
      polygon.vertices.forEach((vertex) => {
        const color = vertexColorUpdatesByAddress.get(vertex.contentAddress);

        if (!color) {
          return;
        }

        vertex.colors = color;
      });
    });
  });
};

export function replaceTextureImage({
  textureIndex,
  bufferKeys
}: ModelDataPatchTextureUpdate) {
  batch(() => {
    $editedTextures.value = produce($editedTextures.value, (editedTextures) => {
      delete editedTextures[textureIndex];
    });
    $textureHslSessions.value = produce(
      $textureHslSessions.value,
      (textureHslSessions) => {
        delete textureHslSessions[textureIndex];
      }
    );
    $textureHistory.value = produce($textureHistory.value, (textureHistory) => {
      textureHistory[textureIndex] = textureHistory[textureIndex] || [];
      textureHistory[textureIndex].push({
        bufferKeys: $textureDefs.value[textureIndex]
          .bufferKeys as TextureImageBufferKeys
      });
    });
    $textureDefs.value = produce($textureDefs.value, (textureDefs) => {
      textureDefs[textureIndex].bufferKeys = bufferKeys;
    });
    $hasEditedTextures.value = true;
  });
}

export function revertTextureImage({ textureIndex }: { textureIndex: number }) {
  const textureHistory = $textureHistory.value[textureIndex];

  if (!textureHistory?.length) {
    return;
  }

  const previousTexture = textureHistory[textureHistory.length - 1];

  batch(() => {
    $editedTextures.value = produce($editedTextures.value, (editedTextures) => {
      delete editedTextures[textureIndex];
    });
    $textureHslSessions.value = produce(
      $textureHslSessions.value,
      (textureHslSessions) => {
        delete textureHslSessions[textureIndex];
      }
    );
    $textureHistory.value = produce($textureHistory.value, (textureHistory) => {
      textureHistory[textureIndex].pop();
    });
    $textureDefs.value = produce($textureDefs.value, (textureDefs) => {
      textureDefs[textureIndex].bufferKeys.translucent =
        previousTexture.bufferKeys.translucent;
      textureDefs[textureIndex].bufferKeys.opaque =
        previousTexture.bufferKeys.opaque;
    });
  });
}

export function setTextureHslSession({
  textureIndex,
  session
}: {
  textureIndex: number;
  session: TextureHslSession;
}) {
  $textureHslSessions.value = produce(
    $textureHslSessions.value,
    (textureHslSessions) => {
      textureHslSessions[textureIndex] = session;
    }
  );
}
