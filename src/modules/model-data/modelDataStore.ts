import type {
  AsyncState,
  NLUITextureDef,
  ResourceAttribs,
  TextureFileType
} from '@/types';
import { batch, observable } from '@legendapp/state';
import { produce } from 'immer';
import {
  ApplySelectedVertexColorResult,
  ModelDataPatchTextureUpdate,
  ModelDataState,
  TextureHslSession
} from './modelDataTypes';

export const $models = observable<NLModel[]>([]);
export const $originalModels = observable<NLModel[]>([]);
export const $textureDefs = observable<NLUITextureDef[]>([]);
export const $resourceAttribs = observable<ResourceAttribs | undefined>(
  undefined
);

export const $textureHistory = observable<ModelDataState['textureHistory']>({});
export const $editedTextures = observable<ModelDataState['editedTextures']>({});
export const $textureHslSessions = observable<
  ModelDataState['textureHslSessions']
>({});

export const $polygonFileName = observable<string | undefined>(undefined);
export const $textureFileName = observable<string | undefined>(undefined);
export const $textureFileType = observable<TextureFileType | undefined>(
  undefined
);

export const $hasEditedTextures = observable(false);
export const $isLzssCompressed = observable(false);

export const $textureBufferKey = observable<string | undefined>(undefined);
export const $polygonBufferKey = observable<string | undefined>(undefined);

export const $loadTexturesState = observable<AsyncState>('idle');
export const $exportTextureFileState = observable<AsyncState>('idle');

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
    $models.set(preloadedState.models);
    $originalModels.set(preloadedState.originalModels);
    $textureDefs.set(preloadedState.textureDefs);
    $resourceAttribs.set(preloadedState.resourceAttribs);
    $textureHistory.set(preloadedState.textureHistory);
    $editedTextures.set(preloadedState.editedTextures);
    $textureHslSessions.set(preloadedState.textureHslSessions);
    $polygonFileName.set(preloadedState.polygonFileName);
    $textureFileName.set(preloadedState.textureFileName);
    $textureFileType.set(preloadedState.textureFileType);
    $hasEditedTextures.set(preloadedState.hasEditedTextures);
    $isLzssCompressed.set(preloadedState.isLzssCompressed);
    $textureBufferKey.set(preloadedState.textureBufferKey);
    $polygonBufferKey.set(preloadedState.polygonBufferKey);
    $loadTexturesState.set(preloadedState.loadTexturesState);
    $exportTextureFileState.set(preloadedState.exportTextureFileState);
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
    $editedTextures.set(
      produce($editedTextures.get(), (editedTextures) => {
        delete editedTextures[textureIndex];
      })
    );
    $textureHslSessions.set(
      produce($textureHslSessions.get(), (textureHslSessions) => {
        delete textureHslSessions[textureIndex];
      })
    );
    $textureHistory.set(
      produce($textureHistory.get(), (textureHistory) => {
        textureHistory[textureIndex] = textureHistory[textureIndex] || [];
        textureHistory[textureIndex].push({
          bufferKeys: $textureDefs.get()[textureIndex].bufferKeys
        });
      })
    );
    $textureDefs.set(
      produce($textureDefs.get(), (textureDefs) => {
        textureDefs[textureIndex].bufferKeys = bufferKeys;
      })
    );
    $hasEditedTextures.set(true);
  });
}

export function revertTextureImage({ textureIndex }: { textureIndex: number }) {
  const textureHistory = $textureHistory.get()[textureIndex];

  if (!textureHistory?.length) {
    return;
  }

  const previousTexture = textureHistory[textureHistory.length - 1];

  batch(() => {
    $editedTextures.set(
      produce($editedTextures.get(), (editedTextures) => {
        delete editedTextures[textureIndex];
      })
    );
    $textureHslSessions.set(
      produce($textureHslSessions.get(), (textureHslSessions) => {
        delete textureHslSessions[textureIndex];
      })
    );
    $textureHistory.set(
      produce($textureHistory.get(), (textureHistory) => {
        textureHistory[textureIndex].pop();
      })
    );
    $textureDefs.set(
      produce($textureDefs.get(), (textureDefs) => {
        textureDefs[textureIndex].bufferKeys.translucent =
          previousTexture.bufferKeys.translucent;
        textureDefs[textureIndex].bufferKeys.opaque =
          previousTexture.bufferKeys.opaque;
      })
    );
  });
}

export function setTextureHslSession({
  textureIndex,
  session
}: {
  textureIndex: number;
  session: TextureHslSession;
}) {
  $textureHslSessions.set(
    produce($textureHslSessions.get(), (textureHslSessions) => {
      textureHslSessions[textureIndex] = session;
    })
  );
}
