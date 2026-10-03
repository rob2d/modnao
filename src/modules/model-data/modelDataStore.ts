import { TextureImageBufferKeys } from '@/utils/textures/TextureImageBufferKeys';
import { signal } from '@preact-signals/safe-react';
import { produce } from 'immer';
import {
  ApplySelectedVertexColorResult,
  ModelDataPatchTextureUpdate,
  ModelDataState,
  TextureHslSession
} from './modelDataTypes';

export const initialModelDataState: ModelDataState = {
  models: [],
  originalModels: [],
  textureDefs: [],
  loadTexturesState: 'idle',
  exportTextureFileState: 'idle',
  editedTextures: {},
  textureHslSessions: {},
  textureHistory: {},
  polygonFileName: undefined,
  textureFileName: undefined,
  textureFileType: undefined,
  resourceAttribs: undefined,
  hasEditedTextures: false,
  isLzssCompressed: false
};

export const applySelectedVertexColorFulfilled = (
  state: ModelDataState,
  {
    payload: { modelIndex, vertexColorUpdates }
  }: { payload: ApplySelectedVertexColorResult }
) => {
  const model = state.models[modelIndex];

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

export const replaceTextureImageInState = (
  state: ModelDataState,
  { textureIndex, bufferKeys }: ModelDataPatchTextureUpdate
) => {
  delete state.editedTextures[textureIndex];
  delete state.textureHslSessions[textureIndex];

  state.textureHistory[textureIndex] = state.textureHistory[textureIndex] || [];
  state.textureHistory[textureIndex].push({
    bufferKeys: state.textureDefs[textureIndex]
      .bufferKeys as TextureImageBufferKeys
  });

  state.textureDefs[textureIndex].bufferKeys = bufferKeys;
  state.hasEditedTextures = true;
};

export const $modelData = signal<ModelDataState>(initialModelDataState);

export function replaceTextureImage(payload: ModelDataPatchTextureUpdate) {
  $modelData.value = produce($modelData.value, (state) => {
    replaceTextureImageInState(state, payload);
  });
}

export function revertTextureImage({ textureIndex }: { textureIndex: number }) {
  $modelData.value = produce($modelData.value, (state) => {
    if (
      !state.textureHistory[textureIndex] ||
      state.textureHistory[textureIndex].length === 0
    ) {
      return;
    }

    delete state.editedTextures[textureIndex];
    delete state.textureHslSessions[textureIndex];

    const textureHistory = state.textureHistory[textureIndex].pop();

    if (textureHistory) {
      state.textureDefs[textureIndex].bufferKeys.translucent =
        textureHistory.bufferKeys.translucent;
      state.textureDefs[textureIndex].bufferKeys.opaque =
        textureHistory.bufferKeys.opaque;
    }
  });
}

export function setTextureHslSession({
  textureIndex,
  session
}: {
  textureIndex: number;
  session: TextureHslSession;
}) {
  $modelData.value = produce($modelData.value, (state) => {
    state.textureHslSessions[textureIndex] = session;
  });
}
